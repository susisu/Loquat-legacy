/*
 * Loquat / prim.js
 * copyright (c) 2014 Susisu
 *
 * primitive parser combinators
 */

"use strict";

function end () {
    module.exports = Object.freeze({
        /* constructors */
        "State"     : State,
        "Result"    : Result,
        "Parser"    : Parser,
        "LazyParser": LazyParser,

        /* utility functions */
        "parse": parse,

        /* functor */
        "fmap": fmap,

        /* applicative functor */
        "pure" : pure,
        "ap"   : ap,
        "left" : left,
        "right": right,

        /* monad */
        "bind": bind,
        "then": then,
        "fail": fail,

        /* monad plus */
        "mzero": mzero,
        "mplus": mplus,

        "label"     : label,
        "labels"    : labels,
        "unexpected": unexpected,
        "try"       : attempt,
        "attempt"   : attempt,
        "lookAhead" : lookAhead,
        "manyAccum" : manyAccum,
        "many"      : many,
        "skipMany"  : skipMany,
        "tokens"    : tokens,
        "token"     : token,
        "tokenPrim" : tokenPrim,

        /* state manipulation */
        "getState"    : getState,
        "setState"    : setState,
        "updateState" : updateState,
        "getInput"    : getInput,
        "setInput"    : setInput,
        "getPosition" : getPosition,
        "setPosition" : setPosition,
        "getUserState": getUserState,
        "setUserState": setUserState
    });
}

var lq = Object.freeze({
    "error": require("./error"),
    "pos"  : require("./pos"),
    "util" : require("./util")
});


function State (input, position, userState) {
    this.input     = input;
    this.position  = position;
    this.userState = userState;
}

Object.defineProperties(State, {
    "equals": { "value": function (stateA, stateB, inputEquals, userStateEquals) {
        return (inputEquals === undefined
                ? stateA.input === stateB.input
                : inputEquals(stateA.input, stateB.input))
            && lq.pos.SourcePos.equals(stateA.position, stateB.position)
            && (userStateEquals === undefined
                ? stateA.userState === stateB.userState
                : userStateEquals(stateA.userState, stateB.userState));
    }}
});

Object.defineProperties(State.prototype, {
    "setInput": { "value": function (input) {
        return new State(input, this.position, this.userState);
    }},

    "setPosition": { "value": function (position) {
        return new State(this.input, position, this.userState);
    }},

    "setUserState": { "value": function (userState) {
        return new State(this.input, this.position, userState);
    }}
});

function Result (consumed, succeeded, value, state, error) {
    this.consumed  = consumed;
    this.succeeded = succeeded;
    this.value     = value;
    this.state     = state;
    this.error     = error;
}

Object.defineProperties(Result, {
    "equals": { "value": function (resultA, resultB, valueEquals, inputEquals, userStateEquals) {
        return resultA.consumed === resultB.consumed
            && resultA.succeeded === resultB.succeeded
            && (valueEquals === undefined
                ? resultA.value === resultB.value
                : valueEquals(resultA.value, resultB.value))
            && (resultA.state === undefined || resultB.state === undefined
                ? resultA.state === resultB.state
                : State.equals(resultA.state, resultB.state, inputEquals, userStateEquals))
            && lq.error.ParseError.equals(resultA.error, resultB.error);
    }}
});

function Parser (parserFunc) {
    this.parserFunc = parserFunc;
}

Object.defineProperties(Parser.prototype, {
    "run": { "value": function (state, consumedSucceeded, consumedError, emptySucceeded, emptyError) {
        return this.parserFunc(state, consumedSucceeded, consumedError, emptySucceeded, emptyError);
    }},

    "parse": { "value": function (state) {
        return this.run(state, consumedSucceeded, consumedError, emptySucceeded, emptyError);

        function consumedSucceeded (value, state, error) {
            return new Result(true, true, value, state, error);
        }

        function consumedError (error) {
            return new Result(true, false, undefined, undefined, error);
        }

        function emptySucceeded (value, state, error) {
            return new Result(false, true, value, state, error);
        }

        function emptyError (error) {
            return new Result(false, false, undefined, undefined, error);
        }
    }}
});


