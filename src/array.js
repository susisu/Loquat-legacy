/*
 * Loquat / array.js
 * copyright (c) 2014 Susisu
 *
 * instance declaration and array manipulating functions
 */

function end () {
    module.exports = Object.freeze({
        "head"     : head,
        "tail"     : tail,
        "init"     : init,
        "last"     : last,
        "cons"     : cons,
        "nub"      : nub,
        "replicate": replicate,
        "zipWith"  : zipWith
    });
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


function head (array) {
    return array[0];
}

function tail (array) {
    return array.slice(1);
}

function init (array) {
    return array.slice(0, array.length - 1);
}

function last (array) {
    return array[array.length - 1];
}

function cons (head, tail) {
    return [head].concat(tail);
}

function nub (array) {
    return array.filter(function (element, index, array) { return array.indexOf(element) === index; });
}

function replicate (n, element) {
    var array = [];
    for (var i = 0; i < n; i ++) {
        array.push(element);
    }
    return array;
}

function zipWith (func, arrayA, arrayB) {
    var array = [];
    var length = Math.min(arrayA.length, arrayB.length);
    for (var i = 0; i < length; i ++) {
        array.push(func(arrayA[i], arrayB[i]));
    }
    return array;
}


end();
