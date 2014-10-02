/*
 * Loquat / combinator.js
 * copyright (c) 2014 Susisu
 *
 * combinators
 */

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
    "array": require("./array"),
    "monad": require("./monad"),
    "prim" : require("./prim")
});


function choice (parsers) {
    return parsers.reduceRight(
        function (accum, parser) { return lq.prim.plus(parser, accum); },
        lq.prim.zero
    );
}

function option (value, parser) {
    return lq.prim.plus(parser, lq.prim.pure(value));
}

function optionMaybe (parser) {
    return option([], lq.prim.fmap(function (value) { return [value]; })(parser));
}

function optional (parser) {
    return lq.prim.plus(
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
    return lq.prim.plus(sepBy1(parser, separator), lq.prim.pure([]));
}

function sepBy1 (parser, separator) {
    return lq.prim.bind(
        parser,
        function (head) {
            return lq.prim.plus(
                lq.prim.then(
                    separator,
                    lq.prim.bind(
                        lq.prim.many(lq.prim.then(separator, parser)),
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

function sepEndBy (parser, separator) {
    return lq.prim.plus(sepEndBy1(parser, separator), lq.prim.pure([]));
}

function sepEndBy1 (parser, separator) {
    return lq.prim.bind(
        parser,
        function (head) {
            return lq.prim.plus(
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
    return lq.prim.many1(
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
        return lq.monad.sequence(lq.array.replicate(n, parser));
    }
}

function chainl (parser, operator, initialValue) {
    return lq.prim.plus(chainl1(parser, operator), lq.prim.pure(initialValue));
}

function chainl1 (parser, operator) {
    return lq.prim.bind(
        parser,
        function (x) {
            return rest(x);
        }
    );

    function rest (x) {
        return lq.prim.plus(
            lq.prim.bind(
                operator,
                function (func) {
                    return lq.prim.bind(
                        parser,
                        function (y) {
                            return rest(func(x, y));
                        }
                    );
                }
            ),
            lq.prim.pure(x)
        );
    }
}

function chainr (parser, operator, initialValue) {
    return lq.prim.plus(chainr1(parser, operator), lq.prim.pure(initialValue));
}

function chainr1 (parser, operator) {
    var scan = lq.prim.bind(
        parser,
        function (x) {
            return rest(x);
        }
    );

    return scan;

    function rest (x) {
        return lq.prim.plus(
            lq.prim.bind(
                operator,
                function (func) {
                    return lq.prim.bind(
                        scan,
                        function (y) {
                            return lq.prim.pure(func(x, y));
                        }
                    );
                }
            ),
            lq.prim.pure(x)
        );
    }
}

var anyToken = lq.prim.tokenPrim(
    function (token) { return lq.prim.show(token); },
    function (token) { return [token]; },
    function (position, token, rest) { return position; }
);

var eof = lq.prim.label(notFollowedBy(anyToken), "end of input");

function notFollowedBy (parser) {
    return lq.prim.attempt(
        lq.prim.plus(
            lq.prim.bind(
                lq.prim.attempt(parser),
                function (value) {
                    return lq.prim.unexpected(lq.prim.show(value));
                }
            ),
            lq.prim.pure(undefined)
        )
    );
}

function manyTill (parser, end) {
    var scan = lq.prim.plus(
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