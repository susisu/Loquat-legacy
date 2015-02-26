/*
 * Loquat.test / util.js
 * copyright (c) 2014 Susisu
 */

var chai   = require("chai"),
    expect = chai.expect;

var lq = Object.freeze({
    "util": require("../lib/util")
});

describe("util", function () {
    describe("ArrayUtil", function () {
        var ArrayUtil = lq.util.ArrayUtil;

        describe(".equals(arrayA, arrayB, elementEquals)", function () {
            it("should return true when each elements of two arrays are equal", function () {
                expect(
                    ArrayUtil.equals([], [])
                ).to.be.true;
                expect(
                    ArrayUtil.equals([1, 2, 3], [1, 2, 3])
                ).to.be.true;
                expect(
                    ArrayUtil.equals(["true", "false"], [true, false], function (x, y) { return x === y.toString(); })
                ).to.be.true;
            });

            it("should return true when two arrays have different elements or the lengths of the arrays are different", function () {
                expect(
                    ArrayUtil.equals([1, 2, 3], [1, 2, 4])
                ).to.be.false;
                expect(
                    ArrayUtil.equals([1, 2], [3, 4, 5])
                ).to.be.false;
            });
        });

        describe(".nub(array)", function () {
            it("should return a new array that contains all the unique elements of 'array'", function () {
                expect(ArrayUtil.nub([])).to.deep.equal([]);
                expect(ArrayUtil.nub([1, 2, 3])).to.deep.equal([1, 2, 3]);
                expect(ArrayUtil.nub([1, 4, 6, 4, 1])).to.deep.equal([1, 4, 6]);
            });
        });

        describe(".replicate(n, element)", function () {
            it("should return an array, the length of which is 'n' and every element is 'element'", function () {
                expect(ArrayUtil.replicate(0, 1)).to.deep.equal([]);
                expect(ArrayUtil.replicate(3, 1)).to.deep.equal([1, 1, 1]);
            });
        });

        describe(".zipWith(func, arrayA, arrayB)", function () {
            it("should return a new array zipped with 'func'", function () {
                expect(
                    ArrayUtil.zipWith(function (x, y) { return x + y; }, [1, 2, 3], [4, 5, 6])
                ).to.deep.equal([5, 7, 9]);
                expect(
                    ArrayUtil.zipWith(function (x, y) { return x + y; }, [1, 2, 3], [4])
                ).to.deep.equal([5]);
                expect(
                    ArrayUtil.zipWith(function (x, y) { return x + y; }, [1], [4, 5, 6])
                ).to.deep.equal([5]);
            });
        });
    });

    describe("CharUtil", function () {
        var CharUtil = lq.util.CharUtil;

        describe(".isSpace(char)", function () {
            it("it should return true when '\\t', '\\n', '\\r', '\\f', '\\v' or space is given", function () {
                expect(" \t\n\r\f\v".split("").every(CharUtil.isSpace)).to.be.true;
                expect("Aa1!".split("").some(CharUtil.isSpace)).to.be.false;
                expect(CharUtil.isSpace(" \t")).to.be.false;
            });
        });

        describe(".isUpper(char)", function () {
            it("it should return true when upper case character (A to Z) is given", function () {
                expect("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").every(CharUtil.isUpper)).to.be.true;
                expect(" a1!".split("").some(CharUtil.isUpper)).to.be.false;
            });
        });

        describe(".isLower(char)", function () {
            it("it should return true when lower case character (a to z) is given", function () {
                expect("abcdefghijklmnopqrstuvwxyz".split("").every(CharUtil.isLower)).to.be.true;
                expect(" A1!".split("").some(CharUtil.isLower)).to.be.false;
            });
        });

        describe(".isAlphaNum(char)", function () {
            it("it should return true when letter (A to Z or a to z) or digit (0 to 9) is given", function () {
                expect(
                    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("").every(CharUtil.isAlphaNum)
                ).to.be.true;
                expect(" !".split("").some(CharUtil.isAlphaNum)).to.be.false;
            });
        });

        describe(".isAlpha(char)", function () {
            it("it should return true when letter (A to Z or a to z) is given", function () {
                expect(
                    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("").every(CharUtil.isAlpha)
                ).to.be.true;
                expect(" 1!".split("").some(CharUtil.isAlpha)).to.be.false;
            });
        });

        describe(".isDigit(char)", function () {
            it("it should return true when digit (0 to 9) is given", function () {
                expect("0123456789".split("").every(CharUtil.isDigit)).to.be.true;
                expect(" Aa!".split("").some(CharUtil.isDigit)).to.be.false;
            });
        });

        describe(".isHexDigit(char)", function () {
            it("it should return true when hexadecimal digit (0 to 9, A to Z or a to z) is given", function () {
                expect("0123456789ABCDEFabcdef".split("").every(CharUtil.isHexDigit)).to.be.true;
                expect(" Gg!".split("").some(CharUtil.isHexDigit)).to.be.false;
            });
        });

        describe(".isOctDigit(char)", function () {
            it("it should return true when octal digit (0 to 7) is given", function () {
                expect("01234567".split("").every(CharUtil.isOctDigit)).to.be.true;
                expect(" Aa8!".split("").some(CharUtil.isOctDigit)).to.be.false;
            });
        });
    });

    describe("show(value)", function () {
        var show = lq.util.show;

        it("should return quoted character when 'value' is a single character", function () {
            expect(show(" ")).to.equal("\" \"");
            expect(show("0")).to.equal("\"0\"");
            expect(show("A")).to.equal("\"A\"");
            expect(show("a")).to.equal("\"a\"");
            expect(show("!")).to.equal("\"!\"");
            expect(show("\\")).to.equal("\"\\\\\"");
            expect(show("\"")).to.equal("\"\\\"\"");
            expect(show("\b")).to.equal("\"\\b\"");
            expect(show("\t")).to.equal("\"\\t\"");
            expect(show("\n")).to.equal("\"\\n\"");
            expect(show("\r")).to.equal("\"\\r\"");
            expect(show("\f")).to.equal("\"\\f\"");
            expect(show("\v")).to.equal("\"\\v\"");
        });

        it("should return quoted string when 'value' is a string", function () {
            expect(show("foo")).to.equal("\"foo\"");
            expect(show(new String("bar"))).to.equal("\"bar\"");
            expect(show("a\\\"\b\t\n\r\f\v\\\"\b\t\n\r\f\vz")).to.equal("\"a\\\\\\\"\\b\\t\\n\\r\\f\\v\\\\\\\"\\b\\t\\n\\r\\f\\vz\"");
        });

        it("should return the string representation of array when 'value' is an array, each element is stringified by 'show'", function () {
            expect(show([1, 2, 3])).to.equal("[1, 2, 3]");
            expect(show(["a", "b", "c"])).to.equal("[\"a\", \"b\", \"c\"]");
            expect(show([1, [2, 3], [4, [5, 6]]])).to.equal("[1, [2, 3], [4, [5, 6]]]");
        });

        it("should return the string representation of 'value' when it is not a string", function () {
            expect(show(1)).to.equal("1");
            expect(show(true)).to.equal("true");
            expect(show(null)).to.equal("null");
            expect(show(undefined)).to.equal("undefined");
        });
    });

    describe("uncons(value)", function () {
        var uncons = lq.util.uncons;

        it("should return an empty array when 'value' is an empty array", function () {
            expect(uncons([])).to.be.empty;
        });

        it("should return an array, the first element of which is the head of the array 'value' and the secound is the rest", function () {
            var u1 = uncons([1]);
            expect(u1).to.deep.equal([1, []]);

            var u2 = uncons([1, 2, 3, 4, 5]);
            expect(u2).to.deep.equal([1, [2, 3, 4, 5]]);
        });

        it("should return an empty array when 'value' is an empty string", function () {
            expect(uncons("")).to.be.empty;
        });

        it("should return an array, the first element of which is the head of the string 'value' and the secound is the rest", function () {
            var u1 = uncons("a");
            expect(u1).to.deep.equal(["a", ""]);

            var u2 = uncons("abcde");
            expect(u2).to.deep.equal(["a", "bcde"]);
        });

        it("should call 'uncons' method if 'value' is neither an array nor a string", function () {
            var foo = {
                "uncons": function () {
                    return ["a", "bcde"];
                }
            };

            var u = uncons(foo);
            expect(u).to.deep.equal(["a", "bcde"]);
        });
    });
});