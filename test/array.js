/*
 * Loquat.test / array.js
 * copyright (c) 2014 Susisu
 */

var chai   = require("chai"),
    expect = chai.expect;

var lq = Object.freeze({
    "array": require("../lib/array"),
    "util" : require("../lib/util")
});


describe("array", function () {
    describe("Array", function () {
        describe("#uncons()", function () {
            it("should return an empty array when the array is empty", function () {
                expect([].uncons()).to.be.empty;
            });

            it("should return an array, the first element of which is the head of the array and the secound is the rest", function () {
                var u1 = [1].uncons();
                expect(u1).to.deep.equal([1, []]);

                var u2 = [1, 2, 3, 4, 5].uncons();
                expect(u2).to.deep.equal([1, [2, 3, 4, 5]]);
            });
        });
    });
});
