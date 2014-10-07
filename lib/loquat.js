/*
 * Loquat / loquat.js
 * copyright (c) 2014 Susisu
 *
 * parser combinators
 */

function end () {
    module.exports = Object.freeze(mergeObjects([
        {},
        lq.array,
        lq.error,
        lq.char,
        lq.combinator,
        lq.monad,
        lq.pos,
        lq.prim,
        lq.string,
        lq.sugar,
        lq.util
    ]));
}

var lq = Object.freeze({
    "array"     : require("./array"),
    "error"     : require("./error"),
    "char"      : require("./char"),
    "combinator": require("./combinator"),
    "monad"     : require("./monad"),
    "pos"       : require("./pos"),
    "prim"      : require("./prim"),
    "string"    : require("./string"),
    "sugar"     : require("./sugar"),
    "util"      : require("./util")
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
