/*
 * Loquat.test / array.js
 * copyright (c) 2014 Susisu
 */

var should = require("should");

var lq = Object.freeze({
    "array": require("../src/array")
});


describe("array", function () {
    describe("Array", function () {
        describe("#uncons()", function () {
            it("should return an empty array when the length of the array is 0", function () {
                [].uncons().length.should.equal(0);
            });

            it("should return an array, the first element of which is the head of the array and the secound is the rest", function () {
                var u1 = [1].uncons();
                u1.length.should.equal(2);
                u1[0].should.equal(1);
                lq.array.arrayEquals(u1[1], []).should.be.ok;

                var u2 = [1, 2, 3, 4, 5].uncons();
                u2.length.should.equal(2);
                u2[0].should.equal(1);
                lq.array.arrayEquals(u2[1], [2, 3, 4, 5]).should.be.ok;
            });
        });
    });

    describe("arrayEquals(arrayA, arrayB[, elementEquals])", function () {
        it("should return true when each elements of two arrays are equal", function () {
            lq.array.arrayEquals([], []).should.be.ok;
            lq.array.arrayEquals([1, 2, 3], [1, 2, 3]).should.be.ok;
            lq.array.arrayEquals(["true", "false"], [true, false], function (x, y) { return x === y.toString(); }).should.be.ok;
        });

        it("should return true when two arrays have different elements or the lengths of the arrays are different", function () {
            lq.array.arrayEquals([1, 2, 3], [1, 2, 4]).should.not.be.ok;
            lq.array.arrayEquals([1, 2], [3, 4, 5]).should.not.be.ok;
        });
    });

    describe("head(array)", function () {
        it("should return the first element of 'array'", function () {
            lq.array.head([1, 2, 3]).should.equal(1);
        });
    });

    describe("tail(array)", function () {
        it("should return a new array that contains all the elements of 'array' except the first element", function () {
            lq.array.arrayEquals(lq.array.tail([1]), []).should.be.ok;
            lq.array.arrayEquals(lq.array.tail([1, 2, 3]), [2, 3]).should.be.ok;
        });
    });

    describe("init(array)", function () {
        it("should return a new array that contains all the elements of 'array' except the last element", function () {
            lq.array.arrayEquals(lq.array.init([1]), []).should.be.ok;
            lq.array.arrayEquals(lq.array.init([1, 2, 3]), [1, 2]).should.be.ok;
        });
    });

    describe("last(array)", function () {
        it("should return the last element of array", function () {
            lq.array.last([1, 2, 3]).should.equal(3);
        });
    });

    describe("cons(head, tail)", function () {
        it("should return a new array that 'head' is concatenated to the head of 'tail'", function () {
            lq.array.arrayEquals(lq.array.cons(1, []), [1]).should.be.ok;
            lq.array.arrayEquals(lq.array.cons(1, [2, 3, 4]), [1, 2, 3, 4]).should.be.ok;
        });
    });

    describe("nub(array)", function () {
        it("should return a new array that contains all the unique elements of 'array'", function () {
            lq.array.arrayEquals(lq.array.nub([]), []).should.be.ok;
            lq.array.arrayEquals(lq.array.nub([1, 2, 3]), [1, 2, 3]).should.be.ok;
            lq.array.arrayEquals(lq.array.nub([1, 4, 6, 4, 1]), [1, 4, 6]).should.be.ok;
        });
    });

    describe("replicate(n, element)", function () {
        it("should return an array, the length of which is 'n' and every element is 'element'", function () {
            lq.array.arrayEquals(lq.array.replicate(0, 1), []).should.be.ok;
            lq.array.arrayEquals(lq.array.replicate(3, 1), [1, 1, 1]).should.be.ok;
        });
    });

    describe("zipWith(func, arrayA, arrayB)", function () {
        it("should return a new array zipped with 'func'", function () {
            lq.array.arrayEquals(
                lq.array.zipWith(function (x, y) { return x + y; }, [1, 2, 3], [4, 5, 6]),
                [5, 7, 9]
            ).should.be.ok;
            lq.array.arrayEquals(
                lq.array.zipWith(function (x, y) { return x + y; }, [1, 2, 3], [4]),
                [5]
            ).should.be.ok;
            lq.array.arrayEquals(
                lq.array.zipWith(function (x, y) { return x + y; }, [1], [4, 5, 6]),
                [5]
            ).should.be.ok;
        });
    })
});
