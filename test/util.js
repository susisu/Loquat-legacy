/*
 * Loquat.test / util.js
 * copyright (c) 2014 Susisu
 */

var should = require("should");

var lq = Object.freeze({
    "util": require("../lib/util")
});

describe("util", function () {
    describe("ArrayUtil", function () {
        describe(".equals(arrayA, arrayB, elementEquals)", function () {
            it("should return true when each elements of two arrays are equal", function () {
                lq.util.ArrayUtil.equals([], []).should.be.ok;
                lq.util.ArrayUtil.equals([1, 2, 3], [1, 2, 3]).should.be.ok;
                lq.util.ArrayUtil.equals(["true", "false"], [true, false], function (x, y) { return x === y.toString(); }).should.be.ok;
            });

            it("should return true when two arrays have different elements or the lengths of the arrays are different", function () {
                lq.util.ArrayUtil.equals([1, 2, 3], [1, 2, 4]).should.not.be.ok;
                lq.util.ArrayUtil.equals([1, 2], [3, 4, 5]).should.not.be.ok;
            });
        });

        describe(".head(array)", function () {
            it("should return the first element of 'array'", function () {
                lq.util.ArrayUtil.head([1, 2, 3]).should.equal(1);
            });
        });

        describe(".tail(array)", function () {
            it("should return a new array that contains all the elements of 'array' except the first element", function () {
                lq.util.ArrayUtil.equals(lq.util.ArrayUtil.tail([1]), []).should.be.ok;
                lq.util.ArrayUtil.equals(lq.util.ArrayUtil.tail([1, 2, 3]), [2, 3]).should.be.ok;
            });
        });

        describe(".init(array)", function () {
            it("should return a new array that contains all the elements of 'array' except the last element", function () {
                lq.util.ArrayUtil.equals(lq.util.ArrayUtil.init([1]), []).should.be.ok;
                lq.util.ArrayUtil.equals(lq.util.ArrayUtil.init([1, 2, 3]), [1, 2]).should.be.ok;
            });
        });

        describe(".last(array)", function () {
            it("should return the last element of array", function () {
                lq.util.ArrayUtil.last([1, 2, 3]).should.equal(3);
            });
        });

        describe(".cons(head, tail)", function () {
            it("should return a new array that 'head' is concatenated to the head of 'tail'", function () {
                lq.util.ArrayUtil.equals(lq.util.ArrayUtil.cons(1, []), [1]).should.be.ok;
                lq.util.ArrayUtil.equals(lq.util.ArrayUtil.cons(1, [2, 3, 4]), [1, 2, 3, 4]).should.be.ok;
            });
        });

        describe(".nub(array)", function () {
            it("should return a new array that contains all the unique elements of 'array'", function () {
                lq.util.ArrayUtil.equals(lq.util.ArrayUtil.nub([]), []).should.be.ok;
                lq.util.ArrayUtil.equals(lq.util.ArrayUtil.nub([1, 2, 3]), [1, 2, 3]).should.be.ok;
                lq.util.ArrayUtil.equals(lq.util.ArrayUtil.nub([1, 4, 6, 4, 1]), [1, 4, 6]).should.be.ok;
            });
        });

        describe(".replicate(n, element)", function () {
            it("should return an array, the length of which is 'n' and every element is 'element'", function () {
                lq.util.ArrayUtil.equals(lq.util.ArrayUtil.replicate(0, 1), []).should.be.ok;
                lq.util.ArrayUtil.equals(lq.util.ArrayUtil.replicate(3, 1), [1, 1, 1]).should.be.ok;
            });
        });

        describe(".zipWith(func, arrayA, arrayB)", function () {
            it("should return a new array zipped with 'func'", function () {
                lq.util.ArrayUtil.equals(
                    lq.util.ArrayUtil.zipWith(function (x, y) { return x + y; }, [1, 2, 3], [4, 5, 6]),
                    [5, 7, 9]
                ).should.be.ok;
                lq.util.ArrayUtil.equals(
                    lq.util.ArrayUtil.zipWith(function (x, y) { return x + y; }, [1, 2, 3], [4]),
                    [5]
                ).should.be.ok;
                lq.util.ArrayUtil.equals(
                    lq.util.ArrayUtil.zipWith(function (x, y) { return x + y; }, [1], [4, 5, 6]),
                    [5]
                ).should.be.ok;
            });
        });
    });

    describe("CharUtil", function () {
        describe(".isSpace(char)", function () {
            it("it should return true when '\\t', '\\n', '\\r', '\\f', '\\v' or space is given", function () {
                " \t\n\r\f\v".split("").every(lq.util.CharUtil.isSpace).should.be.ok;
                "Aa1!".split("").some(lq.util.CharUtil.isSpace).should.not.be.ok;
                lq.util.CharUtil.isSpace(" \t").should.not.be.ok;
            });
        });

        describe(".isUpper(char)", function () {
            it("it should return true when upper case character (A to Z) is given", function () {
                "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").every(lq.util.CharUtil.isUpper).should.be.ok;
                " a1!".split("").some(lq.util.CharUtil.isUpper).should.not.be.ok;
            });
        });

        describe(".isLower(char)", function () {
            it("it should return true when lower case character (a to z) is given", function () {
                "abcdefghijklmnopqrstuvwxyz".split("").every(lq.util.CharUtil.isLower).should.be.ok;
                " A1!".split("").some(lq.util.CharUtil.isLower).should.not.be.ok;
            });
        });

        describe(".isAlphaNum(char)", function () {
            it("it should return true when letter (A to Z or a to z) or digit (0 to 9) is given", function () {
                "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("")
                    .every(lq.util.CharUtil.isAlphaNum).should.be.ok;
                " !".split("").some(lq.util.CharUtil.isAlphaNum).should.not.be.ok;
            });
        });

        describe(".isAlpha(char)", function () {
            it("it should return true when letter (A to Z or a to z) is given", function () {
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("")
                    .every(lq.util.CharUtil.isAlpha).should.be.ok;
                " 1!".split("").some(lq.util.CharUtil.isAlpha).should.not.be.ok;
            });
        });

        describe(".isDigit(char)", function () {
            it("it should return true when digit (0 to 9) is given", function () {
                "0123456789".split("").every(lq.util.CharUtil.isDigit).should.be.ok;
                " Aa!".split("").some(lq.util.CharUtil.isDigit).should.not.be.ok;
            });
        });

        describe(".isHexDigit(char)", function () {
            it("it should return true when hexadecimal digit (0 to 9, A to Z or a to z) is given", function () {
                "0123456789ABCDEFabcdef".split("").every(lq.util.CharUtil.isHexDigit).should.be.ok;
                " Gg!".split("").some(lq.util.CharUtil.isHexDigit).should.not.be.ok;
            });
        });

        describe(".isOctDigit(char)", function () {
            it("it should return true when octal digit (0 to 7) is given", function () {
                "01234567".split("").every(lq.util.CharUtil.isOctDigit).should.be.ok;
                " Aa8!".split("").some(lq.util.CharUtil.isOctDigit).should.not.be.ok;
            });
        });
    });

    describe("show(value)", function () {
        it("should return quoted string when 'value' is a string", function () {
            lq.util.show("foo").should.equal("\"foo\"");
            lq.util.show(new String("bar")).should.equal("\"bar\"");
            lq.util.show("a\\\"\t\n\r\f\v\bz").should.equal("\"a\\\\\\\"\\t\\n\\r\\f\\v\\bz\"");
        });

        it("should return the string representation of 'value' when it is not a string", function () {
            lq.util.show(1).should.equal("1");
            lq.util.show(true).should.equal("true");
            lq.util.show(["a", "b", "c"]).should.equal("a,b,c");
            lq.util.show(null).should.equal("null");
            lq.util.show(undefined).should.equal("undefined");
        });
    });
});