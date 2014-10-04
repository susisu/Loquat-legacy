/*
 * Loquat / array.js
 * copyright (c) 2014 Susisu
 *
 * instance declaration
 */

function end () {
    module.exports = Object.freeze({});
}


Object.defineProperty(Array.prototype, "uncons", {
    "value": function () {
        if (this.length === 0) {
            return [];
        }
        else {
            return [head(this), tail(this)];
        }
    }
});


end();
