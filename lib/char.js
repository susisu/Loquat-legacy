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
    "prim": require("./prim"),
    "util": require("./util")
});


function string (str) {
    return lq.prim.bind(lq.prim.getTabWidth, function (tabWidth) {
        return lq.prim.fmap(function (chars) { return chars.join(""); })(
            lq.prim.tokens(
                function (chars) { return lq.util.show(chars.join("")); },
                function (position, chars) { return position.addString(chars.join(""), tabWidth); },
                str.split("")
            )
        );
    });
}

function satisfy (test) {
    return lq.prim.bind(lq.prim.getTabWidth, function (tabWidth) {
        return lq.prim.tokenPrim(
            lq.util.show,
            function (char) { return test(char) ? [char] : [] ; },
            function (position, char, rest) { return position.addChar(char, tabWidth); }
        );
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
