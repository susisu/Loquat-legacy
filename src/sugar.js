/*
 * Loquat / sugar.js
 * copyright (c) 2014 Susisu
 *
 * method declaration of parsers
 */

function end () {
    module.exports = Object.freeze({});
}

var lq = Object.freeze({
    "prim": require("./prim")
});


[lq.prim.Parser, lq.prim.LazyParser].forEach(function (P) {
    Object.defineProperties(P.prototype, {
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
            return lq.prim.plus(this, parser);
        }},

        "label": { "value": function (message) {
            return lq.prim.label(this, message);
        }}
    });
});


end();