function LazyParser (generator) {
    this.generator = generator;
    this.parser    = undefined;
}

Object.defineProperties(LazyParser.prototype, {
    "init": { "value": function () {
        if (this.parser === undefined) {
            this.parser = this.generator();
        }
    }},

    "run": { "value": function (state, consumedSucceeded, consumedError, emptySucceeded, emptyError) {
        this.init();
        return this.parser.run(state, consumedSucceeded, consumedError, emptySucceeded, emptyError);
    }},

    "parse": { "value": function (state) {
        this.init();
        return this.parser.parse(state);
    }}
});


function parse (parser, name, input, userState) {
    var result = parser.parse(new State(input, lq.pos.SourcePos.init(name), userState));
    return result.succeeded
        ? { "succeeded": true, "value": result.value }
        : { "succeeded": false, "error": result.error };
}


function fmap (func) {
    return function (parser) {
        return new Parser(function (state, csuc, cerr, esuc, eerr) {
            return parser.run(
                state,
                function (value, state, error) {
                    return csuc(func(value), state, error);
                },
                cerr,
                function (value, state, error) {
                    return esuc(func(value), state, error);
                },
                eerr
            );
        });
    };
}

function pure (value) {
    return new Parser(function (state, csuc, cerr, esuc, eerr) {
        return esuc(value, state, lq.error.ParseError.unknown(state.position));
    });
}

function ap (parserA, parserB) {
    return bind(
        parserA,
        function (valueA) {
            return bind(
                parserB,
                function (valueB) {
                    return pure(valueA(valueB));
                }
            );
        }
    );
}

function left (parserA, parserB) {
    return ap(fmap(former)(parserA), parserB);

    function former (x) {
        return function (y) {
            return x;
        };
    }
}

function right (parserA, parserB) {
    return ap(fmap(latter)(parserA), parserB);

    function latter (x) {
        return function (y) {
            return y;
        };
    }
}

function bind (parserA, func) {
    return new Parser(function (state, csuc, cerr, esuc, eerr) {
        var valueA;
        var stateA;
        var errorA;
        var cont = false;
        var consumed = false;
        var resultA = parserA.run(
            state,
            function (value, state, error) {
                cont = true;
                consumed = true;
                valueA = value;
                stateA = state;
                errorA = error;
            },
            cerr,
            function (value, state, error) {
                cont = true;
                valueA = value;
                stateA = state;
                errorA = error;
            },
            eerr
        );
        if (cont) {
            if (consumed) {
                return func(valueA).run(
                    stateA,
                    csuc,
                    cerr,
                    function (value, state, error) {
                        return csuc(value, state, lq.error.ParseError.merge(errorA, error));
                    },
                    function (error) {
                        return cerr(lq.error.ParseError.merge(errorA, error));
                    }
                );
            }
            else {
                return func(valueA).run(
                    stateA,
                    csuc,
                    cerr,
                    function (value, state, error) {
                        return esuc(value, state, lq.error.ParseError.merge(errorA, error));
                    },
                    function (error) {
                        return eerr(lq.error.ParseError.merge(errorA, error));
                    }
                );
            }
        }
        else {
            return resultA;
        }
    });
}

function then (parserA, parserB) {
    return bind(parserA, function (any) { return parserB; });
}

function fail (message) {
    return new Parser(function (state, csuc, cerr, esuc, eerr) {
        return eerr(
            new lq.error.ParseError(
                state.position,
                [new lq.error.ErrorMessage(lq.error.ErrorMessageType.MESSAGE, message)]
            )
        );
    });
}

var mzero = new Parser(function (state, csuc, cerr, esuc, eerr) {
    return eerr(lq.error.ParseError.unknown(state.position));
});

