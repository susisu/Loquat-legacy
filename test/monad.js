/*
 * Loquat.test / monad.js
 * copyright (c) 2014 Susisu
 */

var should = require("should");

var lq = Object.freeze({
    "error": require("../lib/error"),
    "monad": require("../lib/monad"),
    "pos"  : require("../lib/pos"),
    "prim" : require("../lib/prim"),
    "util" : require("../lib/util")
});


describe("monad", function () {
    var ErrorMessage = lq.error.ErrorMessage;
    var ErrorMessageType = lq.error.ErrorMessageType;
    var ParseError = lq.error.ParseError;
    var SourcePos = lq.pos.SourcePos;
    var State = lq.prim.State;
    var Result = lq.prim.Result;
    var Parser = lq.prim.Parser;
    var LazyParser = lq.prim.LazyParser;

    function alwaysCSuc (value, state, error) {
        return new Parser(function (state_, csuc, cerr, esuc, eerr) {
            return csuc(value, state, error);
        });
    }

    function alwaysCErr (error) {
        return new Parser(function (state, csuc, cerr, esuc, eerr) {
            return cerr(error);
        });
    }

    function alwaysESuc (value, state, error) {
        return new Parser(function (state_, csuc, cerr, esuc, eerr) {
            return esuc(value, state, error);
        });
    }

    function alwaysEErr (error) {
        return new Parser(function (state, csuc, cerr, esuc, eerr) {
            return eerr(error);
        });
    }

    function throwError () {
        throw new Error("unexpected call of result function");
    }

    describe("forever(parser)", function () {

    });

    describe("nullify(parser)", function () {
        it("should return a parser that runs 'parser' and discards the result", function () {
            lq.monad.nullify(alwaysCSuc(
                "foo",
                new State("abc", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                )
            )).run(
                new State("def", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("abc", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.nullify(alwaysCErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                )
            )).run(
                new State("def", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.nullify(alwaysESuc(
                "foo",
                new State("abc", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                )
            )).run(
                new State("def", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("abc", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.nullify(alwaysEErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                )
            )).run(
                new State("def", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                        )
                    ).should.be.ok;
                }
            );
        });
    });

    describe("join(parser)", function () {

    });

    describe("when(flag, parser)", function () {

    });

    describe("unless(flag, parser)", function () {

    });

    describe("liftM(func)", function () {

    });

    describe("liftM2(func)", function () {

    });

    describe("liftM3(func)", function () {

    });

    describe("liftM4(func)", function () {

    });

    describe("liftM5(func)", function () {

    });

    describe("ltor(funcA, funcB)", function () {

    });

    describe("rtol(funcA, funcB)", function () {

    });

    describe("sequence(parsers)", function () {

    });

    describe("sequence_(parsers)", function () {

    });

    describe("mapM(func, array)", function () {

    });

    describe("mapM_(func, array)", function () {

    });

    describe("forM(array, func)", function () {

    });

    describe("forM_(array, func)", function () {

    });

    describe("filterM(test, array)", function () {

    });

    describe("zipWithM(func, parsersA, parsersB)", function () {

    });

    describe("zipWithM_(func, parsersA, parsersB", function () {

    });

    describe("foldM(func, initialValue, array)", function () {

    });

    describe("foldM_(func, initialValue, array)", function () {

    });

    describe("replicateM(n, parser)", function () {

    });

    describe("replicateM_(n, parser)", function () {

    });

    describe("guard(flag)", function () {

    });

    describe("msum(parsers)", function () {

    });

    describe("mfilter(test, parser)", function () {

    });
});
