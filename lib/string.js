/*
 * Loquat / string.js
 * copyright (c) 2014 Susisu
 *
 * instance declaration
 */

"use strict";

function end () {
    module.exports = Object.freeze({});
}


Object.defineProperty(String.prototype, "uncons", {
    "value": function () {
        if (this.length === 0) {
            return [];
        }
        else {
            return [this[0], this.substr(1)];
        }
    }
});


end();