function mplus (parserA, parserB) {
    return new Parser(function (state, csuc, cerr, esuc, eerr) {
        var errorA;
        var cont = false;
        var resultA = parserA.run(
            state,
            csuc,
            cerr,
            esuc,
            function (error) {
                cont = true;
                errorA = error;
            }
        );
        if (cont) {
            return parserB.run(
                state,
                csuc,
                cerr,
                function (value, state, error) {
                    return esuc(value, state, lq.error.ParseError.merge(errorA, error));
                },
                function (error) {
                    return eerr(lq.error.ParseError.merge(errorA, error));
                }
            );
        }
        else {
            return resultA;
        }
    });
}

function label (parser, message) {
    return labels(parser, [message]);
}

function labels (parser, messages) {
    return new Parser(function (state, csuc, cerr, esuc, eerr) {
        return parser.run(
            state,
            csuc,
            cerr,
            function (value, state, error) {
                return esuc(value, state, error.isUnknown() ? error : setExpectMessages(error, messages));
            },
            function (error) {
                return eerr(setExpectMessages(error, messages));
            }
        );
    });

    function setExpectMessages(error, messages) {
        return messages.length === 0
             ? error.setSpecificTypeMessages(lq.error.ErrorMessageType.EXPECT, [""])
             : error.setSpecificTypeMessages(lq.error.ErrorMessageType.EXPECT, messages);
    }
}

function unexpected (message) {
    return new Parser(function (state, csuc, cerr, esuc, eerr) {
        return eerr(
            new lq.error.ParseError(
                state.position,
                [new lq.error.ErrorMessage(lq.error.ErrorMessageType.UNEXPECT, message)]
            )
        );
    });
}

function attempt (parser) {
    return new Parser(function (state, csuc, cerr, esuc, eerr) {
        return parser.run(state, csuc, eerr, esuc, eerr);
    });
}

function lookAhead (parser) {
    return new Parser(function (state, csuc, cerr, esuc, eerr) {
        return parser.run(state, esuc_, cerr, esuc_, eerr);

        function esuc_ (value, state_, error_) {
            return esuc(value, state, lq.error.ParseError.unknown(state.position));
        }
    });
}

function manyAccum (accumulate, parser) {
    return new Parser(function (state, csuc, cerr, esuc, eerr) {
        var accum = [];
        var consumed = false;
        var stop = false;
        var currentState = state;
        var result;
        while (!stop) {
            result = parser.run(currentState, csuc_, cerr_, esuc_, eerr_);
        }
        return result;

        function csuc_ (value, state, error) {
            consumed = true;
            accum = accumulate(value, accum);
            currentState = state;
        }

        function cerr_ (error) {
            consumed = true;
            stop = true;
            return cerr(error);
        }

        function esuc_ (value, state, error) {
            throw new Error("'many' is applied to a parser that accepts an empty string");
        }

        function eerr_ (error) {
            stop = true;
            if (consumed) {
                return csuc(accum, currentState, error);
            }
            else {
                return esuc(accum, currentState, error);
            }
        }
    });
}

function many (parser) {
    return new Parser(function (state, csuc, cerr, esuc, eerr) {
        var accum = [];
        return manyAccum(
            function (value, accum_) {
                accum.push(value);
                return accum_;
            },
            parser
        ).run(
            state,
            function (value, state, error) {
                return csuc(accum, state, error);
            },
            cerr,
            function (value, state, error) {
                return esuc(accum, state, error);
            },
            eerr
        );
    });
}

function skipMany (parser) {
    return then(
        manyAccum(
            function (value, accum) {
                return [];
            },
            parser
        ),
        pure(undefined)
    );
}

