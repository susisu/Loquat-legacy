/*
 * Loquat / combinator.js
 * copyright (c) 2014 Susisu
 *
 * combinators
 */

"use strict";

function end () {
    module.exports = Object.freeze({
        "choice"       : choice,
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
        "count"        : count,
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
    "error": require("./error"),
    "monad": require("./monad"),
    "prim" : require("./prim"),
    "util" : require("./util")
});


function choice (parsers) {
    return parsers.reduceRight(
        function (accum, parser) { return lq.prim.mplus(parser, accum); },
        lq.prim.mzero
    );
}

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
    return lq.prim.mplus(sepEndBy1(parser, separator), lq.prim.pure([]));
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

function count (n, parser) {
    if (n <= 0) {
        return lq.prim.pure([]);
    }
    else {
        return lq.monad.sequence(lq.util.ArrayUtil.replicate(n, parser));
    }
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
    return lq.prim.attempt(
        lq.prim.mplus(
            lq.prim.bind(
                lq.prim.attempt(parser),
                function (value) {
                    return lq.prim.unexpected(lq.util.show(value));
                }
            ),
            lq.prim.pure(undefined)
        )
    );
}

function manyTill (parser, end) {
    var scan = lq.prim.mplus(
        lq.prim.then(end, lq.prim.pure([])),
        lq.prim.bind(
            parser,
            function (head) {
                return lq.prim.bind(
                    scan,
                    function (tail) {
                        return lq.prim.pure([head].concat(tail));
                    }
                );
            }
        )
    );

    return scan;
}


end();
