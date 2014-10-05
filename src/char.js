/*
 * Loquat / char.js
 * copyright (c) 2014 Susisu
 *
 * character parsers
 */

function end () {
    module.exports = Object.freeze({
        "string" : string,
        "satisfy": satisfy,
        "oneOf"  : oneOf,
        "noneOf" : noneOf,
        "space"  : space,
        "spaces" : spaces,
        "newline": newline,
        "tab"    : tab,
        "upper"  : upper,
        "lower"  : lower,
        "char"   : char,
        "anyChar": anyChar
    });
}

var lq = Object.freeze({
    "prim": require("./prim")
});


function string (str) {
    return lq.prim.fmap(function (chars) { return chars.join(""); })(
        lq.prim.tokens(
            function (chars) { return lq.prim.show(chars.join("")); },
            function (position, chars) { return position.addString(chars.join("")); },
            str.split("")
        )
    );
}

function satisfy (verify) {
    return lq.prim.tokenPrim(
        lq.prim.show,
        function (char) { return verify(char) ? [char] : [] ; },
        function (position, char, rest) { return position.addChar(char); }
    );
}

function oneOf (str) {
    return satisfy(function (char) { return char.length === 1 && str.indexOf(char) >= 0; });
}

function noneOf (str) {
    return satisfy(function (char) { return char.length === 1 && str.indexOf(char) < 0; });
}

var space = lq.prim.label(
    satisfy(function (char) { return " \t\n\r\f\v".indexOf(char) >= 0; }),
    "space"
);

var spaces = lq.prim.label(
    lq.prim.skipMany(space),
    "white space"
);

var upper = lq.prim.label(
    satisfy(function (char) { return char.toLowerCase() !== char; }),
    "uppercase letter"
);

var lower = lq.prim.label(
    satisfy(function (char) { return char.toUpperCase() !== char; }),
    "lowercase letter"
);
var newline = lq.prim.label(char("\n"), "new-line");

var tab = lq.prim.label(char("\t"), "tab");


function char (expectedChar) {
    return satisfy(function (char) { return char === expectedChar; });
}

var anyChar = satisfy(function (any) { return true; });


end();
