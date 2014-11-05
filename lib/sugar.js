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
    "combinator": require("./combinator"),
    "prim"      : require("./prim")
});


[lq.prim.Parser, lq.prim.LazyParser].forEach(function (P) {
    Object.defineProperties(P.prototype, {
        /* prim */

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

        "manyAccum": { "value": function (accumulate) {
            return lq.prim.manyAccum(accumulate, this);
        }},

        "many": { "value": function () {
            return lq.prim.many(this);
        }},

        "skipMany": { "value": function () {
            return lq.prim.skipMany(this);
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
