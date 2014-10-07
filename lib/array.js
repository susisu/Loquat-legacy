/*
 * Loquat / array.js
 * copyright (c) 2014 Susisu
 *
 * instance declaration
 */

function end () {
    module.exports = Object.freeze({});
}

var lq = Object.freeze({
    "util": require("./util")
});

Object.defineProperty(Array.prototype, "uncons", {
    "value": function () {
        if (this.length === 0) {
            return [];
        }
        else {
            return [lq.util.ArrayUtil.head(this), lq.util.ArrayUtil.tail(this)];
        }
    }
});


end();
