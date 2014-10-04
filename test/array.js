/*
 * Loquat.test / array.js
 * copyright (c) 2014 Susisu
 */

var should = require("should");

var lq = Object.freeze({
    "array": require("../src/array"),
    "util" : require("../src/util")
});


describe("array", function () {
    describe("Array", function () {
        describe("#uncons()", function () {
            it("should return an empty array when the array is empty", function () {
                [].uncons().length.should.equal(0);
            });

            it("should return an array, the first element of which is the head of the array and the secound is the rest", function () {
                var u1 = [1].uncons();
                u1.length.should.equal(2);
                u1[0].should.equal(1);
                lq.util.ArrayUtil.equals(u1[1], []).should.be.ok;

                var u2 = [1, 2, 3, 4, 5].uncons();
                u2.length.should.equal(2);
                u2[0].should.equal(1);
                lq.util.ArrayUtil.equals(u2[1], [2, 3, 4, 5]).should.be.ok;
            });
        });
    });
});
