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
