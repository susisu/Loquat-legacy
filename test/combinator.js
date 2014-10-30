/*
 * Loquat.test / combinator.js
 * copyright (c) 2014 Susisu
 */

var should = require("should");

var lq = Object.freeze({
    "combinator": require("../lib/combinator"),
    "error"     : require("../lib/error"),
    "monad"     : require("../lib/monad"),
    "pos"       : require("../lib/pos"),
    "prim"      : require("../lib/prim"),
    "util"      : require("../lib/util")
});


describe("combinator", function () {
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

    describe("choice(parsers)", function () {
        it("should try each parser in 'parsers' until one succeeds", function () {
            var acsuc = alwaysCSuc(
                "foo",
                new State("def", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                )
            );

            var acerr = alwaysCErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                )
            );

            var aesuc = alwaysESuc(
                "bar",
                new State("def", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                )
            );

            var aeerr = alwaysEErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                )
            );

            var initState = new State("abc", SourcePos.init("test"), "some");

            lq.combinator.choice([]).run(
                initState,
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                }
            );

            [acsuc, acerr, aesuc, aeerr].forEach(function (a2) {
                lq.combinator.choice([acsuc, a2]).run(
                    initState,
                    function (value, state, error) {
                        value.should.equal("foo");
                        State.equals(
                            state,
                            new State("def", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                lq.combinator.choice([acerr, a2]).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.combinator.choice([aesuc, a2]).run(
                    initState,
                    throwError,
                    throwError,
                    function (value, state, error) {
                        value.should.equal("bar");
                        State.equals(
                            state,
                            new State("def", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );
            });

            lq.combinator.choice([aeerr, acsuc]).run(
                initState,
                function (value, state, error) {
                    value.should.equal("foo");
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.choice([aeerr, acerr]).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.choice([aeerr, aesuc]).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("bar");
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.choice([aeerr, aeerr]).run(
                initState,
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                }
            );
        });
    });

    describe("option(value, parser)", function () {
        it("should try 'parser' and return the result when 'parser' succeeded or failed with consumption", function () {
            lq.combinator.option(
                "bar",
                alwaysCSuc(
                    "foo",
                    new State("def", new SourcePos("test", 1, 2), "none"),
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                    )
                )
            ).run(
                new State("abc", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("foo");
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.option(
                "bar",
                alwaysCErr(
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                    )
                )
            ).run(
                new State("abc", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.option(
                "bar",
                alwaysESuc(
                    "foo",
                    new State("def", new SourcePos("test", 1, 2), "none"),
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                    )
                )
            ).run(
                new State("abc", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("foo");
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                        )
                    ).should.be.ok;
                },
                throwError
            );
        });

        it("should try 'parser' and succeed with 'value' when 'parser' failed without consumption", function () {
            lq.combinator.option(
                "bar",
                alwaysEErr(
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                    )
                )
            ).run(
                new State("abc", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("bar");
                    State.equals(
                        state,
                        new State("abc", SourcePos.init("test"), "some")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError
            );
        });
    });

    describe("optionMaybe(parser)", function () {
        it("should try 'parser' and return an array containing only the result when 'parser' succeeded or failed with consumption", function () {
            lq.combinator.optionMaybe(
                alwaysCSuc(
                    "foo",
                    new State("def", new SourcePos("test", 1, 2), "none"),
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                    )
                )
            ).run(
                new State("abc", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["foo"]);
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.optionMaybe(
                alwaysCErr(
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                    )
                )
            ).run(
                new State("abc", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.optionMaybe(
                alwaysESuc(
                    "foo",
                    new State("def", new SourcePos("test", 1, 2), "none"),
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                    )
                )
            ).run(
                new State("abc", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["foo"]);
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                        )
                    ).should.be.ok;
                },
                throwError
            );
        });

        it("should try 'parser' and succeed with an empty array when 'parser' failed without consumption", function () {
            lq.combinator.optionMaybe(
                alwaysEErr(
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                    )
                )
            ).run(
                new State("abc", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, []);
                    State.equals(
                        state,
                        new State("abc", SourcePos.init("test"), "some")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError
            );
        });
    });

    describe("optional(parser)", function () {

    });

    describe("between(open, close, parser)", function () {

    });

    describe("many1(parser)", function () {

    });

    describe("skipMany1(parser)", function () {

    });

    describe("sepBy(parser, separator)", function () {

    });

    describe("sepBy1(parser, separator)", function () {

    });

    describe("sepEndBy(parser, separator)", function () {

    });

    describe("sepEndBy1(parser, separator)", function () {

    });

    describe("endBy(parser, separator)", function () {

    });

    describe("endBy1(parser, separator)", function () {

    });

    describe("count(n, parser)", function () {

    });

    describe("chainl(parser, operator, initialValue)", function () {

    });

    describe("chainl1(parser, operator)", function () {

    });

    describe("chainr(parser, operator, initialValue)", function () {

    });

    describe("chainr1(parser, operator)", function () {

    });

    describe("anyToken", function () {

    });

    describe("eof", function () {

    });

    describe("notFollowedBy(parser)", function () {

    });

    describe("manyTill(parser, end)", function () {

    });
});
