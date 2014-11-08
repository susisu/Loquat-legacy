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
        lq.util
    ]));
}

var lq = Object.freeze({
    "array"     : require("./array"),
    "char"      : require("./char"),
    "combinator": require("./combinator"),
    "error"     : require("./error"),
    "expr"      : require("./expr"),
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
