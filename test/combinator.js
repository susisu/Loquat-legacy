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
