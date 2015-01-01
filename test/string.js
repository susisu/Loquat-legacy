/*
 * Loquat.test / string.js
 * copyright (c) 2014 Susisu
 */

var chai   = require("chai"),
    expect = chai.expect;

var lq = Object.freeze({
    "string": require("../lib/string")
});


describe("string", function () {
    describe("String", function () {
        describe("#uncons()", function () {
            it("should return an empty array when the string is empty", function () {
                expect("".uncons()).to.be.empty;
            });

            it("should return an array, the first element of which is the head of the string and the secound is the rest", function () {
                var u1 = "a".uncons();
                expect(u1).to.deep.equal(["a", ""]);

                var u2 = "abcde".uncons();
                expect(u2).to.deep.equal(["a", "bcde"]);
            });
        });
    });
});
