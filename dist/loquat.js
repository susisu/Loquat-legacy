/*!
 * Loquat 1.2.2
 * copyright (c) 2014-2015 Susisu | MIT License
 * https://github.com/susisu/Loquat
 */
var loquat =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

    /*
     * Loquat / loquat.js
     * copyright (c) 2014 Susisu
     *
     * parser combinators
     */

    "use strict";

    function end () {
        module.exports = Object.freeze(mergeObjects([
            {},
            lq.array,
            lq.char,
            lq.combinator,
            lq.error,
            lq.expr,
            lq.monad,
            lq.pos,
            lq.prim,
            lq.string,
            lq.sugar,
            lq.token,
            lq.util
        ]));
    }

    var lq = Object.freeze({
        "char"      : __webpack_require__(1),
        "combinator": __webpack_require__(6),
        "error"     : __webpack_require__(3),
        "expr"      : __webpack_require__(8),
        "monad"     : __webpack_require__(7),
        "pos"       : __webpack_require__(4),
        "prim"      : __webpack_require__(2),
        "sugar"     : __webpack_require__(9),
        "token"     : __webpack_require__(10),
        "util"      : __webpack_require__(5)
    });


    function mergeObjects (objects) {
        var merged = {};
        objects.forEach(function (object) {
            for (var key in object) {
                if (merged.hasOwnProperty(key)){
                    throw new Error("names conflicted: " + String(key));
                }
                else {
                    merged[key] = object[key];
                }
            }
        });
        return merged;
    }

    end();


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

    /*
     * Loquat / char.js
     * copyright (c) 2014 Susisu
     *
     * character parsers
     */

    "use strict";

    function end () {
        module.exports = Object.freeze({
            "string"   : string,
            "satisfy"  : satisfy,
            "oneOf"    : oneOf,
            "noneOf"   : noneOf,
            "space"    : space,
            "spaces"   : spaces,
            "newline"  : newline,
            "tab"      : tab,
            "upper"    : upper,
            "lower"    : lower,
            "alphaNum" : alphaNum,
            "letter"   : letter,
            "digit"    : digit,
            "hexDigit" : hexDigit,
            "octDigit" : octDigit,
            "char"     : char,
            "anyChar"  : anyChar,
            "manyChar" : manyChar,
            "manyChar1": manyChar1
        });
    }

    var lq = Object.freeze({
        "prim": __webpack_require__(2),
        "util": __webpack_require__(5)
    });


    function string (str) {
        return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
            var tabWidth = state.tabWidth;
            return lq.prim.fmap(function (chars) { return chars.join(""); })(
                lq.prim.tokens(
                    function (chars) { return lq.util.show(chars.join("")); },
                    function (position, chars) { return position.addString(chars.join(""), tabWidth); },
                    str.split("")
                )
            ).run(state, csuc, cerr, esuc, eerr);
        });
    }

    function satisfy (test) {
        return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
            var tabWidth = state.tabWidth;
            return lq.prim.tokenPrim(
                lq.util.show,
                function (char) { return test(char) ? [char] : [] ; },
                function (position, char, rest) { return position.addChar(char, tabWidth); }
            ).run(state, csuc, cerr, esuc, eerr);
        });
    }

    function oneOf (str) {
        return satisfy(function (char) { return char.length === 1 && str.indexOf(char) >= 0; });
    }

    function noneOf (str) {
        return satisfy(function (char) { return char.length === 1 && str.indexOf(char) < 0; });
    }

    var space = lq.prim.label(satisfy(lq.util.CharUtil.isSpace), "space");

    var spaces = lq.prim.label(lq.prim.skipMany(space), "white space");

    var newline = lq.prim.label(char("\n"), "new-line");

    var tab = lq.prim.label(char("\t"), "tab");

    var upper = lq.prim.label(satisfy(lq.util.CharUtil.isUpper), "uppercase letter");

    var lower = lq.prim.label(satisfy(lq.util.CharUtil.isLower), "lowercase letter");

    var alphaNum = lq.prim.label(satisfy(lq.util.CharUtil.isAlphaNum), "letter or digit");

    var letter = lq.prim.label(satisfy(lq.util.CharUtil.isAlpha), "letter");

    var digit = lq.prim.label(satisfy(lq.util.CharUtil.isDigit), "digit");

    var hexDigit = lq.prim.label(satisfy(lq.util.CharUtil.isHexDigit), "hexadecimal digit");

    var octDigit = lq.prim.label(satisfy(lq.util.CharUtil.isOctDigit), "octal digit");

    function char (expectedChar) {
        return lq.prim.label(
            satisfy(function (char) { return char === expectedChar; }),
            lq.util.show(expectedChar)
        );
    }

    var anyChar = satisfy(function (any) { return true; });

    function manyChar (parser) {
        return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
            var accum = "";
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
                accum += value;
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

    function manyChar1 (parser) {
        return lq.prim.bind(
            parser,
            function (head) {
                return lq.prim.bind(
                    manyChar(parser),
                    function (tail) {
                        return lq.prim.pure(head + tail);
                    }
                );
            }
        );
    }

    end();


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

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
            "getTabWidth" : getTabWidth,
            "setTabWidth" : setTabWidth,
            "getUserState": getUserState,
            "setUserState": setUserState
        });
    }

    var lq = Object.freeze({
        "error": __webpack_require__(3),
        "pos"  : __webpack_require__(4),
        "util" : __webpack_require__(5)
    });


    function State (input, position, tabWidth, userState) {
        this.input     = input;
        this.position  = position;
        this.tabWidth  = tabWidth;
        this.userState = userState;
    }

    Object.defineProperties(State, {
        "equals": { "value": function (stateA, stateB, inputEquals, userStateEquals) {
            return (inputEquals === undefined
                    ? stateA.input === stateB.input
                    : inputEquals(stateA.input, stateB.input))
                && lq.pos.SourcePos.equals(stateA.position, stateB.position)
                && stateA.tabWidth === stateB.tabWidth
                && (userStateEquals === undefined
                    ? stateA.userState === stateB.userState
                    : userStateEquals(stateA.userState, stateB.userState));
        }}
    });

    Object.defineProperties(State.prototype, {
        "setInput": { "value": function (input) {
            return new State(input, this.position, this.tabWidth, this.userState);
        }},

        "setPosition": { "value": function (position) {
            return new State(this.input, position, this.tabWidth, this.userState);
        }},

        "setTabWidth": { "value": function (tabWidth) {
            return new State(this.input, this.position, tabWidth, this.userState);
        }},

        "setUserState": { "value": function (userState) {
            return new State(this.input, this.position, this.tabWidth, userState);
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


    function parse (parser, name, input, tabWidth, userState) {
        var result = parser.parse(new State(input, lq.pos.SourcePos.init(name), tabWidth, userState));
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
                    new State(restInput, newPosition, state.tabWidth, state.userState),
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
                        new State(rest, newPosition, state.tabWidth, newUserState),
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

    var getTabWidth = bind(getState, function (state) { return pure(state.tabWidth); });

    function setTabWidth (tabWidth) {
        return then(
            updateState(function (state) { return state.setTabWidth(tabWidth); }),
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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

    /*
     * Loquat / error.js
     * copyright (c) 2014 Susisu
     *
     * parse errors
     */

    "use strict";

    function end () {
        module.exports = Object.freeze({
            "ErrorMessage"    : ErrorMessage,
            "ErrorMessageType": ErrorMessageType,
            "ParseError"      : ParseError
        });
    }

    var lq = Object.freeze({
        "pos" : __webpack_require__(4),
        "util": __webpack_require__(5)
    });


    function ErrorMessage (type, message) {
        this.type    = type;
        this.message = message;
    }

    Object.defineProperties(ErrorMessage, {
        "equals": { "value": function (messageA, messageB) {
            return messageA.type === messageB.type
                && messageA.message === messageB.message;
        }},

        "messagesToString": { "value": function (messages) {
            if (messages.length === 0) {
                return "unknown parse error";
            }
            else {
                var systemUnexpects = [];
                var unexpects       = [];
                var expects         = [];
                var defaultMessages = [];
                for (var i = 0; i < messages.length; i ++) {
                    switch (messages[i].type) {
                        case ErrorMessageType.SYSTEM_UNEXPECT:
                            systemUnexpects.push(messages[i].message);
                            break;
                        case ErrorMessageType.UNEXPECT:
                            unexpects.push(messages[i].message);
                            break;
                        case ErrorMessageType.EXPECT:
                            expects.push(messages[i].message);
                            break;
                        case ErrorMessageType.MESSAGE:
                            defaultMessages.push(messages[i].message);
                            break;
                    }
                }
                return clean([
                    unexpects.length === 0 && systemUnexpects.length !== 0
                        ? systemUnexpects[0] === ""
                            ? "unexpected end of input"
                            : "unexpected " + systemUnexpects[0]
                        : "",
                    toStringWithDescription("unexpected", clean(unexpects)),
                    toStringWithDescription("expecting", clean(expects)),
                    toStringWithDescription("", clean(defaultMessages))
                ]).join("\n");
            }

            function clean (messages) {
                return messages.filter(function (element, index, array) {
                    return array.indexOf(element) === index
                        && element                !== "";
                });
            }

            function separateByCommasOr (messages) {
                return messages.length <= 1
                     ? messages.toString()
                     : messages.slice(0, messages.length - 1).join(", ") + " or " + messages[messages.length - 1];
            }

            function toStringWithDescription (description, messages) {
                return messages.length === 0
                     ? ""
                     : (description === "" ? "" : description + " ") + separateByCommasOr(messages);
            }
        }}
    });


    var ErrorMessageType = Object.freeze({
        "SYSTEM_UNEXPECT": "systemUnexpect",
        "UNEXPECT": "unexpect",
        "EXPECT": "expect",
        "MESSAGE": "message"
    });


    function ParseError (position, messages) {
        this.position = position;
        this.messages = messages;
    }

    Object.defineProperties(ParseError, {
        "unknown": { "value": function (position) {
            return new ParseError(position, []);
        }},

        "equals": { "value": function (errorA, errorB) {
            return lq.pos.SourcePos.equals(errorA.position, errorB.position)
                && lq.util.ArrayUtil.equals(errorA.messages, errorB.messages, ErrorMessage.equals);
        }},

        "merge": { "value": function (errorA, errorB) {
            var result = lq.pos.SourcePos.compare(errorA.position, errorB.position);
            return errorB.isUnknown() && !errorA.isUnknown() ? errorA
                 : errorA.isUnknown() && !errorB.isUnknown() ? errorB
                 : result > 0                                ? errorA
                 : result < 0                                ? errorB
                                                             : errorA.addMessages(errorB.messages);
        }}
    });

    Object.defineProperties(ParseError.prototype, {
        "toString": { "value": function () {
            return this.position.toString() + ":\n" + ErrorMessage.messagesToString(this.messages);
        }},

        "isUnknown": { "value": function () {
            return this.messages.length === 0;
        }},

        "clone": { "value": function () {
            return new ParseError(this.position.clone(), this.messages.slice());
        }},

        "setPosition": { "value": function (position) {
            return new ParseError(position, this.messages);
        }},

        "setMessages": { "value": function (messages) {
            return new ParseError(this.position, messages);
        }},

        "setSpecificTypeMessages": { "value": function (type, messages) {
            return new ParseError(
                this.position,
                this.messages.filter(function (message) { return message.type !== type; })
                    .concat(messages.map(function (message) { return new ErrorMessage(type, message); }))
            );
        }},

        "addMessages": { "value": function (messages) {
            return new ParseError(this.position, this.messages.concat(messages));
        }}
    });


    end();


/***/ },
/* 4 */
/***/ function(module, exports) {

    /*
     * Loquat / pos.js
     * copyright (c) 2014 Susisu
     *
     * source positions
     */

    "use strict";

    function end () {
        module.exports = Object.freeze({
            "SourcePos": SourcePos
        });
    }


    function SourcePos (name, line, column) {
        this.name   = name;
        this.line   = line;
        this.column = column;
    }

    Object.defineProperties(SourcePos, {
        "init": { "value": function (name) {
            return new SourcePos(name, 1, 1);
        }},

        "equals": { "value": function (positionA, positionB) {
            return positionA.name   === positionB.name
                && positionA.line   === positionB.line
                && positionA.column === positionB.column;
        }},

        "compare": { "value": function (positionA, positionB) {
            return positionA.name   < positionB.name   ? -1
                 : positionA.name   > positionB.name   ? 1
                 : positionA.line   < positionB.line   ? -1
                 : positionA.line   > positionB.line   ? 1
                 : positionA.column < positionB.column ? -1
                 : positionA.column > positionB.column ? 1
                                                       : 0;
        }}
    });

    Object.defineProperties(SourcePos.prototype, {
        "toString": { "value": function () {
            return (this.name === "" ? "" : "\"" + this.name + "\" ")
                + "(line " + this.line.toString() + ", column " + this.column.toString() + ")";
        }},

        "clone": { "value": function () {
            return new SourcePos(this.name, this.line, this.column);
        }},

        "setName": { "value": function (name) {
            return new SourcePos(name, this.line, this.column);
        }},

        "setLine": { "value": function (line) {
            return new SourcePos(this.name, line, this.column);
        }},

        "setColumn": { "value": function (column) {
            return new SourcePos(this.name, this.line, column);
        }},

        "addChar": { "value": function (char, tabWidth) {
            tabWidth = tabWidth | 0;
            if (tabWidth <= 0) {
                tabWidth = 8;
            }
            var copy = this.clone();
            switch (char) {
                case "\n":
                    copy.line ++;
                    copy.column = 1;
                    break;
                case "\t":
                    copy.column += tabWidth - (copy.column - 1) % tabWidth;
                    break;
                default:
                    copy.column ++;
            }
            return copy;
        }},

        "addString": { "value": function (str, tabWidth) {
            tabWidth = tabWidth | 0;
            if (tabWidth <= 0) {
                tabWidth = 8;
            }
            var copy = this.clone();
            for (var i = 0; i < str.length; i ++) {
                switch (str[i]) {
                    case "\n":
                        copy.line ++;
                        copy.column = 1;
                        break;
                    case "\t":
                        copy.column += tabWidth - (copy.column - 1) % tabWidth;
                        break;
                    default:
                        copy.column ++;
                }
            }
            return copy;
        }}
    });


    end();


/***/ },
/* 5 */
/***/ function(module, exports) {

    /*
     * Loquat / util.js
     * copyright (c) 2014 Susisu
     *
     * utility functions
     */

    "use strict";

    function end () {
        module.exports = Object.freeze({
            "ArrayUtil" : ArrayUtil,
            "CharUtil"  : CharUtil,
            "show"      : show,
            "escapeChar": escapeChar,
            "uncons"    : uncons
        });
    }


    var ArrayUtil = Object.freeze({
        "equals": function (arrayA, arrayB, elementEquals) {
            if (arrayA.length !== arrayB.length) {
                return false;
            }
            else {
                if (elementEquals === undefined) {
                    return ArrayUtil.zipWith(function (x, y) { return x === y; }, arrayA, arrayB)
                        .every(function (x) { return x; });
                }
                else {
                    return ArrayUtil.zipWith(elementEquals, arrayA, arrayB).every(function (x) { return x; });
                }
            }
        },

        "nub": function (array) {
            return array.filter(function (element, index, array) { return array.indexOf(element) === index; });
        },

        "replicate": function (n, element) {
            var array = [];
            for (var i = 0; i < n; i ++) {
                array.push(element);
            }
            return array;
        },

        "zipWith": function (func, arrayA, arrayB) {
            var array = [];
            var length = Math.min(arrayA.length, arrayB.length);
            for (var i = 0; i < length; i ++) {
                array.push(func(arrayA[i], arrayB[i]));
            }
            return array;
        }
    });

    var CharUtil = Object.freeze({
        "isSpace": function (char) {
            return char.length === 1
                && " \t\n\r\f\v".indexOf(char) >= 0;
        },

        "isUpper": function (char) {
            return char.length === 1
                && "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(char) >= 0;
        },

        "isLower": function (char) {
            return char.length === 1
                && "abcdefghijklmnopqrstuvwxyz".indexOf(char) >= 0;
        },

        "isAlphaNum": function (char) {
            return char.length === 1
                && "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".indexOf(char) >= 0;
        },

        "isAlpha": function (char) {
            return char.length === 1
                && "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".indexOf(char) >= 0;
        },

        "isDigit": function (char) {
            return char.length === 1
                && "0123456789".indexOf(char) >= 0;
        },

        "isHexDigit": function (char) {
            return char.length === 1
                && "0123456789ABCDEFabcdef".indexOf(char) >= 0;
        },

        "isOctDigit": function (char) {
            return char.length === 1
                && "01234567".indexOf(char) >= 0;
        }
    });

    function show (value) {
        if (typeof value === "string" || value instanceof String) {
            if (value.length === 1) {
                return "\"" + escapeChar(value) + "\"";
            }
            else {
                return "\"" + value.split("").map(escapeChar).join("") + "\"";
            }
        }
        else if (value instanceof Array) {
            return "[" + value.map(show).join(", ") + "]";
        }
        else {
            return String(value);
        }
    }

    function escapeChar (char) {
        switch (char) {
            case "\\": return "\\\\";
            case "\"": return "\\\"";
            case "\b": return "\\b";
            case "\t": return "\\t";
            case "\n": return "\\n";
            case "\r": return "\\r";
            case "\f": return "\\f";
            case "\v": return "\\v";
            default  : return char;
        }
    }

    function uncons (value) {
        if (typeof value === "string" || value instanceof String) {
            if (value.length === 0) {
                return [];
            }
            else {
                return [value[0], value.substr(1)];
            }
        }
        else if (value instanceof Array) {
            if (value.length === 0) {
                return [];
            }
            else {
                return [value[0], value.slice(1)];
            }
        }
        else {
            if (typeof value.uncons === "function") {
                return value.uncons();
            }
        }
    }


    end();


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

    /*
     * Loquat / combinator.js
     * copyright (c) 2014 Susisu
     *
     * combinators
     */

    "use strict";

    function end () {
        module.exports = Object.freeze({
            "choice"       : lq.monad.msum,
            "option"       : option,
            "optionMaybe"  : optionMaybe,
            "optional"     : optional,
            "between"      : between,
            "many1"        : many1,
            "skipMany1"    : skipMany1,
            "sepBy"        : sepBy,
            "sepBy1"       : sepBy1,
            "sepEndBy"     : sepEndBy,
            "sepEndBy1"    : sepEndBy1,
            "endBy"        : endBy,
            "endBy1"       : endBy1,
            "count"        : lq.monad.replicateM,
            "chainl"       : chainl,
            "chainl1"      : chainl1,
            "chainr"       : chainr,
            "chainr1"      : chainr1,
            "anyToken"     : anyToken,
            "eof"          : eof,
            "notFollowedBy": notFollowedBy,
            "manyTill"     : manyTill
        });
    }

    var lq = Object.freeze({
        "error": __webpack_require__(3),
        "monad": __webpack_require__(7),
        "prim" : __webpack_require__(2),
        "util" : __webpack_require__(5)
    });


    function option (value, parser) {
        return lq.prim.mplus(parser, lq.prim.pure(value));
    }

    function optionMaybe (parser) {
        return option([], lq.prim.fmap(function (value) { return [value]; })(parser));
    }

    function optional (parser) {
        return lq.prim.mplus(
            lq.prim.then(parser, lq.prim.pure(undefined)),
            lq.prim.pure(undefined)
        );
    }

    function between (open, close, parser) {
        return lq.prim.then(
            open,
            lq.prim.bind(
                parser,
                function (value) {
                    return lq.prim.then(close, lq.prim.pure(value));
                }
            )
        );
    }

    function many1 (parser) {
        return lq.prim.bind(
            parser,
            function (head) {
                return lq.prim.bind(
                    lq.prim.many(parser),
                    function (tail) {
                        return lq.prim.pure([head].concat(tail));
                    }
                );
            }
        );
    }

    function skipMany1 (parser) {
        return lq.prim.then(parser, lq.prim.skipMany(parser));
    }

    function sepBy (parser, separator) {
        return lq.prim.mplus(sepBy1(parser, separator), lq.prim.pure([]));
    }

    function sepBy1 (parser, separator) {
        return lq.prim.bind(
            parser,
            function (head) {
                return lq.prim.bind(
                    lq.prim.many(lq.prim.then(separator, parser)),
                    function (tail) {
                        return lq.prim.pure([head].concat(tail));
                    }
                );
            }
        );
    }

    function sepEndBy (parser, separator) {
        return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
            var accum = [];
            var currentState = state;
            var currentError = lq.error.ParseError.unknown(state.position);
            var consumed = false;
            var stop = false;
            var termConsumed;
            while (true) {
                termConsumed = false;
                parser.run(currentState, csuc_, cerr_, esuc_, eerr_);
                if (stop) {
                    if (termConsumed) {
                        return cerr(currentError);
                    }
                    else {
                        if (consumed) {
                            return csuc(accum, currentState, currentError);
                        }
                        else {
                            return esuc(accum, currentState, currentError);
                        }
                    }
                }
                termConsumed = false;
                separator.run(currentState, sepCSuc_, sepCErr_, sepESuc_, sepEErr_);
                if (stop) {
                    if (termConsumed) {
                        return cerr(currentError);
                    }
                    else {
                        if (consumed) {
                            return csuc(accum, currentState, currentError);
                        }
                        else {
                            return esuc(accum, currentState, currentError);
                        }
                    }
                }
            }

            function csuc_ (value, state, error) {
                consumed = true;
                termConsumed = true;
                accum.push(value);
                currentState = state;
                currentError = error;
            }

            function cerr_ (error) {
                consumed = true;
                termConsumed = true;
                stop = true;
                currentError = error;
            }

            function esuc_ (value, state, error) {
                accum.push(value);
                currentState = state;
                currentError = lq.error.ParseError.merge(currentError, error);
            }

            function eerr_ (error) {
                stop = true;
                currentError = lq.error.ParseError.merge(currentError, error);
            }

            function sepCSuc_ (value, state, error) {
                consumed = true;
                termConsumed = true;
                currentState = state;
                currentError = error;
            }

            function sepCErr_ (error) {
                consumed = true;
                termConsumed = true;
                stop = true;
                currentError = error;
            }

            function sepESuc_ (value, state, error) {
                currentState = state;
                currentError = lq.error.ParseError.merge(currentError, error);
            }

            function sepEErr_ (error) {
                stop = true;
                currentError = lq.error.ParseError.merge(currentError, error);
            }
        });
    }

    function sepEndBy1 (parser, separator) {
        return lq.prim.bind(
            parser,
            function (head) {
                return lq.prim.mplus(
                    lq.prim.then(
                        separator,
                        lq.prim.bind(
                            sepEndBy(parser, separator),
                            function (tail) {
                                return lq.prim.pure([head].concat(tail));
                            }
                        )
                    ),
                    lq.prim.pure([head])
                );
            }
        );
    }

    function endBy (parser, separator) {
        return lq.prim.many(
            lq.prim.bind(
                parser,
                function (value) {
                    return lq.prim.then(separator, lq.prim.pure(value));
                }
            )
        );
    }

    function endBy1 (parser, separator) {
        return many1(
            lq.prim.bind(
                parser,
                function (value) {
                    return lq.prim.then(separator, lq.prim.pure(value));
                }
            )
        );
    }

    function chainl (parser, operator, defaultValue) {
        return lq.prim.mplus(chainl1(parser, operator), lq.prim.pure(defaultValue));
    }

    function chainl1 (parser, operator) {
        return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
            var currentValue;
            var currentState = state;
            var currentError = lq.error.ParseError.unknown(state.position);
            var consumed = false;
            var stop = false;
            parser.run(
                currentState,
                function (value, state, error) {
                    consumed = true;
                    currentValue = value;
                    currentState = state;
                    currentError = error;
                },
                function (error) {
                    consumed = true;
                    stop = true;
                    currentError = error;
                },
                function (value, state, error) {
                    currentValue = value;
                    currentState = state;
                    currentError = lq.error.ParseError.merge(currentError, error);
                },
                function (error) {
                    stop = true;
                    currentError = lq.error.ParseError.merge(currentError, error);
                }
            );
            if (stop) {
                if (consumed) {
                    return cerr(currentError);
                }
                else {
                    return eerr(currentError);
                }
            }

            var termValue;
            var operation;
            var termState;
            var termConsumed;
            while (true) {
                termState = currentState;
                termConsumed = false;
                operator.run(termState, opCSuc_, opCErr_, opESuc_, opEErr_);
                if (stop) {
                    break;
                }
                parser.run(termState, csuc_, cerr_, esuc_, eerr_);
                if (stop) {
                    break;
                }
                currentValue = operation(currentValue, termValue);
                currentState = termState;
            }
            if (termConsumed) {
                return cerr(currentError);
            }
            else {
                if (consumed) {
                    return csuc(currentValue, currentState, currentError);
                }
                else {
                    return esuc(currentValue, currentState, currentError);
                }
            }

            function opCSuc_ (value, state, error) {
                consumed = true;
                termConsumed = true;
                operation = value;
                termState = state;
                currentError = error;
            }

            function opCErr_ (error) {
                consumed = true;
                termConsumed = true;
                stop = true;
                currentError = error;
            }

            function opESuc_ (value, state, error) {
                operation = value;
                termState = state;
                currentError = lq.error.ParseError.merge(currentError, error);
            }

            function opEErr_ (error) {
                stop = true;
                currentError = lq.error.ParseError.merge(currentError, error);
            }

            function csuc_ (value, state, error) {
                consumed = true;
                termConsumed = true;
                termValue = value;
                termState = state;
                currentError = error;
            }

            function cerr_ (error) {
                consumed = true;
                termConsumed = true;
                stop = true;
                currentError = error;
            }

            function esuc_ (value, state, error) {
                termValue = value;
                termState = state;
                currentError = lq.error.ParseError.merge(currentError, error);
            }

            function eerr_ (error) {
                stop = true;
                currentError = lq.error.ParseError.merge(currentError, error);
            }
        });
    }

    function chainr (parser, operator, defaultValue) {
        return lq.prim.mplus(chainr1(parser, operator), lq.prim.pure(defaultValue));
    }

    function chainr1 (parser, operator) {
        return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
            var result;
            var currentState = state;
            var currentError = lq.error.ParseError.unknown(state.position);
            var consumed = false;
            var stop = false;
            parser.run(
                currentState,
                function (value, state, error) {
                    consumed = true;
                    result = value;
                    currentState = state;
                    currentError = error;
                },
                function (error) {
                    consumed = true;
                    stop = true;
                    currentError = error;
                },
                function (value, state, error) {
                    result = value;
                    currentState = state;
                    currentError = lq.error.ParseError.merge(currentError, error);
                },
                function (error) {
                    stop = true;
                    currentError = lq.error.ParseError.merge(currentError, error);
                }
            );
            if (stop) {
                if (consumed) {
                    return cerr(currentError);
                }
                else {
                    return eerr(currentError);
                }
            }

            var accum = [];
            var operations = [];
            var termState;
            var termConsumed;
            while (true) {
                termState = currentState;
                termConsumed = false;
                operator.run(termState, opCSuc_, opCErr_, opESuc_, opEErr_);
                if (stop) {
                    break;
                }
                parser.run(termState, csuc_, cerr_, esuc_, eerr_);
                if (stop) {
                    break;
                }
                currentState = termState;
            }
            if (termConsumed) {
                return cerr(currentError);
            }
            else {
                if (accum.length > 0) {
                    var currentValue = accum[accum.length - 1];
                    for (var i = accum.length - 2; i >= 0; i --) {
                        currentValue = operations[i + 1](accum[i], currentValue);
                    }
                    result = operations[0](result, currentValue);
                }
                if (consumed) {
                    return csuc(result, currentState, currentError);
                }
                else {
                    return esuc(result, currentState, currentError);
                }
            }

            function opCSuc_ (value, state, error) {
                consumed = true;
                termConsumed = true;
                operations.push(value);
                termState = state;
                currentError = error;
            }

            function opCErr_ (error) {
                consumed = true;
                termConsumed = true;
                stop = true;
                currentError = error;
            }

            function opESuc_ (value, state, error) {
                operations.push(value);
                termState = state;
                currentError = lq.error.ParseError.merge(currentError, error);
            }

            function opEErr_ (error) {
                stop = true;
                currentError = lq.error.ParseError.merge(currentError, error);
            }

            function csuc_ (value, state, error) {
                consumed = true;
                termConsumed = true;
                accum.push(value);
                termState = state;
                currentError = error;
            }

            function cerr_ (error) {
                consumed = true;
                termConsumed = true;
                stop = true;
                currentError = error;
            }

            function esuc_ (value, state, error) {
                accum.push(value);
                termState = state;
                currentError = lq.error.ParseError.merge(currentError, error);
            }

            function eerr_ (error) {
                stop = true;
                currentError = lq.error.ParseError.merge(currentError, error);
            }
        });
    }

    var anyToken = lq.prim.tokenPrim(
        function (token) { return lq.util.show(token); },
        function (token) { return [token]; },
        function (position, token, rest) { return position; }
    );

    var eof = lq.prim.label(notFollowedBy(anyToken), "end of input");

    function notFollowedBy (parser) {
        return lq.prim.try(
            lq.prim.mplus(
                lq.prim.bind(
                    new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                        return parser.run(state, csuc, eerr, csuc, eerr);
                    }),
                    function (value) {
                        return lq.prim.unexpected(lq.util.show(value));
                    }
                ),
                lq.prim.pure(undefined)
            )
        );
    }

    function manyTill (parser, end) {
        return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
            var accum = [];
            var currentState = state;
            var currentError = lq.error.ParseError.unknown(state.position);
            var consumed = false;
            var stop = false;
            var failed = false;
            while (true) {
                end.run(currentState, endCSuc_, endCErr_, endESuc_, endEErr_);
                if (stop) {
                    if (failed) {
                        if (consumed) {
                            return cerr(currentError);
                        }
                        else {
                            return eerr(currentError);
                        }
                    }
                    else {
                        if (consumed) {
                            return csuc(accum, currentState, currentError);
                        }
                        else {
                            return esuc(accum, currentState, currentError);
                        }
                    }
                }
                parser.run(currentState, csuc_, cerr_, esuc_, eerr_);
                if (stop) {
                    if (consumed) {
                        return cerr(currentError);
                    }
                    else {
                        return eerr(currentError);
                    }
                }
            }

            function endCSuc_ (value, state, error) {
                consumed = true;
                stop = true;
                currentState = state;
                currentError = error;
            }

            function endCErr_ (error) {
                consumed = true;
                stop = true;
                failed = true;
                currentError = error;
            }

            function endESuc_ (value, state, error) {
                stop = true;
                currentState = state;
                currentError = lq.error.ParseError.merge(currentError, error);
            }

            function endEErr_ (error) {
                currentError = lq.error.ParseError.merge(currentError, error);
            }

            function csuc_ (value, state, error) {
                consumed = true;
                accum.push(value);
                currentState = state;
                currentError = error;
            }

            function cerr_ (error) {
                consumed = true;
                stop = true;
                failed = true;
                currentError = error;
            }

            function esuc_ (value, state, error) {
                accum.push(value);
                currentState = state;
                currentError = lq.error.ParseError.merge(currentError, error);
            }

            function eerr_ (error) {
                stop = true;
                currentError = lq.error.ParseError.merge(currentError, error);
            }
        });
    }


    end();


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

    /*
     * Loquat / monad.js
     * copyright (c) 2014 Susisu
     *
     * monadic functions
     */

    "use strict";

    function end () {
        module.exports = Object.freeze({
            "forever"    : forever,
            "void"       : nullify,
            "nullify"    : nullify,
            "join"       : join,
            "when"       : when,
            "unless"     : unless,
            "liftM"      : liftM,
            "liftM2"     : liftM2,
            "liftM3"     : liftM3,
            "liftM4"     : liftM4,
            "liftM5"     : liftM5,
            "ltor"       : ltor,
            "rtol"       : rtol,
            "sequence"   : sequence,
            "sequence_"  : sequence_,
            "mapM"       : mapM,
            "mapM_"      : mapM_,
            "forM"       : forM,
            "forM_"      : forM_,
            "filterM"    : filterM,
            "zipWithM"   : zipWithM,
            "zipWithM_"  : zipWithM_,
            "foldM"      : foldM,
            "foldM_"     : foldM_,
            "replicateM" : replicateM,
            "replicateM_": replicateM_,
            "guard"      : guard,
            "msum"       : msum,
            "mfilter"    : mfilter
        });
    }

    var lq = Object.freeze({
        "error": __webpack_require__(3),
        "prim" : __webpack_require__(2),
        "util" : __webpack_require__(5)
    });


    function forever (parser) {
        var loop = new lq.prim.LazyParser(function () {
            return lq.prim.then(parser, loop);
        });
        return loop;
    }

    var nullify = lq.prim.fmap(function (any) { return undefined; });

    function join (parser) {
        return lq.prim.bind(
            parser,
            function (value) {
                return value;
            }
        );
    }

    function when (flag, parser) {
        if (flag) {
            return parser;
        }
        else {
            return lq.prim.pure(undefined);
        }
    }

    function unless (flag, parser) {
        if (flag) {
            return lq.prim.pure(undefined);
        }
        else {
            return parser;
        }
    }

    function liftM (func) {
        return function (parser) {
            return lq.prim.bind(
                parser,
                function (value) {
                    return lq.prim.pure(func(value));
                }
            );
        };
    }

    function liftM2 (func) {
        return function (parserA, parserB) {
            return lq.prim.bind(
                parserA,
                function (valueA) {
                    return lq.prim.bind(
                        parserB,
                        function (valueB) {
                            return lq.prim.pure(func(valueA, valueB));
                        }
                    );
                }
            );
        };
    }

    function liftM3 (func) {
        return function (parserA, parserB, parserC) {
            return lq.prim.bind(
                parserA,
                function (valueA) {
                    return lq.prim.bind(
                        parserB,
                        function (valueB) {
                            return lq.prim.bind(
                                parserC,
                                function (valueC) {
                                    return lq.prim.pure(func(valueA, valueB, valueC));
                                }
                            );
                        }
                    );
                }
            );
        };
    }

    function liftM4 (func) {
        return function (parserA, parserB, parserC, parserD) {
            return lq.prim.bind(
                parserA,
                function (valueA) {
                    return lq.prim.bind(
                        parserB,
                        function (valueB) {
                            return lq.prim.bind(
                                parserC,
                                function (valueC) {
                                    return lq.prim.bind(
                                        parserD,
                                        function (valueD) {
                                            return lq.prim.pure(func(valueA, valueB, valueC, valueD));
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        };
    }

    function liftM5 (func) {
        return function (parserA, parserB, parserC, parserD, parserE) {
            return lq.prim.bind(
                parserA,
                function (valueA) {
                    return lq.prim.bind(
                        parserB,
                        function (valueB) {
                            return lq.prim.bind(
                                parserC,
                                function (valueC) {
                                    return lq.prim.bind(
                                        parserD,
                                        function (valueD) {
                                            return lq.prim.bind(
                                                parserE,
                                                function (valueE) {
                                                    return lq.prim.pure(func(valueA, valueB, valueC, valueD, valueE));
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        };
    }

    function ltor (funcA, funcB) {
        return function (value) { return lq.prim.bind(funcA(value), funcB); };
    }

    function rtol (funcA, funcB) {
        return ltor(funcB, funcA);
    }

    function sequence (parsers) {
        return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
            var accum = [];
            var currentState = state;
            var currentError = lq.error.ParseError.unknown(state.position);
            var consumed = false;
            var stop = false;
            for (var i = 0; i < parsers.length; i ++) {
                parsers[i].run(currentState, csuc_, cerr_, esuc_, eerr_);
                if (stop) {
                    if (consumed) {
                        return cerr(currentError);
                    }
                    else {
                        return eerr(currentError);
                    } 
                }
            }
            if (consumed) {
                return csuc(accum, currentState, currentError);
            }
            else {
                return esuc(accum, currentState, currentError);
            }

            function csuc_ (value, state, error) {
                consumed = true;
                accum.push(value);
                currentState = state;
                currentError = error;
            }

            function cerr_ (error) {
                consumed = true;
                stop = true;
                currentError = error;
            }

            function esuc_ (value, state, error) {
                accum.push(value);
                currentState = state;
                currentError = lq.error.ParseError.merge(currentError, error);
            }

            function eerr_ (error) {
                stop = true;
                currentError = lq.error.ParseError.merge(currentError, error);
            }
        });
    }

    function sequence_ (parsers) {
        return parsers.reduceRight(
            function (accum, parser) { return lq.prim.then(parser, accum); },
            lq.prim.pure(undefined)
        );
    }

    function mapM (func, array) {
        return sequence(array.map(func));
    }

    function mapM_ (func, array) {
        return sequence_(array.map(func));
    }

    function forM (array, func) {
        return mapM(func, array);
    }

    function forM_ (array, func) {
        return mapM_(func, array);
    }

    function filterM (test, array) {
        return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
            var accum = [];
            var currentState = state;
            var currentError = lq.error.ParseError.unknown(state.position);
            var consumed = false;
            var stop = false;
            var flag = false;
            for (var i = 0; i < array.length; i ++) {
                test(array[i]).run(currentState, csuc_, cerr_, esuc_, eerr_);
                if (stop) {
                    if (consumed) {
                        return cerr(currentError);
                    }
                    else {
                        return eerr(currentError);
                    }
                }
                if (flag) {
                    accum.push(array[i]);
                }
            }
            if (consumed) {
                return csuc(accum, currentState, currentError);
            }
            else {
                return esuc(accum, currentState, currentError);
            }

            function csuc_ (value, state, error) {
                consumed = true;
                flag = value;
                currentState = state;
                currentError = error;
            }

            function cerr_ (error) {
                consumed = true;
                stop = true;
                currentError = error;
            }

            function esuc_ (value, state, error) {
                flag = value;
                currentState = state;
                currentError = lq.error.ParseError.merge(currentError, error);
            }

            function eerr_ (error) {
                stop = true;
                currentError = lq.error.ParseError.merge(currentError, error);
            }
        });
    }

    function zipWithM (func, arrayA, arrayB) {
        return sequence(lq.util.ArrayUtil.zipWith(func, arrayA, arrayB));
    }

    function zipWithM_ (func, arrayA, arrayB) {
        return sequence_(lq.util.ArrayUtil.zipWith(func, arrayA, arrayB));
    }

    function foldM (func, initialValue, array) {
        return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
            var accum = initialValue;
            var currentState = state;
            var currentError = lq.error.ParseError.unknown(state.position);
            var consumed = false;
            var stop = false;
            for (var i = 0; i < array.length; i ++) {
                func(accum, array[i]).run(currentState, csuc_, cerr_, esuc_, eerr_);
                if (stop) {
                    if (consumed) {
                        return cerr(currentError);
                    }
                    else {
                        return eerr(currentError);
                    }
                }
            }
            if (consumed) {
                return csuc(accum, currentState, currentError);
            }
            else {
                return esuc(accum, currentState, currentError);
            }

            function csuc_ (value, state, error) {
                consumed = true;
                accum = value;
                currentState = state;
                currentError = error;
            }

            function cerr_ (error) {
                consumed = true;
                stop = true;
                currentError = error;
            }

            function esuc_ (value, state, error) {
                accum = value;
                currentState = state;
                currentError = lq.error.ParseError.merge(currentError, error);
            }

            function eerr_ (error) {
                stop = true;
                currentError = lq.error.ParseError.merge(currentError, error);
            }
        });
    }

    function foldM_ (func, initialValue, array) {
        return lq.prim.then(foldM(func, initialValue, array), lq.prim.pure(undefined));
    }

    function replicateM (n, parser) {
        return sequence(lq.util.ArrayUtil.replicate(n, parser));
    }

    function replicateM_ (n, parser) {
        return sequence_(lq.util.ArrayUtil.replicate(n, parser));
    }

    function guard (flag) {
        if (flag) {
            return lq.prim.pure(undefined);
        }
        else {
            return lq.prim.mzero;
        }
    }

    function msum (parsers) {
        return parsers.reduceRight(
            function (accum, parser) { return lq.prim.mplus(parser, accum); },
            lq.prim.mzero
        );
    }

    function mfilter (test, parser) {
        return lq.prim.bind(
            parser,
            function (value) {
                if (test(value)) {
                    return lq.prim.pure(value);
                }
                else {
                    return lq.prim.mzero;
                }
            }
        );
    }


    end();


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

    /*
     * Loquat / expr.js
     * copyright (c) 2014 Susisu
     *
     * a helper to parse expressions
     */

    "use strict";

    function end () {
        module.exports = Object.freeze({
            "OperatorType"         : OperatorType,
            "OperatorAssoc"        : OperatorAssoc,
            "Operator"             : Operator,
            "buildExpressionParser": buildExpressionParser
        });
    }

    var lq = Object.freeze({
        "combinator": __webpack_require__(6),
        "error"     : __webpack_require__(3),
        "prim"      : __webpack_require__(2),
    });


    var OperatorType = Object.freeze({
        "INFIX": "infix",
        "PREFIX": "prefix",
        "POSTFIX": "postfix"
    });

    var OperatorAssoc = Object.freeze({
        "ASSOC_NONE": "assocNone",
        "ASSOC_LEFT": "assocLeft",
        "ASSOC_RIGHT": "assocRight"
    });

    function Operator (type, parser, assoc) {
        this.type = type;
        this.parser = parser;
        this.assoc = assoc;
    }

    function buildExpressionParser (operators, term) {
        return operators.reduce(makeParser, term);

        function makeParser (term, operators) {
            var nonAssoc   = [];
            var leftAssoc  = [];
            var rightAssoc = [];
            var prefix     = [];
            var postfix    = [];
            for (var i = 0; i < operators.length; i ++) {
                switch (operators[i].type) {
                    case OperatorType.INFIX:
                        switch (operators[i].assoc) {
                            case OperatorAssoc.ASSOC_NONE:
                                nonAssoc.push(operators[i].parser);
                                break;
                            case OperatorAssoc.ASSOC_LEFT:
                                leftAssoc.push(operators[i].parser);
                                break;
                            case OperatorAssoc.ASSOC_RIGHT:
                                rightAssoc.push(operators[i].parser);
                                break;
                            default:
                                throw new Error("unknown operator assoc: " + operators[i].assoc);
                        }
                        break;
                    case OperatorType.PREFIX:
                        prefix.push(operators[i].parser);
                        break;
                    case OperatorType.POSTFIX:
                        postfix.push(operators[i].parser);
                        break;
                    default:
                        throw new Error("unknown operator type: " + operators[i].type);
                }
            }

            var nonAssocOperator   = lq.combinator.choice(nonAssoc);
            var leftAssocOperator  = lq.combinator.choice(leftAssoc);
            var rightAssocOperator = lq.combinator.choice(rightAssoc);
            var prefixOperator     = lq.prim.label(lq.combinator.choice(prefix), "");
            var postfixOperator    = lq.prim.label(lq.combinator.choice(postfix), "");

            function ambiguous (assoc, operator) {
                return lq.prim.try(
                    lq.prim.then(
                        operator,
                        lq.prim.fail("ambiguous use of a " + assoc + " associative operator")
                    )
                );
            }
            var ambiguousNone  = ambiguous("non", nonAssocOperator);
            var ambiguousLeft  = ambiguous("left", leftAssocOperator);
            var ambiguousRight = ambiguous("right", rightAssocOperator);

            function id (x) {
                return x;
            }

            var prefixParser = lq.prim.mplus(
                prefixOperator,
                lq.prim.pure(id)
            );

            var postfixParser = lq.prim.mplus(
                postfixOperator,
                lq.prim.pure(id)
            );

            var termParser = lq.prim.bind(
                prefixParser,
                function (pre) {
                    return lq.prim.bind(
                        term,
                        function (x) {
                            return lq.prim.bind(
                                postfixParser,
                                function (post) {
                                    return lq.prim.pure(post(pre(x)));
                                }
                            );
                        }
                    );
                }
            );

            function rightAssocParser1 (x) {
                return lq.prim.mplus(
                    lq.prim.bind(
                        rightAssocOperator,
                        function (f) {
                            return lq.prim.bind(
                                lq.prim.bind(
                                    termParser,
                                    function (z) {
                                        return rightAssocParser(z);
                                    }
                                ),
                                function (y) {
                                    return lq.prim.pure(f(x, y));
                                }
                            );
                        }
                    ),
                    lq.prim.mplus(
                        ambiguousLeft,
                        ambiguousNone
                    )
                );
            }

            function rightAssocParser (x) {
                return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                    var values = [];
                    var operations = [];
                    var currentState = state;
                    var currentError = lq.error.ParseError.unknown(state.position);
                    var consumed = false;
                    var stop = false;
                    var termState;
                    var termConsumed;
                    while (true) {
                        termState = currentState;
                        termConsumed = false;
                        rightAssocOperator.run(termState, opCSuc_, opCErr_, opESuc_, opEErr_);
                        if (stop) {
                            break;
                        }
                        termParser.run(termState, termCSuc_, termCErr_, termESuc_, termEErr_);
                        if (stop) {
                            break;
                        }
                        currentState = termState;
                    }
                    if (termConsumed) {
                        return cerr(currentError);
                    }
                    else {
                        lq.prim.mplus(
                            ambiguousLeft,
                            ambiguousNone
                        ).run(currentState, ambCSuc_, ambCErr_, ambESuc_, ambEErr_);
                        var result = x;
                        if (values.length > 0) {
                            var currentValue = values[values.length - 1];
                            for (var i = values.length - 2; i >= 0; i --) {
                                currentValue = operations[i + 1](values[i], currentValue);
                            }
                            result = operations[0](result, currentValue);
                        }
                        if (consumed) {
                            return csuc(result, currentState, currentError);
                        }
                        else {
                            return esuc(result, currentState, currentError);
                        }
                    }

                    function opCSuc_ (value, state, error) {
                        consumed = true;
                        termConsumed = true;
                        operations.push(value);
                        termState = state;
                        currentError = error;
                    }

                    function opCErr_ (error) {
                        consumed = true;
                        termConsumed = true;
                        stop = true;
                        termState = state;
                        currentError = error;
                    }

                    function opESuc_ (value, state, error) {
                        operations.push(value);
                        termState = state;
                        currentError = lq.error.ParseError.merge(currentError, error);
                    }

                    function opEErr_ (error) {
                        stop = true;
                        currentError = lq.error.ParseError.merge(currentError, error);
                    }

                    function termCSuc_ (value, state, error) {
                        consumed = true;
                        termConsumed = true;
                        values.push(value);
                        termState = state;
                        currentError = error;
                    }

                    function termCErr_ (error) {
                        consumed = true;
                        termConsumed = true;
                        stop = true;
                        currentError = error;
                    }

                    function termESuc_ (value, state, error) {
                        values.push(value);
                        termState = state;
                        currentError = lq.error.ParseError.merge(currentError, error);
                    }

                    function termEErr_ (error) {
                        stop = true;
                        currentError = lq.error.ParseError.merge(currentError, error);
                    }

                    function ambCSuc_ (value, state, error) {
                        consumed = true;
                        currentState = state;
                        currentError = error;
                    }

                    function ambCErr_ (error) {
                        consumed = true;
                        currentError = error;
                    }

                    function ambESuc_ (value, state, error) {
                        currentState = state;
                        currentError = lq.error.ParseError.merge(currentError, error);
                    }

                    function ambEErr_ (error) {
                        currentError = lq.error.ParseError.merge(currentError, error);
                    }
                });
            }

            function leftAssocParser1 (x) {
                return lq.prim.mplus(
                    lq.prim.bind(
                        leftAssocOperator,
                        function (f) {
                            return lq.prim.bind(
                                termParser,
                                function (y) {
                                    return leftAssocParser(f(x, y));
                                }
                            );
                        }
                    ),
                    lq.prim.mplus(
                        ambiguousRight,
                        ambiguousNone
                    )
                );
            }

            function leftAssocParser (x) {
                return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                    var currentValue = x;
                    var currentOperation;
                    var currentState = state;
                    var currentError = lq.error.ParseError.unknown(state.position);
                    var consumed = false;
                    var stop = false;
                    var termState;
                    var termConsumed;
                    while (true) {
                        termState = currentState;
                        termConsumed = false;
                        leftAssocOperator.run(termState, opCSuc_, opCErr_, opESuc_, opEErr_);
                        if (stop) {
                            break;
                        }
                        termParser.run(termState, termCSuc_, termCErr_, termESuc_, termEErr_);
                        if (stop) {
                            break;
                        }
                        currentState = termState;
                    }
                    if (termConsumed) {
                        return cerr(currentError);
                    }
                    else {
                        lq.prim.mplus(
                            ambiguousRight,
                            ambiguousNone
                        ).run(currentState, ambCSuc_, ambCErr_, ambESuc_, ambEErr_);
                        if (consumed) {
                            return csuc(currentValue, currentState, currentError);
                        }
                        else {
                            return esuc(currentValue, currentState, currentError);
                        }
                    }

                    function opCSuc_ (value, state, error) {
                        consumed = true;
                        termConsumed = true;
                        currentOperation = value;
                        termState = state;
                        currentError = error;
                    }

                    function opCErr_ (error) {
                        consumed = true;
                        termConsumed = true;
                        stop = true;
                        currentError = error;
                    }

                    function opESuc_ (value, state, error) {
                        currentOperation = value;
                        termState = state;
                        currentError = lq.error.ParseError.merge(currentError, error);
                    }

                    function opEErr_ (error) {
                        stop = true;
                        currentError = lq.error.ParseError.merge(currentError, error);
                    }

                    function termCSuc_ (value, state, error) {
                        consumed = true;
                        termConsumed = true;
                        currentValue = currentOperation(currentValue, value);
                        termState = state;
                        currentError = error;
                    }

                    function termCErr_ (error) {
                        consumed = true;
                        termConsumed = true;
                        stop = true;
                        currentError = error;
                    }

                    function termESuc_ (value, state, error) {
                        currentValue = currentOperation(currentValue, value);
                        termState = state;
                        currentError = lq.error.ParseError.merge(currentError, error);
                    }

                    function termEErr_ (error) {
                        stop = true;
                        currentError = lq.error.ParseError.merge(currentError, error);
                    }

                    function ambCSuc_ (value, state, error) {
                        consumed = true;
                        currentState = state;
                        currentError = error;
                    }

                    function ambCErr_ (error) {
                        consumed = true;
                        currentError = error;
                    }

                    function ambESuc_ (value, state, error) {
                        currentState = state;
                        currentError = lq.error.ParseError.merge(currentError, error);
                    }

                    function ambEErr_ (error) {
                        currentError = lq.error.ParseError.merge(currentError, error);
                    }
                });
            }

            function nonAssocParser1 (x) {
                return lq.prim.bind(
                    nonAssocOperator,
                    function (f) {
                        return lq.prim.bind(
                            termParser,
                            function (y) {
                                return lq.prim.mplus(
                                    ambiguousRight,
                                    lq.prim.mplus(
                                        ambiguousLeft,
                                        lq.prim.mplus(
                                            ambiguousNone,
                                            lq.prim.pure(f(x, y))
                                        )
                                    )
                                );
                            }
                        );
                    }
                );
            }

            return lq.prim.bind(
                termParser,
                function (x) {
                    return lq.prim.label(
                        lq.prim.mplus(
                            rightAssocParser1(x),
                            lq.prim.mplus(
                                leftAssocParser1(x),
                                lq.prim.mplus(
                                    nonAssocParser1(x),
                                    lq.prim.pure(x)
                                )
                            )
                        ),
                        "operator"
                    );
                }
            );
        }
    }


    end();


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

    /*
     * Loquat / sugar.js
     * copyright (c) 2014 Susisu
     *
     * method declaration of parsers
     */

    "use strict";

    function end () {
        module.exports = Object.freeze({});
    }

    var lq = Object.freeze({
        "char"      : __webpack_require__(1),
        "combinator": __webpack_require__(6),
        "monad"     : __webpack_require__(7),
        "prim"      : __webpack_require__(2)
    });


    [lq.prim.Parser, lq.prim.LazyParser].forEach(function (P) {
        Object.defineProperties(P.prototype, {
            /* prim */

            "map": { "value": function (func) {
                return lq.prim.fmap(func)(this);
            }},

            "ap": { "value": function (parser) {
                return lq.prim.ap(this, parser);
            }},

            "left": { "value": function (parser) {
                return lq.prim.left(this, parser);
            }},

            "right": { "value": function (parser) {
                return lq.prim.right(this, parser);
            }},

            "bind": { "value": function (func) {
                return lq.prim.bind(this, func);
            }},

            "then": { "value": function (parser) {
                return lq.prim.then(this, parser);
            }},

            "or": { "value": function (parser) {
                return lq.prim.mplus(this, parser);
            }},

            "label": { "value": function (message) {
                return lq.prim.label(this, message);
            }},

            "labels": { "value": function (messages) {
                return lq.prim.labels(this, messages);
            }},

            "try": { "value": function () {
                return lq.prim.try(this);
            }},

            "lookAhead": { "value": function () {
                return lq.prim.lookAhead(this);
            }},

            "manyAccum": { "value": function (accumulate) {
                return lq.prim.manyAccum(accumulate, this);
            }},

            "many": { "value": function () {
                return lq.prim.many(this);
            }},

            "skipMany": { "value": function () {
                return lq.prim.skipMany(this);
            }},

            /* char */

            "manyChar": { "value": function () {
                return lq.char.manyChar(this);
            }},

            "manyChar1": { "value": function () {
                return lq.char.manyChar1(this);
            }},

            /* monad */

            "forever": { "value": function () {
                return lq.monad.forever(this);
            }},

            "void": { "value": function () {
                return lq.monad.void(this);
            }},

            "join": { "value": function () {
                return lq.monad.join(this);
            }},

            "when": { "value": function (flag) {
                return lq.monad.when(flag, this);
            }},

            "unless": { "value": function (flag) {
                return lq.monad.unless(flag, this);
            }},

            "replicateM": { "value": function (n) {
                return lq.monad.replicateM(n, this);
            }},

            "replicateM_": { "value": function (n) {
                return lq.monad.replicateM_(n, this);
            }},

            "mfilter": { "value": function (test) {
                return lq.monad.mfilter(test, this);
            }},

            /* combinator */

            "between": { "value": function (open, close) {
                return lq.combinator.between(open, close, this);
            }},

            "many1": { "value": function () {
                return lq.combinator.many1(this);
            }},

            "skipMany1": { "value": function () {
                return lq.combinator.skipMany1(this);
            }},

            "sepBy": { "value": function (separator) {
                return lq.combinator.sepBy(this, separator);
            }},

            "sepBy1": { "value": function (separator) {
                return lq.combinator.sepBy1(this, separator);
            }},

            "sepEndBy": { "value": function (separator) {
                return lq.combinator.sepEndBy(this, separator);
            }},

            "sepEndBy1": { "value": function (separator) {
                return lq.combinator.sepEndBy1(this, separator);
            }},

            "endBy": { "value": function (separator) {
                return lq.combinator.endBy(this, separator);
            }},

            "endBy1": { "value": function (separator) {
                return lq.combinator.endBy1(this, separator);
            }},

            "count": { "value": function (n) {
                return lq.combinator.count(n, this);
            }},

            "notFollowedBy": { "value": function (parser) {
                return lq.prim.try(
                    lq.prim.left(this, lq.combinator.notFollowedBy(parser))
                );
            }},

            "manyTill": { "value": function (end) {
                return lq.combinator.manyTill(this, end);
            }}
        });
    });


    end();


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

    /*
     * Loquat / token.js
     * copyright (c) 2014 Susisu
     *
     * a helper to parse tokens
     */

    "use strict";

    function end () {
        module.exports = Object.freeze({
            "LanguageDef"    : LanguageDef,
            "TokenParser"    : TokenParser,
            "makeTokenParser": makeTokenParser
        });
    }

    var lq = Object.freeze({
        "char"      : __webpack_require__(1),
        "combinator": __webpack_require__(6),
        "error"     : __webpack_require__(3),
        "prim"      : __webpack_require__(2),
        "util"      : __webpack_require__(5)
    });


    function LanguageDef (commentStart, commentEnd, commentLine, nestedComments,
            identStart, identLetter, opStart, opLetter,
            reservedNames, reservedOpNames, caseSensitive) {
        this.commentStart    = commentStart;    /* String */
        this.commentEnd      = commentEnd;      /* String */
        this.commentLine     = commentLine;     /* String */
        this.nestedComments  = nestedComments;  /* Boolean */
        this.identStart      = identStart;      /* Parser */
        this.identLetter     = identLetter;     /* Parser */
        this.opStart         = opStart;         /* Parser */
        this.opLetter        = opLetter;        /* Parser */
        this.reservedNames   = reservedNames;   /* Array<String> */
        this.reservedOpNames = reservedOpNames; /* Array<String> */
        this.caseSensitive   = caseSensitive;   /* Boolean */
    }

    function TokenParser (identifier, reserved, operator, reservedOp,
            charLiteral, stringLiteral, natural, integer, float, naturalOrFloat, decimal, hexadecimal, octal,
            symbol, lexeme, whiteSpace, parens, braces, angles, brackets,
            semi, comma, colon, dot, semiSep, semiSep1, commaSep, commaSep1) {
        this.identifier     = identifier;
        this.reserved       = reserved;
        this.operator       = operator;
        this.reservedOp     = reservedOp;
        this.charLiteral    = charLiteral;
        this.stringLiteral  = stringLiteral;
        this.natural        = natural;
        this.integer        = integer;
        this.float          = float;
        this.naturalOrFloat = naturalOrFloat;
        this.decimal        = decimal;
        this.hexadecimal    = hexadecimal;
        this.octal          = octal;
        this.symbol         = symbol;
        this.lexeme         = lexeme;
        this.whiteSpace     = whiteSpace;
        this.parens         = parens;
        this.braces         = braces;
        this.angles         = angles;
        this.brackets       = brackets;
        this.semi           = semi;
        this.comma          = comma;
        this.colon          = colon;
        this.dot            = dot;
        this.semiSep        = semiSep;
        this.semiSep1       = semiSep1;
        this.commaSep       = commaSep;
        this.commaSep1      = commaSep1;
    }


    function makeTokenParser (languageDef) {
        var simpleSpace = lq.combinator.skipMany1(lq.char.satisfy(lq.util.CharUtil.isSpace));
        var oneLineComment = lq.prim.then(
            lq.prim.try(lq.char.string(languageDef.commentLine)),
            lq.prim.then(
                lq.prim.skipMany(lq.char.satisfy(function (c) { return c !== "\n"; })),
                lq.prim.pure(undefined)
            )
        );
        var inCommentMulti = new lq.prim.LazyParser(function () {
            var startEnd = lq.util.ArrayUtil.nub((languageDef.commentEnd + languageDef.commentStart).split("")).join("");
            return lq.prim.label(
                lq.prim.mplus(
                    lq.prim.then(lq.prim.try(lq.char.string(languageDef.commentEnd)), lq.prim.pure(undefined)),
                    lq.prim.mplus(
                        lq.prim.then(multiLineComment, inCommentMulti),
                        lq.prim.mplus(
                            lq.prim.then(lq.combinator.skipMany1(lq.char.noneOf(startEnd)), inCommentMulti),
                            lq.prim.then(lq.char.oneOf(startEnd), inCommentMulti)
                        )
                    )
                ),
                "end of comment"
            );
        });
        var inCommentSingle = new lq.prim.LazyParser(function () {
            var startEnd = lq.util.ArrayUtil.nub((languageDef.commentEnd + languageDef.commentStart).split("")).join("");
            return lq.prim.label(
                lq.prim.mplus(
                    lq.prim.then(lq.prim.try(lq.char.string(languageDef.commentEnd)), lq.prim.pure(undefined)),
                    lq.prim.mplus(
                        lq.prim.then(lq.combinator.skipMany1(lq.char.noneOf(startEnd)), inCommentSingle),
                        lq.prim.then(lq.char.oneOf(startEnd), inCommentSingle)
                    )
                ),
                "end of comment"
            );
        });
        var inComment = languageDef.nestedComments ? inCommentMulti : inCommentSingle;
        var multiLineComment = lq.prim.then(
            lq.prim.try(lq.char.string(languageDef.commentStart)),
            inComment
        );
        var noOneLineComment = languageDef.commentLine === "";
        var noMultiLineComment = languageDef.commentStart === "";
        var whiteSpace = lq.prim.skipMany(
            lq.prim.label(
                  noOneLineComment && noMultiLineComment ? simpleSpace
                : noOneLineComment   ? lq.prim.mplus(simpleSpace, multiLineComment)
                : noMultiLineComment ? lq.prim.mplus(simpleSpace, oneLineComment)
                : lq.prim.mplus(simpleSpace, lq.prim.mplus(oneLineComment, multiLineComment)),
                ""
            )
        );
        function lexeme (parser) {
            return lq.prim.bind(
                parser,
                function (x) {
                    return lq.prim.then(
                        whiteSpace,
                        lq.prim.pure(x)
                    );
                }
            );
        }
        function symbol (name) {
            return lexeme(lq.char.string(name));
        }

        function parens (parser) {
            return lq.combinator.between(symbol("("), symbol(")"), parser);
        }
        function braces (parser) {
            return lq.combinator.between(symbol("{"), symbol("}"), parser);
        }
        function angles (parser) {
            return lq.combinator.between(symbol("<"), symbol(">"), parser);
        }
        function brackets (parser) {
            return lq.combinator.between(symbol("["), symbol("]"), parser);
        }

        var semi  = symbol(";");
        var comma = symbol(",");
        var dot   = symbol(".");
        var colon = symbol(":");
        function semiSep (parser) {
            return lq.combinator.sepBy(parser, semi);
        }
        function semiSep1 (parser) {
            return lq.combinator.sepBy1(parser, semi);
        }
        function commaSep (parser) {
            return lq.combinator.sepBy(parser, comma);
        }
        function commaSep1 (parser) {
            return lq.combinator.sepBy1(parser, comma);
        }

        function number (base, baseDigit) {
            return lq.prim.bind(
                lq.char.manyChar1(baseDigit),
                function (digits) {
                    return lq.prim.pure(parseInt(digits, base));
                }
            );
        }
        var decimal = number(10, lq.char.digit);
        var hexadecimal = lq.prim.then(
            lq.char.oneOf("xX"),
            number(16, lq.char.hexDigit)
        );
        var octal = lq.prim.then(
            lq.char.oneOf("oO"),
            number(8, lq.char.octDigit)
        );
        var zeroNumber = lq.prim.label(
            lq.prim.then(
                lq.char.char("0"),
                lq.prim.mplus(
                    hexadecimal,
                    lq.prim.mplus(
                        octal,
                        lq.prim.mplus(
                            decimal,
                            lq.prim.pure(0)
                        )
                    )
                )
            ),
            ""
        );
        var nat = lq.prim.mplus(zeroNumber, decimal);
        function id (x) {
            return x;
        }
        function negate (x) {
            return -x;
        }
        var sign = lq.prim.mplus(
            lq.prim.then(lq.char.char("-"), lq.prim.pure(negate)),
            lq.prim.mplus(
                lq.prim.then(lq.char.char("+"), lq.prim.pure(id)),
                lq.prim.pure(id)
            )
        );
        var int = lq.prim.bind(
            lexeme(sign),
            function (f) {
                return lq.prim.bind(
                    nat,
                    function (n) {
                        return lq.prim.pure(f(n));
                    }
                );
            }
        );
        var fraction = lq.prim.label(
            lq.prim.then(
                lq.char.char("."),
                lq.prim.bind(
                    lq.prim.label(lq.char.manyChar1(lq.char.digit), "fraction"),
                    function (digits) {
                        return lq.prim.pure(parseFloat("0." + digits));
                    }
                )
            ),
            "fraction"
        );
        var exponent = lq.prim.label(
            lq.prim.then(
                lq.char.oneOf("eE"),
                lq.prim.bind(
                    sign,
                    function (f) {
                        return lq.prim.bind(
                            lq.prim.label(decimal, "exponent"),
                            function (e) {
                                return lq.prim.pure(Math.pow(10, f(e)));
                            }
                        )
                    }
                )
            ),
            "exponent"
        );
        function fractExponent (n) {
            return lq.prim.mplus(
                lq.prim.bind(
                    fraction,
                    function (fract) {
                        return lq.prim.bind(
                            lq.combinator.option(1.0, exponent),
                            function (expo) {
                                return lq.prim.pure((n + fract) * expo)
                            }
                        );
                    }
                ),
                lq.prim.bind(
                    exponent,
                    function (expo) {
                        return lq.prim.pure(n * expo);
                    }
                )
            );
        }
        var floating = lq.prim.bind(
            decimal,
            function (n) {
                return fractExponent(n);
            }
        );
        function fractFloat (n) {
            return lq.prim.bind(
                fractExponent(n),
                function (f) {
                    return lq.prim.pure([undefined, f]);
                }
            );
        }
        var decimalFloat = lq.prim.bind(
            decimal,
            function (n) {
                return lq.combinator.option([n], fractFloat(n))
            }
        );
        var zeroNumFloat = lq.prim.mplus(
            lq.prim.bind(
                lq.prim.mplus(hexadecimal, octal),
                function (n) {
                    return lq.prim.pure([n]);
                }
            ),
            lq.prim.mplus(
                decimalFloat,
                lq.prim.mplus(
                    fractFloat(0),
                    lq.prim.pure([0])
                )
            )
        );
        var natFloat = lq.prim.mplus(
            lq.prim.then(
                lq.char.char("0"),
                zeroNumFloat
            ),
            decimalFloat
        );
        var natural        = lq.prim.label(lexeme(nat), "natural");
        var integer        = lq.prim.label(lexeme(int), "integer");
        var float          = lq.prim.label(lexeme(floating), "float");
        var naturalOrFloat = lq.prim.label(lexeme(natFloat), "number");
        
        var escMap = {
            "a" : "\u0007",
            "b" : "\b",
            "f" : "\f",
            "n" : "\n",
            "r" : "\r",
            "t" : "\t",
            "v" : "\v",
            "\\": "\\",
            "\"": "\"",
            "'" : "'"
        };
        var asciiMap = {
            "BS" : "\u0008",
            "HT" : "\u0009",
            "LF" : "\u000a",
            "VT" : "\u000b",
            "FF" : "\u000c",
            "CR" : "\u000d",
            "SO" : "\u000e",
            "SI" : "\u000f",
            "EM" : "\u0019",
            "FS" : "\u001c",
            "GS" : "\u001d",
            "RS" : "\u001e",
            "US" : "\u001f",
            "SP" : "\u0020",
            "NUL": "\u0000",
            "SOH": "\u0001",
            "STX": "\u0002",
            "ETX": "\u0003",
            "EOT": "\u0004",
            "ENQ": "\u0005",
            "ACK": "\u0006",
            "BEL": "\u0007",
            "DLE": "\u0010",
            "DC1": "\u0011",
            "DC2": "\u0012",
            "DC3": "\u0013",
            "DC4": "\u0014",
            "NAK": "\u0015",
            "SYN": "\u0016",
            "ETB": "\u0017",
            "CAN": "\u0018",
            "SUB": "\u001a",
            "ESC": "\u001b",
            "DEL": "\u007f"
        };
        var charEsc = lq.combinator.choice(
            Object.keys(escMap).sort().map(function (c) {
                return lq.prim.then(lq.char.char(c), lq.prim.pure(escMap[c])); 
            })
        );
        var charNum = lq.prim.bind(
            lq.prim.mplus(
                decimal,
                lq.prim.mplus(
                    lq.prim.then(lq.char.char("o"), number(8, lq.char.octDigit)),
                    lq.prim.then(lq.char.char("x"), number(16, lq.char.hexDigit))
                )
            ),
            function (code) {
                return lq.prim.pure(String.fromCharCode(parseInt(code)));
            }
        );
        var charAscii = lq.combinator.choice(
            Object.keys(asciiMap).sort().map(function (asc) {
                return lq.prim.try(
                    lq.prim.then(lq.char.string(asc), lq.prim.pure(asciiMap[asc]))
                );
            })
        );
        var charControl = lq.prim.then(
            lq.char.char("^"),
            lq.prim.bind(
                lq.char.upper,
                function (code) {
                    return lq.prim.pure(String.fromCharCode(code.charCodeAt(0) - "A".charCodeAt(0) + 1));
                }
            )
        );
        var escapeCode = lq.prim.label(
            lq.prim.mplus(
                charEsc,
                lq.prim.mplus(
                    charNum,
                    lq.prim.mplus(
                        charAscii,
                        charControl
                    )
                )
            ),
            "escape code"
        );
        var charLetter = lq.char.satisfy(function (c) { return c !== "'" && c !== "\\" && c > "\u001a"; });
        var charEscape = lq.prim.then(lq.char.char("\\"), escapeCode);
        var characterChar = lq.prim.label(
            lq.prim.mplus(charLetter, charEscape),
            "literal character"
        );
        var charLiteral = lq.prim.label(
            lexeme(
                lq.combinator.between(
                    lq.char.char("'"),
                    lq.prim.label(lq.char.char("'"), "end of character"),
                    characterChar
                )
            ),
            "character"
        );

        var stringLetter = lq.char.satisfy(function (c) { return c !== "\"" && c !== "\\" && c > "\u001a"; });
        var escapeGap = lq.prim.then(
            lq.combinator.many1(lq.char.space),
            lq.prim.label(lq.char.char("\\"), "end of string gap")
        );
        var escapeEmpty = lq.char.char("&");
        var stringEscape = lq.prim.then(
            lq.char.char("\\"),
            lq.prim.mplus(
                lq.prim.then(escapeGap, lq.prim.pure([])),
                lq.prim.mplus(
                    lq.prim.then(escapeEmpty, lq.prim.pure([])),
                    lq.prim.bind(
                        escapeCode,
                        function (esc) {
                            return lq.prim.pure([esc]);
                        }
                    )
                )
            )
        );
        var stringChar = lq.prim.label(
            lq.prim.mplus(
                lq.prim.bind(
                    stringLetter,
                    function (c) {
                        return lq.prim.pure([c]);
                    }
                ),
                stringEscape
            ),
            "string character"
        );
        function concatMaybeChar (str, maybeChar) {
            return maybeChar.length === 0 ? str : maybeChar[0] + str;
        }
        var stringLiteral = lexeme(
            lq.prim.label(
                lq.prim.bind(
                    lq.combinator.between(
                        lq.char.char("\""),
                        lq.prim.label(lq.char.char("\""), "end of string"),
                        lq.prim.many(stringChar)
                    ),
                    function (str) {
                        return lq.prim.pure(str.reduceRight(concatMaybeChar, ""));
                    }
                ),
                "literal string"
            )
        );

        var ident = lq.prim.label(
            lq.prim.bind(
                languageDef.identStart,
                function (c) {
                    return lq.prim.bind(
                        lq.char.manyChar(languageDef.identLetter),
                        function (cs) {
                            return lq.prim.pure(c + cs);
                        }
                    );
                }
            ),
            "identifier"
        );
        var reservedNames = languageDef.caseSensitive
            ? languageDef.reservedNames.sort()
            : languageDef.reservedNames.map(function (name) { return name.toLowerCase(); }).sort();
        function isReservedName (name) {
            return isReserved(reservedNames, languageDef.caseSensitive ? name : name.toLowerCase());
        }
        function isReserved (names, name) {
            return !names.every(function (reservedName) { return reservedName !== name; });
        }
        var identifier = lexeme(
            lq.prim.try(
                lq.prim.bind(
                    ident,
                    function (name) {
                        if (isReservedName(name)) {
                            return lq.prim.unexpected("reserved word " + lq.util.show(name));
                        }
                        else {
                            return lq.prim.pure(name);
                        }
                    }
                )
            )
        );
        function caseString (name) {
            if (languageDef.caseSensitive) {
                return lq.char.string(name);
            }
            else {
                return caseInsensitiveStr(name);
            }

            function caseInsensitiveStr (str) {
                if (str.length === 0) {
                    return lq.prim.pure("");
                }
                else {
                    return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                        var index = 0;
                        var currentState = state;
                        var currentError = lq.error.ParseError.unknown(state.position);
                        var consumed = false;
                        var stop = false;

                        while (true) {
                            lq.prim.label(
                                caseChar(str[index]),
                                lq.util.show(str)
                            ).run(currentState, csuc_, cerr_, esuc_, eerr_);
                            if (stop) {
                                if (consumed) {
                                    return cerr(currentError);
                                }
                                else {
                                    return eerr(currentError);
                                }
                            }
                            index++;
                            if (index === str.length) {
                                if (consumed) {
                                    return csuc(str, currentState, currentError);
                                }
                                else {
                                    return esuc(str, currentState, currentError);
                                }
                            }
                        }

                        function csuc_ (value, state, error) {
                            consumed = true;
                            currentState = state;
                            currentError = error;
                        }

                        function cerr_ (error) {
                            consumed = true;
                            stop = true;
                            currentError = error;
                        }

                        function esuc_ (value, state, error) {
                            currentState = state;
                            currentError = lq.error.ParseError.merge(currentError, error);
                        }

                        function eerr_ (error) {
                            stop = true;
                            currentError = lq.error.ParseError.merge(currentError, error);
                        }
                    });
                }
            }

            function caseChar (c) {
                if (lq.util.CharUtil.isAlpha(c)) {
                    return lq.prim.mplus(
                        lq.char.char(c.toLowerCase()),
                        lq.char.char(c.toUpperCase())
                    );
                }
                else {
                    return lq.char.char(c);
                }
            }
        }
        function reserved (name) {
            return lexeme(
                lq.prim.try(
                    lq.prim.then(
                        caseString(name),
                        lq.prim.label(
                            lq.combinator.notFollowedBy(languageDef.identLetter),
                            "end of " + lq.util.show(name)
                        )
                    )
                )
            );
        }
        var oper = lq.prim.label(
            lq.prim.bind(
                languageDef.opStart,
                function (c) {
                    return lq.prim.bind(
                        lq.char.manyChar(languageDef.opLetter),
                        function (cs) {
                            return lq.prim.pure(c + cs);
                        }
                    );
                }
            ),
            "operator"
        );
        var reservedOpNames = languageDef.reservedOpNames.sort();
        function isReservedOp (name) {
            return isReserved(reservedOpNames, name);
        }
        var operator = lexeme(
            lq.prim.try(
                lq.prim.bind(
                    oper,
                    function (name) {
                        if (isReservedOp(name)) {
                            return lq.prim.unexpected("reserved operator " + lq.util.show(name));
                        }
                        else {
                            return lq.prim.pure(name);
                        }
                    }
                )
            )
        );
        function reservedOp (name) {
            return lexeme(
                lq.prim.try(
                    lq.prim.then(
                        lq.char.string(name),
                        lq.prim.label(
                            lq.combinator.notFollowedBy(languageDef.opLetter),
                            "end of " + lq.util.show(name)
                        )
                    )
                )
            );
        }

        return new TokenParser(identifier, reserved, operator, reservedOp,
            charLiteral, stringLiteral, natural, integer, float, naturalOrFloat, decimal, hexadecimal, octal,
            symbol, lexeme, whiteSpace, parens, braces, angles, brackets,
            semi, comma, colon, dot, semiSep, semiSep1, commaSep, commaSep1
        );
    }


    end();


/***/ }
/******/ ]);