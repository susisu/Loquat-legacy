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
    "error": require("./error"),
    "prim" : require("./prim"),
    "util" : require("./util")
});


function string (str) {
    // inlined from lq.prim.tokens
    return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
        var restInput = state.input;
        for (var index = 0; index < str.length; index ++) {
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
                if (str[index] === unconsed[0]) {
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
            return esuc("", state, lq.error.ParseError.unknown(state.position));
        }
        else {
            var newPosition = state.position.addString(str, state.tabWidth);
            return csuc(
                str,
                new lq.prim.State(restInput, newPosition, state.tabWidth, state.userState),
                lq.error.ParseError.unknown(newPosition)
            );
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
                        lq.util.show(str)
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
                        lq.util.show(token)
                    ),
                    new lq.error.ErrorMessage(
                        lq.error.ErrorMessageType.EXPECT,
                        lq.util.show(str)
                    )
                ]
            );
        }
    });
}

function satisfy (test) {
    // inlined from lq.prim.tokenPrim
    return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
        var unconsed = lq.util.uncons(state.input);
        if (unconsed.length === 0) {
            return eerr(systemUnexpected(state.position, ""));
        }
        else {
            var token = unconsed[0];
            var rest = unconsed[1];
            var result = test(token) ? [token] : [];
            if (result.length === 0) {
                return eerr(systemUnexpected(state.position, lq.util.show(token)));
            }
            else {
                var newPosition = state.position.addChar(token, state.tabWidth);
                return csuc(
                    result[0],
                    new lq.prim.State(rest, newPosition, state.tabWidth, state.userState),
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
