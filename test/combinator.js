/*
 * Loquat.test / combinator.js
 * copyright (c) 2014 Susisu
 */

var should = require("should");

var lq = Object.freeze({
    "array"     : require("../lib/array"),
    "combinator": require("../lib/combinator"),
    "error"     : require("../lib/error"),
    "monad"     : require("../lib/monad"),
    "pos"       : require("../lib/pos"),
    "prim"      : require("../lib/prim"),
    "string"    : require("../lib/string"),
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
        it("should parse many values separated by 'operator' and apply the functions returned by 'operator' to the values left to right", function () {
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

            var op = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case "(": return csuc(
                            function (a, b) { return "(" + a + b + ")"; },
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc")]
                            )
                        );
                    case "{": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        );
                    case "[": return esuc(
                            function (a, b) { return "[" + a + b + "]"; },
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")]
                            )
                        );
                }
            });

            lq.combinator.chainl(p, op, "x").run(
                new State("a(a(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("((a1a3)a5)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 6), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 6),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a(a(bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 6),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a(a(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("((a1a3)c5)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a(a(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl(p, op, "x").run(
                    new State("a(a{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainl(p, op, "x").run(
                new State("a(a[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[(a1a3)a4]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a(a[bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a(a[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[(a1a3)c4]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a(a[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1a3)");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl(p, op, "x").run(
                    new State("a(a<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("(a1a3)");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainl(p, op, "x").run(
                        new State("a(b" + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
                });
            });

            lq.combinator.chainl(p, op, "x").run(
                new State("a(c(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("((a1c3)a4)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a(c(bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a(c(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("((a1c3)c4)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a(c(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl(p, op, "x").run(
                    new State("a(c{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainl(p, op, "x").run(
                new State("a(c[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[(a1c3)a3]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a(c[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl(p, op, "x").run(
                new State("a(c[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[(a1c3)c3]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a(c[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1c3)");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl(p, op, "x").run(
                    new State("a(c<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("(a1c3)");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainl(p, op, "x").run(
                        new State("a(d" + op2 + e3 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 3),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        lq.combinator.chainl(p, op, "x").run(
                            new State("a{" + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                            throwError,
                            function (error) {
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 3),
                                        [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                                    )
                                ).should.be.ok;
                            },
                            throwError,
                            throwError
                        );
                    });
                });
            });

            lq.combinator.chainl(p, op, "x").run(
                new State("a[a(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("([a1a2]a4)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a[a(bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a[a(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("([a1a2]c4)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a[a(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl(p, op, "x").run(
                    new State("a[a{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainl(p, op, "x").run(
                new State("a[a[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[[a1a2]a3]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a[a[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl(p, op, "x").run(
                new State("a[a[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[[a1a2]c3]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a[a[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1a2]");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl(p, op, "x").run(
                    new State("a[a<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("[a1a2]");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainl(p, op, "x").run(
                        new State("a[b" + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
                });
            });

            lq.combinator.chainl(p, op, "x").run(
                new State("a[c(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("([a1c2]a3)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a[c(bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl(p, op, "x").run(
                new State("a[c(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("([a1c2]c3)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a[c(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl(p, op, "x").run(
                    new State("a[c{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainl(p, op, "x").run(
                new State("a[c[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[[a1c2]a2]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a[c[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl(p, op, "x").run(
                new State("a[c[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[[a1c2]c2]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("a[c[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1c2]");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl(p, op, "x").run(
                    new State("a[c<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("[a1c2]");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainl(p, op, "x").run(
                        new State("a[d" + op2 + e3 + "d", SourcePos.init("test"), "some"),
                        function (value, state, error) {
                            value.should.equal("a1");
                            State.equals(
                                state,
                                new State("[d" + op2 + e3 + "d", new SourcePos("test", 1, 2), "none")
                            ).should.be.ok;
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
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
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        lq.combinator.chainl(p, op, "x").run(
                            new State("a<" + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                            function (value, state, error) {
                                value.should.equal("a1");
                                State.equals(
                                    state,
                                    new State("<" + e2 + op2 + e3 + "d", new SourcePos("test", 1, 2), "none")
                                ).should.be.ok;
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 2),
                                        [
                                            new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                            new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                        ]
                                    )
                                ).should.be.ok;
                            },
                            throwError,
                            throwError,
                            throwError
                        );
                    });
                });
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        ["(", "{", "[", "<"].forEach(function (op1) {
                            lq.combinator.chainl(p, op, "x").run(
                                new State("b" + op1 + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
                });
            });

            lq.combinator.chainl(p, op, "x").run(
                new State("c(a(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("((c1a2)a4)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c(a(bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c(a(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("((c1a2)c4)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c(a(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl(p, op, "x").run(
                    new State("c(a{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainl(p, op, "x").run(
                new State("c(a[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[(c1a2)a3]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c(a[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl(p, op, "x").run(
                new State("c(a[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[(c1a2)c3]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c(a[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1a2)");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl(p, op, "x").run(
                    new State("c(a<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("(c1a2)");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainl(p, op, "x").run(
                        new State("c(b" + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
                });
            });

            lq.combinator.chainl(p, op, "x").run(
                new State("c(c(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("((c1c2)a3)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c(c(bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl(p, op, "x").run(
                new State("c(c(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("((c1c2)c3)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c(c(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl(p, op, "x").run(
                    new State("c(c{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainl(p, op, "x").run(
                new State("c(c[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[(c1c2)a2]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c(c[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl(p, op, "x").run(
                new State("c(c[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[(c1c2)c2]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c(c[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1c2)");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl(p, op, "x").run(
                    new State("c(c<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("(c1c2)");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainl(p, op, "x").run(
                        new State("c(d" + op2 + e3 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        lq.combinator.chainl(p, op, "x").run(
                            new State("c{" + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                            throwError,
                            function (error) {
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 2),
                                        [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                                    )
                                ).should.be.ok;
                            },
                            throwError,
                            throwError
                        );
                    });
                });
            });

            lq.combinator.chainl(p, op, "x").run(
                new State("c[a(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("([c1a1]a3)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c[a(bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl(p, op, "x").run(
                new State("c[a(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("([c1a1]c3)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c[a(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl(p, op, "x").run(
                    new State("c[a{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainl(p, op, "x").run(
                new State("c[a[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[[c1a1]a2]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c[a[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl(p, op, "x").run(
                new State("c[a[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[[c1a1]c2]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c[a[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1a1]");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl(p, op, "x").run(
                    new State("c[a<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("[c1a1]");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainl(p, op, "x").run(
                        new State("c[b" + op2 + e3 + "d", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl(p, op, "x").run(
                new State("c[c(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("([c1c1]a2)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c[c(bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl(p, op, "x").run(
                new State("c[c(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("([c1c1]c2)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c[c(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl(p, op, "x").run(
                    new State("c[c{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainl(p, op, "x").run(
                new State("c[c[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[[c1c1]a1]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c[c[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl(p, op, "x").run(
                new State("c[c[cd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("[[c1c1]c1]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.chainl(p, op, "x").run(
                new State("c[c[dd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("[c1c1]");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl(p, op, "x").run(
                    new State("c[c<dd", SourcePos.init("test"), "some"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        value.should.equal("[c1c1]");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainl(p, op, "x").run(
                        new State("c[d" + op2 + e3 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        function (value, state, error) {
                            value.should.equal("c1");
                            State.equals(
                                state,
                                new State("[d" + op2 + e3 + "d", new SourcePos("test", 1, 1), "none")
                            ).should.be.ok;
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 1),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError
                    );
                });
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        lq.combinator.chainl(p, op, "x").run(
                            new State("c<" + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                            throwError,
                            throwError,
                            function (value, state, error) {
                                value.should.equal("c1");
                                State.equals(
                                    state,
                                    new State("<" + e2 + op2 + e3 + "d", new SourcePos("test", 1, 1), "none")
                                ).should.be.ok;
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 1),
                                        [
                                            new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                            new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                        ]
                                    )
                                ).should.be.ok;
                            },
                            throwError
                        );
                    });
                });
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        ["(", "{", "[", "<"].forEach(function (op1) {
                            lq.combinator.chainl(p, op, "x").run(
                                new State("d" + op1 + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                                throwError,
                                throwError,
                                function (value, state, error) {
                                    value.should.equal("x");
                                    State.equals(
                                        state,
                                        new State("d" + op1 + e2 + op2 + e3 + "d", new SourcePos("test", 1, 1), "some")
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
    });

    describe("chainl1(parser, operator)", function () {
        it("should parse one or more values separated by 'operator' and apply the functions returned by 'operator' to the values left to right", function () {
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

            var op = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case "(": return csuc(
                            function (a, b) { return "(" + a + b + ")"; },
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc")]
                            )
                        );
                    case "{": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        );
                    case "[": return esuc(
                            function (a, b) { return "[" + a + b + "]"; },
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")]
                            )
                        );
                }
            });

            lq.combinator.chainl1(p, op).run(
                new State("a(a(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("((a1a3)a5)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 6), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 6),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a(a(bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 6),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a(a(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("((a1a3)c5)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a(a(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl1(p, op).run(
                    new State("a(a{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainl1(p, op).run(
                new State("a(a[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[(a1a3)a4]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a(a[bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a(a[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[(a1a3)c4]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a(a[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1a3)");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl1(p, op).run(
                    new State("a(a<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("(a1a3)");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainl1(p, op).run(
                        new State("a(b" + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
                });
            });

            lq.combinator.chainl1(p, op).run(
                new State("a(c(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("((a1c3)a4)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a(c(bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a(c(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("((a1c3)c4)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a(c(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl1(p, op).run(
                    new State("a(c{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainl1(p, op).run(
                new State("a(c[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[(a1c3)a3]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a(c[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl1(p, op).run(
                new State("a(c[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[(a1c3)c3]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a(c[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1c3)");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl1(p, op).run(
                    new State("a(c<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("(a1c3)");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainl1(p, op).run(
                        new State("a(d" + op2 + e3 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 3),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        lq.combinator.chainl1(p, op).run(
                            new State("a{" + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                            throwError,
                            function (error) {
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 3),
                                        [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                                    )
                                ).should.be.ok;
                            },
                            throwError,
                            throwError
                        );
                    });
                });
            });

            lq.combinator.chainl1(p, op).run(
                new State("a[a(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("([a1a2]a4)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a[a(bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a[a(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("([a1a2]c4)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a[a(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl1(p, op).run(
                    new State("a[a{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainl1(p, op).run(
                new State("a[a[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[[a1a2]a3]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a[a[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl1(p, op).run(
                new State("a[a[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[[a1a2]c3]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a[a[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1a2]");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl1(p, op).run(
                    new State("a[a<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("[a1a2]");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainl1(p, op).run(
                        new State("a[b" + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
                });
            });

            lq.combinator.chainl1(p, op).run(
                new State("a[c(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("([a1c2]a3)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a[c(bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl1(p, op).run(
                new State("a[c(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("([a1c2]c3)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a[c(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl1(p, op).run(
                    new State("a[c{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainl1(p, op).run(
                new State("a[c[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[[a1c2]a2]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a[c[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl1(p, op).run(
                new State("a[c[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[[a1c2]c2]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("a[c[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1c2]");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl1(p, op).run(
                    new State("a[c<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("[a1c2]");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainl1(p, op).run(
                        new State("a[d" + op2 + e3 + "d", SourcePos.init("test"), "some"),
                        function (value, state, error) {
                            value.should.equal("a1");
                            State.equals(
                                state,
                                new State("[d" + op2 + e3 + "d", new SourcePos("test", 1, 2), "none")
                            ).should.be.ok;
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
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
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        lq.combinator.chainl1(p, op).run(
                            new State("a<" + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                            function (value, state, error) {
                                value.should.equal("a1");
                                State.equals(
                                    state,
                                    new State("<" + e2 + op2 + e3 + "d", new SourcePos("test", 1, 2), "none")
                                ).should.be.ok;
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 2),
                                        [
                                            new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                            new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                        ]
                                    )
                                ).should.be.ok;
                            },
                            throwError,
                            throwError,
                            throwError
                        );
                    });
                });
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        ["(", "{", "[", "<"].forEach(function (op1) {
                            lq.combinator.chainl1(p, op).run(
                                new State("b" + op1 + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
                });
            });

            lq.combinator.chainl1(p, op).run(
                new State("c(a(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("((c1a2)a4)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c(a(bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c(a(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("((c1a2)c4)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c(a(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl1(p, op).run(
                    new State("c(a{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainl1(p, op).run(
                new State("c(a[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[(c1a2)a3]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c(a[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl1(p, op).run(
                new State("c(a[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[(c1a2)c3]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c(a[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1a2)");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl1(p, op).run(
                    new State("c(a<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("(c1a2)");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainl1(p, op).run(
                        new State("c(b" + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
                });
            });

            lq.combinator.chainl1(p, op).run(
                new State("c(c(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("((c1c2)a3)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c(c(bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl1(p, op).run(
                new State("c(c(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("((c1c2)c3)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c(c(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl1(p, op).run(
                    new State("c(c{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainl1(p, op).run(
                new State("c(c[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[(c1c2)a2]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c(c[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl1(p, op).run(
                new State("c(c[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[(c1c2)c2]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c(c[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1c2)");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl1(p, op).run(
                    new State("c(c<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("(c1c2)");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainl1(p, op).run(
                        new State("c(d" + op2 + e3 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        lq.combinator.chainl1(p, op).run(
                            new State("c{" + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                            throwError,
                            function (error) {
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 2),
                                        [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                                    )
                                ).should.be.ok;
                            },
                            throwError,
                            throwError
                        );
                    });
                });
            });

            lq.combinator.chainl1(p, op).run(
                new State("c[a(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("([c1a1]a3)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c[a(bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl1(p, op).run(
                new State("c[a(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("([c1a1]c3)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c[a(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl1(p, op).run(
                    new State("c[a{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainl1(p, op).run(
                new State("c[a[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[[c1a1]a2]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c[a[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl1(p, op).run(
                new State("c[a[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[[c1a1]c2]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c[a[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1a1]");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl1(p, op).run(
                    new State("c[a<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("[c1a1]");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainl1(p, op).run(
                        new State("c[b" + op2 + e3 + "d", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl1(p, op).run(
                new State("c[c(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("([c1c1]a2)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c[c(bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl1(p, op).run(
                new State("c[c(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("([c1c1]c2)");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c[c(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl1(p, op).run(
                    new State("c[c{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainl1(p, op).run(
                new State("c[c[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[[c1c1]a1]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c[c[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainl1(p, op).run(
                new State("c[c[cd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("[[c1c1]c1]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.chainl1(p, op).run(
                new State("c[c[dd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("[c1c1]");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainl1(p, op).run(
                    new State("c[c<dd", SourcePos.init("test"), "some"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        value.should.equal("[c1c1]");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainl1(p, op).run(
                        new State("c[d" + op2 + e3 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        function (value, state, error) {
                            value.should.equal("c1");
                            State.equals(
                                state,
                                new State("[d" + op2 + e3 + "d", new SourcePos("test", 1, 1), "none")
                            ).should.be.ok;
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 1),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError
                    );
                });
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        lq.combinator.chainl1(p, op).run(
                            new State("c<" + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                            throwError,
                            throwError,
                            function (value, state, error) {
                                value.should.equal("c1");
                                State.equals(
                                    state,
                                    new State("<" + e2 + op2 + e3 + "d", new SourcePos("test", 1, 1), "none")
                                ).should.be.ok;
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 1),
                                        [
                                            new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                            new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                        ]
                                    )
                                ).should.be.ok;
                            },
                            throwError
                        );
                    });
                });
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        ["(", "{", "[", "<"].forEach(function (op1) {
                            lq.combinator.chainl1(p, op).run(
                                new State("d" + op1 + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
    });

    describe("chainr(parser, operator, defaultValue)", function () {
        it("should parse many values separated by 'operator' and apply the functions returned by 'operator' to the values right to left", function () {
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

            var op = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case "(": return csuc(
                            function (a, b) { return "(" + a + b + ")"; },
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc")]
                            )
                        );
                    case "{": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        );
                    case "[": return esuc(
                            function (a, b) { return "[" + a + b + "]"; },
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")]
                            )
                        );
                }
            });

            lq.combinator.chainr(p, op, "x").run(
                new State("a(a(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1(a3a5))");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 6), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 6),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a(a(bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 6),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a(a(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1(a3c5))");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a(a(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr(p, op, "x").run(
                    new State("a(a{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainr(p, op, "x").run(
                new State("a(a[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1[a3a4])");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a(a[bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a(a[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1[a3c4])");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a(a[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1a3)");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr(p, op, "x").run(
                    new State("a(a<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("(a1a3)");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainr(p, op, "x").run(
                        new State("a(b" + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
                });
            });

            lq.combinator.chainr(p, op, "x").run(
                new State("a(c(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1(c3a4))");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a(c(bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a(c(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1(c3c4))");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a(c(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr(p, op, "x").run(
                    new State("a(c{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainr(p, op, "x").run(
                new State("a(c[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1[c3a3])");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a(c[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr(p, op, "x").run(
                new State("a(c[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1[c3c3])");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a(c[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1c3)");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr(p, op, "x").run(
                    new State("a(c<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("(a1c3)");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainr(p, op, "x").run(
                        new State("a(d" + op2 + e3 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 3),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        lq.combinator.chainr(p, op, "x").run(
                            new State("a{" + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                            throwError,
                            function (error) {
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 3),
                                        [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                                    )
                                ).should.be.ok;
                            },
                            throwError,
                            throwError
                        );
                    });
                });
            });

            lq.combinator.chainr(p, op, "x").run(
                new State("a[a(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1(a2a4)]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a[a(bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a[a(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1(a2c4)]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a[a(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr(p, op, "x").run(
                    new State("a[a{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainr(p, op, "x").run(
                new State("a[a[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1[a2a3]]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a[a[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr(p, op, "x").run(
                new State("a[a[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1[a2c3]]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a[a[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1a2]");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr(p, op, "x").run(
                    new State("a[a<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("[a1a2]");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainr(p, op, "x").run(
                        new State("a[b" + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
                });
            });

            lq.combinator.chainr(p, op, "x").run(
                new State("a[c(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1(c2a3)]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a[c(bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr(p, op, "x").run(
                new State("a[c(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1(c2c3)]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a[c(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr(p, op, "x").run(
                    new State("a[c{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainr(p, op, "x").run(
                new State("a[c[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1[c2a2]]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a[c[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr(p, op, "x").run(
                new State("a[c[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1[c2c2]]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("a[c[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1c2]");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr(p, op, "x").run(
                    new State("a[c<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("[a1c2]");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainr(p, op, "x").run(
                        new State("a[d" + op2 + e3 + "d", SourcePos.init("test"), "some"),
                        function (value, state, error) {
                            value.should.equal("a1");
                            State.equals(
                                state,
                                new State("[d" + op2 + e3 + "d", new SourcePos("test", 1, 2), "none")
                            ).should.be.ok;
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
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
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        lq.combinator.chainr(p, op, "x").run(
                            new State("a<" + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                            function (value, state, error) {
                                value.should.equal("a1");
                                State.equals(
                                    state,
                                    new State("<" + e2 + op2 + e3 + "d", new SourcePos("test", 1, 2), "none")
                                ).should.be.ok;
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 2),
                                        [
                                            new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                            new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                        ]
                                    )
                                ).should.be.ok;
                            },
                            throwError,
                            throwError,
                            throwError
                        );
                    });
                });
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        ["(", "{", "[", "<"].forEach(function (op1) {
                            lq.combinator.chainr(p, op, "x").run(
                                new State("b" + op1 + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
                });
            });

            lq.combinator.chainr(p, op, "x").run(
                new State("c(a(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1(a2a4))");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c(a(bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c(a(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1(a2c4))");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c(a(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr(p, op, "x").run(
                    new State("c(a{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainr(p, op, "x").run(
                new State("c(a[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1[a2a3])");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c(a[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr(p, op, "x").run(
                new State("c(a[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1[a2c3])");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c(a[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1a2)");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr(p, op, "x").run(
                    new State("c(a<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("(c1a2)");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainr(p, op, "x").run(
                        new State("c(b" + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
                });
            });

            lq.combinator.chainr(p, op, "x").run(
                new State("c(c(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1(c2a3))");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c(c(bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr(p, op, "x").run(
                new State("c(c(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1(c2c3))");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c(c(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr(p, op, "x").run(
                    new State("c(c{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainr(p, op, "x").run(
                new State("c(c[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1[c2a2])");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c(c[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr(p, op, "x").run(
                new State("c(c[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1[c2c2])");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c(c[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1c2)");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr(p, op, "x").run(
                    new State("c(c<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("(c1c2)");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainr(p, op, "x").run(
                        new State("c(d" + op2 + e3 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        lq.combinator.chainr(p, op, "x").run(
                            new State("c{" + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                            throwError,
                            function (error) {
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 2),
                                        [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                                    )
                                ).should.be.ok;
                            },
                            throwError,
                            throwError
                        );
                    });
                });
            });

            lq.combinator.chainr(p, op, "x").run(
                new State("c[a(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1(a1a3)]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c[a(bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr(p, op, "x").run(
                new State("c[a(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1(a1c3)]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c[a(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr(p, op, "x").run(
                    new State("c[a{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainr(p, op, "x").run(
                new State("c[a[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1[a1a2]]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c[a[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr(p, op, "x").run(
                new State("c[a[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1[a1c2]]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c[a[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1a1]");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr(p, op, "x").run(
                    new State("c[a<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("[c1a1]");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainr(p, op, "x").run(
                        new State("c[b" + op2 + e3 + "d", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr(p, op, "x").run(
                new State("c[c(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1(c1a2)]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c[c(bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr(p, op, "x").run(
                new State("c[c(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1(c1c2)]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c[c(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr(p, op, "x").run(
                    new State("c[c{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainr(p, op, "x").run(
                new State("c[c[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1[c1a1]]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c[c[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr(p, op, "x").run(
                new State("c[c[cd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("[c1[c1c1]]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.chainr(p, op, "x").run(
                new State("c[c[dd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("[c1c1]");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr(p, op, "x").run(
                    new State("c[c<dd", SourcePos.init("test"), "some"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        value.should.equal("[c1c1]");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainr(p, op, "x").run(
                        new State("c[d" + op2 + e3 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        function (value, state, error) {
                            value.should.equal("c1");
                            State.equals(
                                state,
                                new State("[d" + op2 + e3 + "d", new SourcePos("test", 1, 1), "none")
                            ).should.be.ok;
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 1),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError
                    );
                });
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        lq.combinator.chainr(p, op, "x").run(
                            new State("c<" + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                            throwError,
                            throwError,
                            function (value, state, error) {
                                value.should.equal("c1");
                                State.equals(
                                    state,
                                    new State("<" + e2 + op2 + e3 + "d", new SourcePos("test", 1, 1), "none")
                                ).should.be.ok;
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 1),
                                        [
                                            new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                            new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                        ]
                                    )
                                ).should.be.ok;
                            },
                            throwError
                        );
                    });
                });
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        ["(", "{", "[", "<"].forEach(function (op1) {
                            lq.combinator.chainr(p, op, "x").run(
                                new State("d" + op1 + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                                throwError,
                                throwError,
                                function (value, state, error) {
                                    value.should.equal("x");
                                    State.equals(
                                        state,
                                        new State("d" + op1 + e2 + op2 + e3 + "d", new SourcePos("test", 1, 1), "some")
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
    });

    describe("chainr1(parser, operator)", function () {
        it("should parse one or more values separated by 'operator' and apply the functions returned by 'operator' to the values right to left", function () {
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

            var op = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                switch (state.input.charAt(0)) {
                    case "(": return csuc(
                            function (a, b) { return "(" + a + b + ")"; },
                            new State(
                                state.input.substr(1),
                                state.position.setColumn(state.position.column + 1),
                                "none"
                            ),
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc")]
                            )
                        );
                    case "{": return cerr(
                            new ParseError(
                                state.position.setColumn(state.position.column + 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        );
                    case "[": return esuc(
                            function (a, b) { return "[" + a + b + "]"; },
                            new State(
                                state.input.substr(1),
                                state.position,
                                "none"
                            ),
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc")]
                            )
                        );
                    default: return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")]
                            )
                        );
                }
            });

            lq.combinator.chainr1(p, op).run(
                new State("a(a(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1(a3a5))");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 6), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 6),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a(a(bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 6),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a(a(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1(a3c5))");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a(a(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr1(p, op).run(
                    new State("a(a{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainr1(p, op).run(
                new State("a(a[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1[a3a4])");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a(a[bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a(a[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1[a3c4])");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a(a[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1a3)");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr1(p, op).run(
                    new State("a(a<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("(a1a3)");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainr1(p, op).run(
                        new State("a(b" + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
                });
            });

            lq.combinator.chainr1(p, op).run(
                new State("a(c(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1(c3a4))");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a(c(bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a(c(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1(c3c4))");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a(c(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr1(p, op).run(
                    new State("a(c{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainr1(p, op).run(
                new State("a(c[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1[c3a3])");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a(c[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr1(p, op).run(
                new State("a(c[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1[c3c3])");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a(c[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(a1c3)");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr1(p, op).run(
                    new State("a(c<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("(a1c3)");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainr1(p, op).run(
                        new State("a(d" + op2 + e3 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 3),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        lq.combinator.chainr1(p, op).run(
                            new State("a{" + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                            throwError,
                            function (error) {
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 3),
                                        [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                                    )
                                ).should.be.ok;
                            },
                            throwError,
                            throwError
                        );
                    });
                });
            });

            lq.combinator.chainr1(p, op).run(
                new State("a[a(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1(a2a4)]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a[a(bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a[a(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1(a2c4)]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a[a(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr1(p, op).run(
                    new State("a[a{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainr1(p, op).run(
                new State("a[a[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1[a2a3]]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a[a[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr1(p, op).run(
                new State("a[a[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1[a2c3]]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a[a[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1a2]");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr1(p, op).run(
                    new State("a[a<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("[a1a2]");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainr1(p, op).run(
                        new State("a[b" + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
                });
            });

            lq.combinator.chainr1(p, op).run(
                new State("a[c(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1(c2a3)]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a[c(bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr1(p, op).run(
                new State("a[c(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1(c2c3)]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a[c(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr1(p, op).run(
                    new State("a[c{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainr1(p, op).run(
                new State("a[c[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1[c2a2]]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a[c[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr1(p, op).run(
                new State("a[c[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1[c2c2]]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("a[c[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[a1c2]");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr1(p, op).run(
                    new State("a[c<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("[a1c2]");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainr1(p, op).run(
                        new State("a[d" + op2 + e3 + "d", SourcePos.init("test"), "some"),
                        function (value, state, error) {
                            value.should.equal("a1");
                            State.equals(
                                state,
                                new State("[d" + op2 + e3 + "d", new SourcePos("test", 1, 2), "none")
                            ).should.be.ok;
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
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
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        lq.combinator.chainr1(p, op).run(
                            new State("a<" + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                            function (value, state, error) {
                                value.should.equal("a1");
                                State.equals(
                                    state,
                                    new State("<" + e2 + op2 + e3 + "d", new SourcePos("test", 1, 2), "none")
                                ).should.be.ok;
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 2),
                                        [
                                            new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                            new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                        ]
                                    )
                                ).should.be.ok;
                            },
                            throwError,
                            throwError,
                            throwError
                        );
                    });
                });
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        ["(", "{", "[", "<"].forEach(function (op1) {
                            lq.combinator.chainr1(p, op).run(
                                new State("b" + op1 + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
                });
            });

            lq.combinator.chainr1(p, op).run(
                new State("c(a(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1(a2a4))");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 5), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c(a(bd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 5),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c(a(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1(a2c4))");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c(a(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr1(p, op).run(
                    new State("c(a{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainr1(p, op).run(
                new State("c(a[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1[a2a3])");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c(a[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr1(p, op).run(
                new State("c(a[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1[a2c3])");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c(a[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1a2)");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr1(p, op).run(
                    new State("c(a<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("(c1a2)");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainr1(p, op).run(
                        new State("c(b" + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
                });
            });

            lq.combinator.chainr1(p, op).run(
                new State("c(c(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1(c2a3))");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c(c(bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr1(p, op).run(
                new State("c(c(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1(c2c3))");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c(c(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr1(p, op).run(
                    new State("c(c{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainr1(p, op).run(
                new State("c(c[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1[c2a2])");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c(c[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr1(p, op).run(
                new State("c(c[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1[c2c2])");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c(c[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("(c1c2)");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr1(p, op).run(
                    new State("c(c<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("(c1c2)");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainr1(p, op).run(
                        new State("c(d" + op2 + e3 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        lq.combinator.chainr1(p, op).run(
                            new State("c{" + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                            throwError,
                            function (error) {
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 2),
                                        [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                                    )
                                ).should.be.ok;
                            },
                            throwError,
                            throwError
                        );
                    });
                });
            });

            lq.combinator.chainr1(p, op).run(
                new State("c[a(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1(a1a3)]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c[a(bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr1(p, op).run(
                new State("c[a(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1(a1c3)]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c[a(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr1(p, op).run(
                    new State("c[a{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainr1(p, op).run(
                new State("c[a[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1[a1a2]]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c[a[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr1(p, op).run(
                new State("c[a[cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1[a1c2]]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c[a[dd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1a1]");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr1(p, op).run(
                    new State("c[a<dd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("[c1a1]");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainr1(p, op).run(
                        new State("c[b" + op2 + e3 + "d", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr1(p, op).run(
                new State("c[c(ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1(c1a2)]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 3), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c[c(bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr1(p, op).run(
                new State("c[c(cd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1(c1c2)]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c[c(dd", SourcePos.init("test"), "some"),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr1(p, op).run(
                    new State("c[c{" + e3 + "d", SourcePos.init("test"), "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "op_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
            });

            lq.combinator.chainr1(p, op).run(
                new State("c[c[ad", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("[c1[c1a1]]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c[c[bd", SourcePos.init("test"), "some"),
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

            lq.combinator.chainr1(p, op).run(
                new State("c[c[cd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("[c1[c1c1]]");
                    State.equals(
                        state,
                        new State("d", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.chainr1(p, op).run(
                new State("c[c[dd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("[c1c1]");
                    State.equals(
                        state,
                        new State("[dd", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            ["a", "b", "c", "d"].forEach(function (e3) {
                lq.combinator.chainr1(p, op).run(
                    new State("c[c<dd", SourcePos.init("test"), "some"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        value.should.equal("[c1c1]");
                        State.equals(
                            state,
                            new State("<dd", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    lq.combinator.chainr1(p, op).run(
                        new State("c[d" + op2 + e3 + "d", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        function (value, state, error) {
                            value.should.equal("c1");
                            State.equals(
                                state,
                                new State("[d" + op2 + e3 + "d", new SourcePos("test", 1, 1), "none")
                            ).should.be.ok;
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 1),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "op_esuc"),
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError
                    );
                });
            });

            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        lq.combinator.chainr1(p, op).run(
                            new State("c<" + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
                            throwError,
                            throwError,
                            function (value, state, error) {
                                value.should.equal("c1");
                                State.equals(
                                    state,
                                    new State("<" + e2 + op2 + e3 + "d", new SourcePos("test", 1, 1), "none")
                                ).should.be.ok;
                                ParseError.equals(
                                    error,
                                    new ParseError(
                                        new SourcePos("test", 1, 1),
                                        [
                                            new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                            new ErrorMessage(ErrorMessageType.MESSAGE, "op_eerr")
                                        ]
                                    )
                                ).should.be.ok;
                            },
                            throwError
                        );
                    });
                });
            });
            
            ["a", "b", "c", "d"].forEach(function (e3) {
                ["(", "{", "[", "<"].forEach(function (op2) {
                    ["a", "b", "c", "d"].forEach(function (e2) {
                        ["(", "{", "[", "<"].forEach(function (op1) {
                            lq.combinator.chainr1(p, op).run(
                                new State("d" + op1 + e2 + op2 + e3 + "d", SourcePos.init("test"), "some"),
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
    });

    describe("anyToken", function () {
        it("should parse any token in stream without updating the position", function () {
            lq.combinator.anyToken.run(
                new State("abc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    value.should.equal("a");
                    State.equals(
                        state,
                        new State("bc", new SourcePos("test", 1, 1), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.unknown(new SourcePos("test", 1, 1))
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.anyToken.run(
                new State(["abc", "def", "ghi"], SourcePos.init("test"), "none"),
                function (value, state, error) {
                    value.should.equal("abc");
                    State.equals(
                        state,
                        new State(["def", "ghi"], new SourcePos("test", 1, 1), "none"),
                        lq.util.ArrayUtil.equals
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.unknown(new SourcePos("test", 1, 1))
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.combinator.anyToken.run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            SourcePos.init("test"),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "")]
                        )
                    ).should.be.ok;
                }
            );

            lq.combinator.anyToken.run(
                new State([], SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            SourcePos.init("test"),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "")]
                        )
                    ).should.be.ok;
                }
            );
        });
    });

    describe("eof", function () {
        it("should accept the end of the input and return 'undefined'", function () {
            lq.combinator.eof.run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("", SourcePos.init("test"), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            SourcePos.init("test"),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, "end of input")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.eof.run(
                new State([], SourcePos.init("test"), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State([], SourcePos.init("test"), "none"),
                        lq.util.ArrayUtil.equals
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            SourcePos.init("test"),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, "end of input")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.eof.run(
                new State("abc", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            SourcePos.init("test"),
                            [
                                new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show("a")),
                                new ErrorMessage(ErrorMessageType.EXPECT, "end of input")
                            ]
                        )
                    ).should.be.ok;
                }
            );

            lq.combinator.eof.run(
                new State(["abc", "def", "ghi"], SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            SourcePos.init("test"),
                            [
                                new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show("abc")),
                                new ErrorMessage(ErrorMessageType.EXPECT, "end of input")
                            ]
                        )
                    ).should.be.ok;
                }
            );
        });
    });

    describe("notFollowedBy(parser)", function () {
        it("should succeed without consumption only when the parser failed", function () {
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

            lq.combinator.notFollowedBy(acsuc).run(
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
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show("foo"))
                            ]
                        )
                    ).should.be.ok;
                }
            );

            lq.combinator.notFollowedBy(acerr).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(state, initState).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.combinator.notFollowedBy(aesuc).run(
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
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show("bar"))
                            ]
                        )
                    ).should.be.ok;
                }
            );

            lq.combinator.notFollowedBy(aeerr).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(state, initState).should.be.ok;
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

    describe("manyTill(parser, end)", function () {

    });
});