function tokens (tokensToString, calcNextPos, expectedTokens, tokenEquals) {
    return new Parser(function (state, csuc, cerr, esuc, eerr) {
        var restInput = state.input;
        for (var index = 0; index < expectedTokens.length; index ++) {
            var unconsed = lq.util.uncons(restInput);
            if (unconsed.length === 0) {
                if (index === 0) {
                    return eerr(eofError());
                }
                else {
                    return cerr(eofError());
                }
            }
            else {
                if (equals(expectedTokens[index], unconsed[0])) {
                    restInput = unconsed[1];
                }
                else {
                    if (index === 0) {
                        return eerr(expectError(unconsed[0]));
                    }
                    else {
                        return cerr(expectError(unconsed[0]));
                    }
                }
            }
        }
        if (index === 0) {
            return esuc([], state, lq.error.ParseError.unknown(state.position));
        }
        else {
            var newPosition = calcNextPos(state.position, expectedTokens);
            return csuc(
                expectedTokens,
                new State(restInput, newPosition, state.userState),
                lq.error.ParseError.unknown(newPosition)
            );
        }

        function equals (tokenA, tokenB) {
            if (tokenEquals === undefined) {
                return tokenA === tokenB;
            }
            else {
                return tokenEquals(tokenA, tokenB);
            }
        }

        function eofError () {
            return new lq.error.ParseError(
                state.position,
                [
                    new lq.error.ErrorMessage(
                        lq.error.ErrorMessageType.SYSTEM_UNEXPECT,
                        ""
                    ),
                    new lq.error.ErrorMessage(
                        lq.error.ErrorMessageType.EXPECT,
                        tokensToString(expectedTokens)
                    )
                ]
            );
        }

        function expectError (token) {
            return new lq.error.ParseError(
                state.position,
                [
                    new lq.error.ErrorMessage(
                        lq.error.ErrorMessageType.SYSTEM_UNEXPECT,
                        tokensToString([token])
                    ),
                    new lq.error.ErrorMessage(
                        lq.error.ErrorMessageType.EXPECT,
                        tokensToString(expectedTokens)
                    )
                ]
            );
        }
    });
}

function token (tokenToString, calcValue, calcPos) {
    return tokenPrim(tokenToString, calcValue, calcNextPos);

    function calcNextPos (position, token, rest) {
        var unconsed = lq.util.uncons(rest);
        if (unconsed.length === 0) {
            return calcPos(token);
        }
        else {
            return calcPos(unconsed[0]);
        }
    }
}

function tokenPrim (tokenToString, calcValue, calcNextPos, calcNextUserState) {
    return new Parser(function (state, csuc, cerr, esuc, eerr) {
        var unconsed = lq.util.uncons(state.input);
        if (unconsed.length === 0) {
            return eerr(systemUnexpected(state.position, ""));
        }
        else {
            var token = unconsed[0];
            var rest = unconsed[1];
            var result = calcValue(token);
            if (result.length === 0) {
                return eerr(systemUnexpected(state.position, tokenToString(token)));
            }
            else {
                var newPosition = calcNextPos(state.position, token, rest);
                var newUserState = calcNextUserState === undefined
                    ? state.userState
                    : calcNextUserState(state.userState, state.position, token, rest);
                return csuc(
                    result[0],
                    new State(rest, newPosition, newUserState),
                    lq.error.ParseError.unknown(newPosition)
                );
            }
        }
    });

    function systemUnexpected (position, message) {
        return new lq.error.ParseError(
            position,
            [new lq.error.ErrorMessage(lq.error.ErrorMessageType.SYSTEM_UNEXPECT, message)]
        );
    }
}

var getState = new Parser (function (state, csuc, cerr, esuc, eerr) {
    return esuc(state, state, lq.error.ParseError.unknown(state.position));
});

function setState (state) {
    return updateState(function(any) { return state; });
}

function updateState (func) {
    return new Parser (function (state, csuc, cerr, esuc, eerr) {
        var newState = func(state);
        return esuc(newState, newState, lq.error.ParseError.unknown(newState.position));
    });
}

var getInput = bind(getState, function (state) { return pure(state.input); });

function setInput (input) {
    return then(
        updateState(function (state) { return state.setInput(input); }),
        pure(undefined)
    );
}

var getPosition = bind(getState, function (state) { return pure(state.position); });


function setPosition (position) {
    return then(
        updateState(function (state) { return state.setPosition(position); }),
        pure(undefined)
    );
}

var getUserState = bind(getState, function (state) { return pure(state.userState); });

function setUserState (userState) {
    return then(
        updateState(function (state) { return state.setUserState(userState); }),
        pure(undefined)
    );
}


end();
