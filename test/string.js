/*
 * Loquat.test / string.js
 * copyright (c) 2014 Susisu
 */

var should = require("should");

var lq = Object.freeze({
    "string": require("../src/string")
});


describe("string", function () {
    describe("String", function () {
        describe("#uncons()", function () {
            it("should return an empty array when the string is empty", function () {
                "".uncons().length.should.equal(0);
            });

            it("should return an array, the first element of which is the head of the string and the secound is the rest", function () {
                var u1 = "a".uncons();
                u1.length.should.equal(2);
                u1[0].should.equal("a");
                u1[1].should.equal("");

                var u2 = "abcde".uncons();
                u2.length.should.equal(2);
                u2[0].should.equal("a");
                u2[1].should.equal("bcde");
            });
        });
    });
});
