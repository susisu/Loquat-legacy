/*
 * Loquat / util.js
 * copyright (c) 2014 Susisu
 *
 * utility functions
 */

function end () {
    module.exports = Object.freeze({
        "ArrayUtil": ArrayUtil
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

    "head": function (array) {
        return array[0];
    },

    "tail": function (array) {
        return array.slice(1);
    },

    "init": function (array) {
        return array.slice(0, array.length - 1);
    },

    "last": function (array) {
        return array[array.length - 1];
    },

    "cons": function (head, tail) {
        return [head].concat(tail);
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


end();
