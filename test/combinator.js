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
        it("should try 'parser' and return 'undefined' when 'parser' succeeded or failed without consumption", function () {
            lq.combinator.optional(
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
                    (value === undefined).should.be.ok;
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

            lq.combinator.optional(
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
                    (value === undefined).should.be.ok;
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

            lq.combinator.optional(
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
                    (value === undefined).should.be.ok;
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

        it("should try 'parser' and fail when 'parser' failed with consumption", function () {
            lq.combinator.optional(
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
        });
    });

    describe("between(open, close, parser)", function () {
        it("should parse something that 'parser' accepts between 'open' and 'close'", function () {
            var open_acsuc = alwaysCSuc(
                "(",
                new State("def", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "open_csuc")]
                )
            );

            var open_acerr = alwaysCErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "open_cerr")]
                )
            );

            var open_aesuc = alwaysESuc(
                "(",
                new State("def", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "open_esuc")]
                )
            );

            var open_aeerr = alwaysEErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "open_eerr")]
                )
            );

            var content_acsuc = alwaysCSuc(
                "foo",
                new State("ghi", new SourcePos("test", 3, 4), "none"),
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "content_csuc")]
                )
            );

            var content_acerr = alwaysCErr(
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "content_cerr")]
                )
            );

            var content_aesuc = alwaysESuc(
                "bar",
                new State("ghi", new SourcePos("test", 3, 4), "none"),
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "content_esuc")]
                )
            );

            var content_aeerr = alwaysEErr(
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "content_eerr")]
                )
            );

            var close_acsuc = alwaysCSuc(
                ")",
                new State("jkl", new SourcePos("test", 5, 6), "none"),
                new ParseError(
                    new SourcePos("test", 5, 6),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "close_csuc")]
                )
            );

            var close_acerr = alwaysCErr(
                new ParseError(
                    new SourcePos("test", 5, 6),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "close_cerr")]
                )
            );

            var close_aesuc = alwaysESuc(
                ")",
                new State("jkl", new SourcePos("test", 5, 6), "none"),
                new ParseError(
                    new SourcePos("test", 5, 6),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "close_esuc")]
                )
            );

            var close_aeerr = alwaysEErr(
                new ParseError(
                    new SourcePos("test", 5, 6),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "close_eerr")]
                )
            );

            var initState = new State("abc", SourcePos.init("test"), "some");

            lq.combinator.between(open_acsuc, close_acsuc, content_acsuc).run(
                initState,
                function (value, state, error) {
                    value.should.equal("foo");
                    State.equals(
                        state,
                        new State("jkl", new SourcePos("test", 5, 6), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 5, 6),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "close_csuc")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.between(open_acsuc, close_acerr, content_acsuc).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 5, 6),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "close_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.between(open_acsuc, close_aesuc, content_acsuc).run(
                initState,
                function (value, state, error) {
                    value.should.equal("foo");
                    State.equals(
                        state,
                        new State("jkl", new SourcePos("test", 5, 6), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "content_csuc")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.between(open_acsuc, close_aeerr, content_acsuc).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "content_csuc")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.between(open_acsuc, close_acsuc, content_aesuc).run(
                initState,
                function (value, state, error) {
                    value.should.equal("bar");
                    State.equals(
                        state,
                        new State("jkl", new SourcePos("test", 5, 6), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 5, 6),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "close_csuc")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.between(open_acsuc, close_acerr, content_aesuc).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 5, 6),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "close_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.between(open_acsuc, close_aesuc, content_aesuc).run(
                initState,
                function (value, state, error) {
                    value.should.equal("bar");
                    State.equals(
                        state,
                        new State("jkl", new SourcePos("test", 5, 6), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "open_csuc")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.between(open_acsuc, close_aeerr, content_aesuc).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "open_csuc")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.between(open_aesuc, close_acsuc, content_acsuc).run(
                initState,
                function (value, state, error) {
                    value.should.equal("foo");
                    State.equals(
                        state,
                        new State("jkl", new SourcePos("test", 5, 6), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 5, 6),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "close_csuc")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.between(open_aesuc, close_acerr, content_acsuc).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 5, 6),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "close_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.between(open_aesuc, close_aesuc, content_acsuc).run(
                initState,
                function (value, state, error) {
                    value.should.equal("foo");
                    State.equals(
                        state,
                        new State("jkl", new SourcePos("test", 5, 6), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "content_csuc")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.between(open_aesuc, close_aeerr, content_acsuc).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "content_csuc")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.between(open_aesuc, close_acsuc, content_aesuc).run(
                initState,
                function (value, state, error) {
                    value.should.equal("bar");
                    State.equals(
                        state,
                        new State("jkl", new SourcePos("test", 5, 6), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 5, 6),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "close_csuc")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.between(open_aesuc, close_acerr, content_aesuc).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 5, 6),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "close_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.between(open_aesuc, close_aesuc, content_aesuc).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("bar");
                    State.equals(
                        state,
                        new State("jkl", new SourcePos("test", 5, 6), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "open_esuc")]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.between(open_aesuc, close_aeerr, content_aesuc).run(
                initState,
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "open_esuc")]
                        )
                    ).should.be.ok;
                }
            );

            [close_acsuc, close_acerr, close_aesuc, close_aeerr].forEach(function (close_a) {
                lq.combinator.between(open_acsuc, close_a, content_acerr).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 3, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "content_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.combinator.between(open_aesuc, close_a, content_acerr).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 3, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "content_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.combinator.between(open_acsuc, close_a, content_aeerr).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "open_csuc")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.combinator.between(open_aesuc, close_a, content_aeerr).run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "open_esuc")]
                            )
                        ).should.be.ok;
                    }
                );

                [content_acsuc, content_acerr, content_aesuc, content_aeerr].forEach(function (content_a) {
                    lq.combinator.between(open_acerr, close_a, content_a).run(
                        initState,
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [new ErrorMessage(ErrorMessageType.MESSAGE, "open_cerr")]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );

                    lq.combinator.between(open_aeerr, close_a, content_a).run(
                        initState,
                        throwError,
                        throwError,
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [new ErrorMessage(ErrorMessageType.MESSAGE, "open_eerr")]
                                )
                            ).should.be.ok;
                        }
                    );
                });
            });
        });
    });

    describe("many1(parser)", function () {
        it("should return a parser that runs 'parser' one or more times and accumulates the results of them in an array", function () {
            var p = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case "a": return csuc(
                            "a" + state.position.column.toString(),
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                            )
                        );
                    case "b": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        );
                    case "c": return esuc(
                            "c" + state.position.column.toString(),
                            new State(
                                state.input,
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        );
                }
            });
            
            lq.combinator.many1(p).run(
                new State("aab", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.many1(p).run(
                new State("aad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.many1(p).run(
                new State("b", SourcePos.init("test"), "some"),
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

            lq.combinator.many1(p).run(
                new State("d", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                }
            );

            (function () {
                var caughtError;
                try {
                    lq.combinator.many1(p).run(
                        new State("acbd", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        throwError
                    );
                }
                catch (error) {
                    caughtError = error;
                }
                finally {
                    if (caughtError) {
                        if (caughtError.message !== "'many' is applied to a parser that accepts an empty string") {
                            throw caughtError;
                        }
                    }
                    else {
                        throw new Error("no error was thrown");
                    }
                }
            })();

            (function () {
                var caughtError;
                try {
                    lq.combinator.many1(p).run(
                        new State("cabd", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        throwError
                    );
                }
                catch (error) {
                    caughtError = error;
                }
                finally {
                    if (caughtError) {
                        if (caughtError.message !== "'many' is applied to a parser that accepts an empty string") {
                            throw caughtError;
                        }
                    }
                    else {
                        throw new Error("no error was thrown");
                    }
                }
            })();
        });
    });

    describe("skipMany1(parser)", function () {
        it("should return a parser that runs 'parser' one or more times and ignores all the results of them", function () {
            var p = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case "a": return csuc(
                            "a" + state.position.column.toString(),
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                            )
                        );
                    case "b": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        );
                    case "c": return esuc(
                            "c" + state.position.column.toString(),
                            new State(
                                state.input,
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        );
                }
            });
            
            lq.combinator.skipMany1(p).run(
                new State("aab", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.skipMany1(p).run(
                new State("aad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.skipMany1(p).run(
                new State("b", SourcePos.init("test"), "some"),
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

            lq.combinator.skipMany1(p).run(
                new State("d", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                }
            );

            (function () {
                var caughtError;
                try {
                    lq.combinator.skipMany1(p).run(
                        new State("acbd", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        throwError
                    );
                }
                catch (error) {
                    caughtError = error;
                }
                finally {
                    if (caughtError) {
                        if (caughtError.message !== "'many' is applied to a parser that accepts an empty string") {
                            throw caughtError;
                        }
                    }
                    else {
                        throw new Error("no error was thrown");
                    }
                }
            })();

            (function () {
                var caughtError;
                try {
                    lq.combinator.skipMany1(p).run(
                        new State("cabd", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        throwError
                    );
                }
                catch (error) {
                    caughtError = error;
                }
                finally {
                    if (caughtError) {
                        if (caughtError.message !== "'many' is applied to a parser that accepts an empty string") {
                            throw caughtError;
                        }
                    }
                    else {
                        throw new Error("no error was thrown");
                    }
                }
            })();
        });
    });

    describe("sepBy(parser, separator)", function () {
        it("should parse many things separated by 'spearator'", function () {
            var p = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case "a": return csuc(
                            "a" + state.position.column.toString(),
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                            )
                        );
                    case "b": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        );
                    case "c": return esuc(
                            "c" + state.position.column.toString(),
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        );
                }
            });

            var sep = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case ",": return csuc(
                            undefined,
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc")]
                            )
                        );
                    case ".": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                            )
                        );
                    case ";": return esuc(
                            undefined,
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                            )
                        );
                }
            });

            lq.combinator.sepBy(p, sep).run(
                new State("a,aabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a3"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepBy(p, sep).run(
                new State("a,babcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepBy(p, sep).run(
                new State("a,cabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "c3"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepBy(p, sep).run(
                new State("a,dabcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );
            
            lq.combinator.sepBy(p, sep).run(
                new State("a.abcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepBy(p, sep).run(
                new State("a;aabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepBy(p, sep).run(
                new State("a;babcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            (function () {
                var caughtError;
                try {
                    lq.combinator.sepBy(p, sep).run(
                        new State("a;cabcd", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        throwError
                    );
                }
                catch (error) {
                    caughtError = error;
                }
                finally {
                    if (caughtError) {
                        if (caughtError.message !== "'many' is applied to a parser that accepts an empty string") {
                            throw caughtError;
                        }
                    }
                    else {
                        throw new Error("no error was thrown");
                    }
                }
            })();

            lq.combinator.sepBy(p, sep).run(
                new State("a;dabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State(";dabcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepBy(p, sep).run(
                new State("a:abcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State(":abcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            [",", ".", ";", ":"].forEach(function (sep) {
                lq.combinator.sepBy(p, sep).run(
                    new State("b" + sep + "abcd", SourcePos.init("test"), "some"),
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
            });

            lq.combinator.sepBy(p, sep).run(
                new State("c,aabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepBy(p, sep).run(
                new State("c,babcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepBy(p, sep).run(
                new State("c,cabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "c2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepBy(p, sep).run(
                new State("c,dabcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );
            
            lq.combinator.sepBy(p, sep).run(
                new State("c.abcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepBy(p, sep).run(
                new State("c;aabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepBy(p, sep).run(
                new State("c;babcd", SourcePos.init("test"), "some"),
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

            (function () {
                var caughtError;
                try {
                    lq.combinator.sepBy(p, sep).run(
                        new State("c;cabcd", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        throwError
                    );
                }
                catch (error) {
                    caughtError = error;
                }
                finally {
                    if (caughtError) {
                        if (caughtError.message !== "'many' is applied to a parser that accepts an empty string") {
                            throw caughtError;
                        }
                    }
                    else {
                        throw new Error("no error was thrown");
                    }
                }
            })();

            lq.combinator.sepBy(p, sep).run(
                new State("c;dabcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State(";dabcd", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.sepBy(p, sep).run(
                new State("c:abcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State(":abcd", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            [",", ".", ";", ":"].forEach(function (sep) {
                lq.combinator.sepBy(p, sep).run(
                    new State("d" + sep + "abcd", SourcePos.init("test"), "some"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, []).should.be.ok;
                        State.equals(
                            state,
                            new State("d" + sep + "abcd", new SourcePos("test", 1, 1), "some")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );
            });
        });
    });

    describe("sepBy1(parser, separator)", function () {
        it("should parse one or more things separated by 'spearator'", function () {
            var p = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case "a": return csuc(
                            "a" + state.position.column.toString(),
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                            )
                        );
                    case "b": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        );
                    case "c": return esuc(
                            "c" + state.position.column.toString(),
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        );
                }
            });

            var sep = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case ",": return csuc(
                            undefined,
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc")]
                            )
                        );
                    case ".": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                            )
                        );
                    case ";": return esuc(
                            undefined,
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                            )
                        );
                }
            });

            lq.combinator.sepBy1(p, sep).run(
                new State("a,aabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a3"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepBy1(p, sep).run(
                new State("a,babcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepBy1(p, sep).run(
                new State("a,cabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "c3"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepBy1(p, sep).run(
                new State("a,dabcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );
            
            lq.combinator.sepBy1(p, sep).run(
                new State("a.abcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepBy1(p, sep).run(
                new State("a;aabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepBy1(p, sep).run(
                new State("a;babcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            (function () {
                var caughtError;
                try {
                    lq.combinator.sepBy1(p, sep).run(
                        new State("a;cabcd", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        throwError
                    );
                }
                catch (error) {
                    caughtError = error;
                }
                finally {
                    if (caughtError) {
                        if (caughtError.message !== "'many' is applied to a parser that accepts an empty string") {
                            throw caughtError;
                        }
                    }
                    else {
                        throw new Error("no error was thrown");
                    }
                }
            })();

            lq.combinator.sepBy1(p, sep).run(
                new State("a;dabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State(";dabcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepBy1(p, sep).run(
                new State("a:abcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State(":abcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            [",", ".", ";", ":"].forEach(function (sep) {
                lq.combinator.sepBy1(p, sep).run(
                    new State("b" + sep + "abcd", SourcePos.init("test"), "some"),
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
            });

            lq.combinator.sepBy1(p, sep).run(
                new State("c,aabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepBy1(p, sep).run(
                new State("c,babcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepBy1(p, sep).run(
                new State("c,cabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "c2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepBy1(p, sep).run(
                new State("c,dabcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );
            
            lq.combinator.sepBy1(p, sep).run(
                new State("c.abcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepBy1(p, sep).run(
                new State("c;aabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepBy1(p, sep).run(
                new State("c;babcd", SourcePos.init("test"), "some"),
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

            (function () {
                var caughtError;
                try {
                    lq.combinator.sepBy1(p, sep).run(
                        new State("c;cabcd", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        throwError
                    );
                }
                catch (error) {
                    caughtError = error;
                }
                finally {
                    if (caughtError) {
                        if (caughtError.message !== "'many' is applied to a parser that accepts an empty string") {
                            throw caughtError;
                        }
                    }
                    else {
                        throw new Error("no error was thrown");
                    }
                }
            })();

            lq.combinator.sepBy1(p, sep).run(
                new State("c;dabcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State(";dabcd", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.sepBy1(p, sep).run(
                new State("c:abcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State(":abcd", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            [",", ".", ";", ":"].forEach(function (sep) {
                lq.combinator.sepBy1(p, sep).run(
                    new State("d" + sep + "abcd", SourcePos.init("test"), "some"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        ).should.be.ok;
                    }
                );
            });
        });
    });

    describe("sepEndBy(parser, separator)", function () {
        it("should parser many things separated and optionally ended by 'separator'", function () {
            var p = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case "a": return csuc(
                            "a" + state.position.column.toString(),
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                            )
                        );
                    case "b": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        );
                    case "c": return esuc(
                            "c" + state.position.column.toString(),
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        );
                }
            });

            var sep = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case ",": return csuc(
                            undefined,
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc")]
                            )
                        );
                    case ".": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                            )
                        );
                    case ";": return esuc(
                            undefined,
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                            )
                        );
                }
            });

            lq.combinator.sepEndBy(p, sep).run(
                new State("a,aabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a3"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepEndBy(p, sep).run(
                new State("a,babcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepEndBy(p, sep).run(
                new State("a,cabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "c3"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepEndBy(p, sep).run(
                new State("a,dabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("dabcd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );
            
            lq.combinator.sepEndBy(p, sep).run(
                new State("a.abcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepEndBy(p, sep).run(
                new State("a;aabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepEndBy(p, sep).run(
                new State("a;babcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepEndBy(p, sep).run(
                new State("a;cabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "c2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepEndBy(p, sep).run(
                new State("a;dabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("dabcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepEndBy(p, sep).run(
                new State("a:abcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State(":abcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            [",", ".", ";", ":"].forEach(function (sep) {
                lq.combinator.sepEndBy(p, sep).run(
                    new State("b" + sep + "abcd", SourcePos.init("test"), "some"),
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
            });

            lq.combinator.sepEndBy(p, sep).run(
                new State("c,aabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepEndBy(p, sep).run(
                new State("c,babcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepEndBy(p, sep).run(
                new State("c,cabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "c2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepEndBy(p, sep).run(
                new State("c,dabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("dabcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );
            
            lq.combinator.sepEndBy(p, sep).run(
                new State("c.abcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepEndBy(p, sep).run(
                new State("c;aabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepEndBy(p, sep).run(
                new State("c;babcd", SourcePos.init("test"), "some"),
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

            lq.combinator.sepEndBy(p, sep).run(
                new State("c;cabcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.sepEndBy(p, sep).run(
                new State("c;dabcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("dabcd", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.sepEndBy(p, sep).run(
                new State("c:abcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State(":abcd", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            [",", ".", ";", ":"].forEach(function (sep) {
                lq.combinator.sepEndBy(p, sep).run(
                    new State("d" + sep + "abcd", SourcePos.init("test"), "some"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, []).should.be.ok;
                        State.equals(
                            state,
                            new State("d" + sep + "abcd", new SourcePos("test", 1, 1), "some")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );
            });
        });
    });

    describe("sepEndBy1(parser, separator)", function () {
        it("should parser one or more things separated and optionally ended by 'separator'", function () {
            var p = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case "a": return csuc(
                            "a" + state.position.column.toString(),
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                            )
                        );
                    case "b": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        );
                    case "c": return esuc(
                            "c" + state.position.column.toString(),
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        );
                }
            });

            var sep = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case ",": return csuc(
                            undefined,
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc")]
                            )
                        );
                    case ".": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                            )
                        );
                    case ";": return esuc(
                            undefined,
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                            )
                        );
                }
            });

            lq.combinator.sepEndBy1(p, sep).run(
                new State("a,aabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a3"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepEndBy1(p, sep).run(
                new State("a,babcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepEndBy1(p, sep).run(
                new State("a,cabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "c3"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepEndBy1(p, sep).run(
                new State("a,dabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("dabcd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );
            
            lq.combinator.sepEndBy1(p, sep).run(
                new State("a.abcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepEndBy1(p, sep).run(
                new State("a;aabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepEndBy1(p, sep).run(
                new State("a;babcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepEndBy1(p, sep).run(
                new State("a;cabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "c2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepEndBy1(p, sep).run(
                new State("a;dabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("dabcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepEndBy1(p, sep).run(
                new State("a:abcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State(":abcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            [",", ".", ";", ":"].forEach(function (sep) {
                lq.combinator.sepEndBy1(p, sep).run(
                    new State("b" + sep + "abcd", SourcePos.init("test"), "some"),
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
            });

            lq.combinator.sepEndBy1(p, sep).run(
                new State("c,aabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepEndBy1(p, sep).run(
                new State("c,babcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepEndBy1(p, sep).run(
                new State("c,cabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "c2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepEndBy1(p, sep).run(
                new State("c,dabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("dabcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );
            
            lq.combinator.sepEndBy1(p, sep).run(
                new State("c.abcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.sepEndBy1(p, sep).run(
                new State("c;aabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.sepEndBy1(p, sep).run(
                new State("c;babcd", SourcePos.init("test"), "some"),
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

            lq.combinator.sepEndBy1(p, sep).run(
                new State("c;cabcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.sepEndBy1(p, sep).run(
                new State("c;dabcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("dabcd", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.sepEndBy1(p, sep).run(
                new State("c:abcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State(":abcd", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            [",", ".", ";", ":"].forEach(function (sep) {
                lq.combinator.sepEndBy1(p, sep).run(
                    new State("d" + sep + "abcd", SourcePos.init("test"), "some"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        ).should.be.ok;
                    }
                );
            });
        });
    });

    describe("endBy(parser, separator)", function () {
        it("should parse many things ended by 'separator'", function () {
            var p = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case "a": return csuc(
                            "a" + state.position.column.toString(),
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                            )
                        );
                    case "b": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        );
                    case "c": return esuc(
                            "c" + state.position.column.toString(),
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        );
                }
            });

            var sep = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case ",": return csuc(
                            undefined,
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc")]
                            )
                        );
                    case ".": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                            )
                        );
                    case ";": return esuc(
                            undefined,
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                            )
                        );
                }
            });
            
            lq.combinator.endBy(p, sep).run(
                new State("a,a,d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a3"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy(p, sep).run(
                new State("a,a.d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.endBy(p, sep).run(
                new State("a,a;d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a3"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy(p, sep).run(
                new State("a,a:d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.endBy(p, sep).run(
                new State("a,c,d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "c3"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy(p, sep).run(
                new State("a,c.d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            (function () {
                var caughtError;
                try {
                    lq.combinator.endBy(p, sep).run(
                        new State("a,c;d", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        throwError
                    );
                }
                catch (error) {
                    caughtError = error;
                }
                finally {
                    if (caughtError) {
                        if (caughtError.message !== "'many' is applied to a parser that accepts an empty string") {
                            throw caughtError;
                        }
                    }
                    else {
                        throw new Error("no error was thrown");
                    }
                }
            })();

            lq.combinator.endBy(p, sep).run(
                new State("a,c:d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("c:d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            [",", ".", ";", ":"].forEach(function (sep2) {
                lq.combinator.endBy(p, sep).run(
                    new State("a,b" + sep2 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.combinator.endBy(p, sep).run(
                    new State("a,d" + sep2 + "d", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                        State.equals(
                            state,
                            new State("d" + sep2 + "d", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            [",", ".", ";", ":"].forEach(function (sep2) {
                ["a", "b", "c", "d"].forEach(function (e2) {
                    lq.combinator.endBy(p, sep).run(
                        new State("a." + e2 + sep2 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 3),
                                    [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });
            });

            lq.combinator.endBy(p, sep).run(
                new State("a;a,d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy(p, sep).run(
                new State("a;a.d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.endBy(p, sep).run(
                new State("a;a;d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy(p, sep).run(
                new State("a;a:d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.endBy(p, sep).run(
                new State("a;c,d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "c2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy(p, sep).run(
                new State("a;c.d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            (function () {
                var caughtError;
                try {
                    lq.combinator.endBy(p, sep).run(
                        new State("a;c;d", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        throwError
                    );
                }
                catch (error) {
                    caughtError = error;
                }
                finally {
                    if (caughtError) {
                        if (caughtError.message !== "'many' is applied to a parser that accepts an empty string") {
                            throw caughtError;
                        }
                    }
                    else {
                        throw new Error("no error was thrown");
                    }
                }
            })();

            lq.combinator.endBy(p, sep).run(
                new State("a;c:d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("c:d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            [",", ".", ";", ":"].forEach(function (sep2) {
                lq.combinator.endBy(p, sep).run(
                    new State("a;b" + sep2 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.combinator.endBy(p, sep).run(
                    new State("a;d" + sep2 + "d", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                        State.equals(
                            state,
                            new State("d" + sep2 + "d", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            [",", ".", ";", ":"].forEach(function (sep2) {
                ["a", "b", "c", "d"].forEach(function (e2) {
                    lq.combinator.endBy(p, sep).run(
                        new State("a:" + e2 + sep2 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });
            });

            lq.combinator.endBy(p, sep).run(
                new State("c,a,d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy(p, sep).run(
                new State("c,a.d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.endBy(p, sep).run(
                new State("c,a;d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy(p, sep).run(
                new State("c,a:d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.endBy(p, sep).run(
                new State("c,c,d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "c2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy(p, sep).run(
                new State("c,c.d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            (function () {
                var caughtError;
                try {
                    lq.combinator.endBy(p, sep).run(
                        new State("c,c;d", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        throwError
                    );
                }
                catch (error) {
                    caughtError = error;
                }
                finally {
                    if (caughtError) {
                        if (caughtError.message !== "'many' is applied to a parser that accepts an empty string") {
                            throw caughtError;
                        }
                    }
                    else {
                        throw new Error("no error was thrown");
                    }
                }
            })();

            lq.combinator.endBy(p, sep).run(
                new State("c,c:d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("c:d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            [",", ".", ";", ":"].forEach(function (sep2) {
                lq.combinator.endBy(p, sep).run(
                    new State("c,b" + sep2 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.combinator.endBy(p, sep).run(
                    new State("c,d" + sep2 + "d", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                        State.equals(
                            state,
                            new State("d" + sep2 + "d", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            [",", ".", ";", ":"].forEach(function (sep2) {
                ["a", "b", "c", "d"].forEach(function (e2) {
                    lq.combinator.endBy(p, sep).run(
                        new State("c." + e2 + sep2 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );

                    (function () {
                        var caughtError;
                        try {
                            lq.combinator.endBy(p, sep).run(
                                new State("c;" + e2 + sep2 + "d", SourcePos.init("test"), "some"),
                                throwError,
                                throwError,
                                throwError,
                                throwError
                            );
                        }
                        catch (error) {
                            caughtError = error;
                        }
                        finally {
                            if (caughtError) {
                                if (caughtError.message !== "'many' is applied to a parser that accepts an empty string") {
                                    throw caughtError;
                                }
                            }
                            else {
                                throw new Error("no error was thrown");
                            }
                        }
                    })();

                    lq.combinator.endBy(p, sep).run(
                        new State("c:" + e2 + sep2 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        function (value, state, error) {
                            lq.util.ArrayUtil.equals(value, []).should.be.ok;
                            State.equals(
                                state,
                                new State("c:" + e2 + sep2 + "d", new SourcePos("test", 1, 1), "some")
                            ).should.be.ok;
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 1),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError
                    );
                });
            });

            [",", ".", ";", ":"].forEach(function (sep2) {
                ["a", "b", "c", "d"].forEach(function (e2) {
                    [",", ".", ";", ":"].forEach(function (sep1) {
                        lq.combinator.endBy(p, sep).run(
                            new State("b" + sep1 + e2 + sep2 + "d", SourcePos.init("test"), "some"),
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

                        lq.combinator.endBy(p, sep).run(
                            new State("d" + sep1 + e2 + sep2 + "d", SourcePos.init("test"), "some"),
                            throwError,
                            throwError,
                            function (value, state, error) {
                                lq.util.ArrayUtil.equals(value, []).should.be.ok;
                                State.equals(
                                    state,
                                    new State("d" + sep1 + e2 + sep2 + "d", new SourcePos("test", 1, 1), "some")
                                ).should.be.ok;
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 1),
                                        [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                                    )
                                ).should.be.ok;
                            },
                            throwError
                        );
                    });
                });
            });
        });
    });

    describe("endBy1(parser, separator)", function () {
        it("should parse one or more things ended by 'separator'", function () {
            var p = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case "a": return csuc(
                            "a" + state.position.column.toString(),
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                            )
                        );
                    case "b": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        );
                    case "c": return esuc(
                            "c" + state.position.column.toString(),
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        );
                }
            });

            var sep = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case ",": return csuc(
                            undefined,
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc")]
                            )
                        );
                    case ".": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                            )
                        );
                    case ";": return esuc(
                            undefined,
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")]
                            )
                        );
                }
            });
            
            lq.combinator.endBy1(p, sep).run(
                new State("a,a,d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a3"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("a,a.d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("a,a;d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a3"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("a,a:d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("a,c,d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "c3"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("a,c.d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            (function () {
                var caughtError;
                try {
                    lq.combinator.endBy1(p, sep).run(
                        new State("a,c;d", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        throwError
                    );
                }
                catch (error) {
                    caughtError = error;
                }
                finally {
                    if (caughtError) {
                        if (caughtError.message !== "'many' is applied to a parser that accepts an empty string") {
                            throw caughtError;
                        }
                    }
                    else {
                        throw new Error("no error was thrown");
                    }
                }
            })();

            lq.combinator.endBy1(p, sep).run(
                new State("a,c:d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("c:d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            [",", ".", ";", ":"].forEach(function (sep2) {
                lq.combinator.endBy1(p, sep).run(
                    new State("a,b" + sep2 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.combinator.endBy1(p, sep).run(
                    new State("a,d" + sep2 + "d", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                        State.equals(
                            state,
                            new State("d" + sep2 + "d", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            [",", ".", ";", ":"].forEach(function (sep2) {
                ["a", "b", "c", "d"].forEach(function (e2) {
                    lq.combinator.endBy1(p, sep).run(
                        new State("a." + e2 + sep2 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 3),
                                    [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });
            });

            lq.combinator.endBy1(p, sep).run(
                new State("a;a,d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("a;a.d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("a;a;d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("a;a:d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("a;c,d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "c2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("a;c.d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            (function () {
                var caughtError;
                try {
                    lq.combinator.endBy1(p, sep).run(
                        new State("a;c;d", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        throwError
                    );
                }
                catch (error) {
                    caughtError = error;
                }
                finally {
                    if (caughtError) {
                        if (caughtError.message !== "'many' is applied to a parser that accepts an empty string") {
                            throw caughtError;
                        }
                    }
                    else {
                        throw new Error("no error was thrown");
                    }
                }
            })();

            lq.combinator.endBy1(p, sep).run(
                new State("a;c:d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("c:d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            [",", ".", ";", ":"].forEach(function (sep2) {
                lq.combinator.endBy1(p, sep).run(
                    new State("a;b" + sep2 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.combinator.endBy1(p, sep).run(
                    new State("a;d" + sep2 + "d", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                        State.equals(
                            state,
                            new State("d" + sep2 + "d", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            [",", ".", ";", ":"].forEach(function (sep2) {
                ["a", "b", "c", "d"].forEach(function (e2) {
                    lq.combinator.endBy1(p, sep).run(
                        new State("a:" + e2 + sep2 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });
            });

            lq.combinator.endBy1(p, sep).run(
                new State("c,a,d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("c,a.d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("c,a;d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("c,a:d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("c,c,d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "c2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("c,c.d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            (function () {
                var caughtError;
                try {
                    lq.combinator.endBy1(p, sep).run(
                        new State("c,c;d", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        throwError
                    );
                }
                catch (error) {
                    caughtError = error;
                }
                finally {
                    if (caughtError) {
                        if (caughtError.message !== "'many' is applied to a parser that accepts an empty string") {
                            throw caughtError;
                        }
                    }
                    else {
                        throw new Error("no error was thrown");
                    }
                }
            })();

            lq.combinator.endBy1(p, sep).run(
                new State("c,c:d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("c:d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            [",", ".", ";", ":"].forEach(function (sep2) {
                lq.combinator.endBy1(p, sep).run(
                    new State("c,b" + sep2 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.combinator.endBy1(p, sep).run(
                    new State("c,d" + sep2 + "d", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                        State.equals(
                            state,
                            new State("d" + sep2 + "d", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "sep_csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            [",", ".", ";", ":"].forEach(function (sep2) {
                ["a", "b", "c", "d"].forEach(function (e2) {
                    lq.combinator.endBy1(p, sep).run(
                        new State("c." + e2 + sep2 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });
            });

            lq.combinator.endBy1(p, sep).run(
                new State("c;a,d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("c;a.d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("c;a;d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("c;a:d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("c;c,d", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.endBy1(p, sep).run(
                new State("c;c.d", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "sep_cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            (function () {
                var caughtError;
                try {
                    lq.combinator.endBy1(p, sep).run(
                        new State("c;c;d", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        throwError
                    );
                }
                catch (error) {
                    caughtError = error;
                }
                finally {
                    if (caughtError) {
                        if (caughtError.message !== "'many' is applied to a parser that accepts an empty string") {
                            throw caughtError;
                        }
                    }
                    else {
                        throw new Error("no error was thrown");
                    }
                }
            })();

            lq.combinator.endBy1(p, sep).run(
                new State("c;c:d", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("c:d", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            [",", ".", ";", ":"].forEach(function (sep2) {
                lq.combinator.endBy1(p, sep).run(
                    new State("c;b" + sep2 + "d", SourcePos.init("test"), "some"),
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

                lq.combinator.endBy1(p, sep).run(
                    new State("c;d" + sep2 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                        State.equals(
                            state,
                            new State("d" + sep2 + "d", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "sep_esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );
            });

            [",", ".", ";", ":"].forEach(function (sep2) {
                ["a", "b", "c", "d"].forEach(function (e2) {
                    lq.combinator.endBy1(p, sep).run(
                        new State("c:" + e2 + sep2 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 1),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "sep_eerr")
                                    ]
                                )
                            ).should.be.ok;
                        }
                    );
                });
            });

            [",", ".", ";", ":"].forEach(function (sep2) {
                ["a", "b", "c", "d"].forEach(function (e2) {
                    [",", ".", ";", ":"].forEach(function (sep1) {
                        lq.combinator.endBy1(p, sep).run(
                            new State("b" + sep1 + e2 + sep2 + "d", SourcePos.init("test"), "some"),
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

                        lq.combinator.endBy1(p, sep).run(
                            new State("d" + sep1 + e2 + sep2 + "d", SourcePos.init("test"), "some"),
                            throwError,
                            throwError,
                            throwError,
                            function (error) {
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 1),
                                        [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                                    )
                                ).should.be.ok;
                            }
                        );
                    });
                });
            });
        });
    });

    describe("count(n, parser)", function () {
        it("should run the parser 'n' times", function () {
            var p = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case "a": return csuc(
                            "a" + state.position.column.toString(),
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                            )
                        );
                    case "b": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        );
                    case "c": return esuc(
                            "c" + state.position.column.toString(),
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        );
                }
            });

            lq.combinator.count(0, p).run(
                new State("abcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, []).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", SourcePos.init("test"), "some")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.unknown(SourcePos.init("test"))
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.count(2, p).run(
                new State("aaabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "a2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.count(2, p).run(
                new State("ababcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.count(2, p).run(
                new State("acabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "c2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.count(2, p).run(
                new State("adabcd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e2) {
                lq.combinator.count(2, p).run(
                    new State("b" + e2 + "abcd", SourcePos.init("test"), "some"),
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
            });

            lq.combinator.count(2, p).run(
                new State("caabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "a1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 2), "none")
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

            lq.combinator.count(2, p).run(
                new State("cbabcd", SourcePos.init("test"), "some"),
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

            lq.combinator.count(2, p).run(
                new State("ccabcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.count(2, p).run(
                new State("cdabcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                }
            );

            ["a", "b", "c", "d"].forEach(function (e2) {
                lq.combinator.count(2, p).run(
                    new State("d" + e2 + "abcd", SourcePos.init("test"), "some"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        ).should.be.ok;
                    }
                );
            });
        });
    });

    describe("chainl(parser, operator, defaultValue)", function () {

    });

    describe("chainl1(parser, operator)", function () {

    });

    describe("chainr(parser, operator, defaultValue)", function () {

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
