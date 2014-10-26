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
        it("should return the parser that 'parser' returns", function () {
            var acsuc = alwaysCSuc(
                "foo",
                new State("abc", new SourcePos("test", 3, 4), "none"),
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                )
            );
            var acerr = alwaysCErr(
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                )
            );
            var aesuc = alwaysESuc(
                "foo",
                new State("abc", new SourcePos("test", 3, 4), "none"),
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                )
            );
            var aeerr = alwaysEErr(
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                )
            );

            var initState = new State("abc", SourcePos.init("test"), "none");

            lq.monad.join(alwaysCSuc(
                acsuc,
                new State("def", new SourcePos("test", 1, 2), "some"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                )
            )).run(
                initState,
                function (value, state, error) {
                    value.should.equal("foo");
                    State.equals(
                        state,
                        new State("abc", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.join(alwaysCSuc(
                acerr,
                new State("def", new SourcePos("test", 1, 2), "some"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                )
            )).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.join(alwaysCSuc(
                aesuc,
                new State("def", new SourcePos("test", 1, 2), "some"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                )
            )).run(
                initState,
                function (value, state, error) {
                    value.should.equal("foo");
                    State.equals(
                        state,
                        new State("abc", new SourcePos("test", 3, 4), "none")
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

            lq.monad.join(alwaysCSuc(
                aeerr,
                new State("def", new SourcePos("test", 1, 2), "some"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                )
            )).run(
                initState,
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

            lq.monad.join(alwaysCErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                )
            )).run(
                initState,
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

            lq.monad.join(alwaysESuc(
                acsuc,
                new State("def", new SourcePos("test", 1, 2), "some"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                )
            )).run(
                initState,
                function (value, state, error) {
                    value.should.equal("foo");
                    State.equals(
                        state,
                        new State("abc", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.join(alwaysESuc(
                acerr,
                new State("def", new SourcePos("test", 1, 2), "some"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                )
            )).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.join(alwaysESuc(
                aesuc,
                new State("def", new SourcePos("test", 1, 2), "some"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                )
            )).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("foo");
                    State.equals(
                        state,
                        new State("abc", new SourcePos("test", 3, 4), "none")
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

            lq.monad.join(alwaysESuc(
                aeerr,
                new State("def", new SourcePos("test", 1, 2), "some"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                )
            )).run(
                initState,
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

            lq.monad.join(alwaysEErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                )
            )).run(
                initState,
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

    describe("when(flag, parser)", function () {
        it("should run parser when 'flag' is true", function () {
            lq.monad.when(
                true,
                alwaysCSuc(
                    "foo",
                    new State("abc", new SourcePos("test", 1, 2), "none"),
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                    )
                )
            ).run(
                new State("def", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("foo");
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

            lq.monad.when(
                true,
                alwaysCErr(
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                    )
                )
            ).run(
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

            lq.monad.when(
                true,
                alwaysESuc(
                    "foo",
                    new State("abc", new SourcePos("test", 1, 2), "none"),
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                    )
                )
            ).run(
                new State("def", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("foo");
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

            lq.monad.when(
                true,
                alwaysEErr(
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                    )
                )
            ).run(
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

        it("should return a parser that always returns undefined when 'flag' is false", function () {
            lq.monad.when(
                false,
                alwaysCSuc(
                    "foo",
                    new State("abc", new SourcePos("test", 1, 2), "none"),
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                    )
                )
            ).run(
                new State("def", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("def", SourcePos.init("test"), "some")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.unknown(SourcePos.init("test"))
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.when(
                false,
                alwaysCErr(
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                    )
                )
            ).run(
                new State("def", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("def", SourcePos.init("test"), "some")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.unknown(SourcePos.init("test"))
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.when(
                false,
                alwaysESuc(
                    "foo",
                    new State("abc", new SourcePos("test", 1, 2), "none"),
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                    )
                )
            ).run(
                new State("def", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("def", SourcePos.init("test"), "some")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.unknown(SourcePos.init("test"))
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.when(
                false,
                alwaysEErr(
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                    )
                )
            ).run(
                new State("def", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("def", SourcePos.init("test"), "some")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.unknown(SourcePos.init("test"))
                    ).should.be.ok;
                },
                throwError
            );
        });
    });

    describe("unless(flag, parser)", function () {
        it("should run parser when 'flag' is false", function () {
            lq.monad.unless(
                false,
                alwaysCSuc(
                    "foo",
                    new State("abc", new SourcePos("test", 1, 2), "none"),
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                    )
                )
            ).run(
                new State("def", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    value.should.equal("foo");
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

            lq.monad.unless(
                false,
                alwaysCErr(
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                    )
                )
            ).run(
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

            lq.monad.unless(
                false,
                alwaysESuc(
                    "foo",
                    new State("abc", new SourcePos("test", 1, 2), "none"),
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                    )
                )
            ).run(
                new State("def", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("foo");
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

            lq.monad.unless(
                false,
                alwaysEErr(
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                    )
                )
            ).run(
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

        it("should return a parser that always returns undefined when 'flag' is true", function () {
            lq.monad.unless(
                true,
                alwaysCSuc(
                    "foo",
                    new State("abc", new SourcePos("test", 1, 2), "none"),
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                    )
                )
            ).run(
                new State("def", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("def", SourcePos.init("test"), "some")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.unknown(SourcePos.init("test"))
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.unless(
                true,
                alwaysCErr(
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                    )
                )
            ).run(
                new State("def", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("def", SourcePos.init("test"), "some")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.unknown(SourcePos.init("test"))
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.unless(
                true,
                alwaysESuc(
                    "foo",
                    new State("abc", new SourcePos("test", 1, 2), "none"),
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                    )
                )
            ).run(
                new State("def", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("def", SourcePos.init("test"), "some")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.unknown(SourcePos.init("test"))
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.unless(
                true,
                alwaysEErr(
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                    )
                )
            ).run(
                new State("def", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("def", SourcePos.init("test"), "some")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.unknown(SourcePos.init("test"))
                    ).should.be.ok;
                },
                throwError
            );
        });
    });

    describe("liftM(func)", function () {
        it("should lift 'func' to a function that takes one parser and return a parser", function () {
            var f = function (str) { return str.toUpperCase(); };
            var mf = lq.monad.liftM(f);

            var v_acsuc1 = "foo1";
            var s_acsuc1 = new State("def", new SourcePos("test", 1, 2), "none");
            var e_acsuc1 = new ParseError(
                new SourcePos("test", 1, 2),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc1")]
            );
            var acsuc1 = alwaysCSuc(v_acsuc1, s_acsuc1, e_acsuc1);

            var e_acerr1 = new ParseError(
                new SourcePos("test", 1, 2),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr1")]
            );
            var acerr1 = alwaysCErr(e_acerr1);

            var v_aesuc1 = "bar1";
            var s_aesuc1 = new State("def", new SourcePos("test", 1, 2), "none");
            var e_aesuc1 = new ParseError(
                new SourcePos("test", 1, 2),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc1")]
            );
            var aesuc1 = alwaysESuc(v_aesuc1, s_aesuc1, e_aesuc1);

            var e_aeerr1 = new ParseError(
                new SourcePos("test", 1, 2),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr1")]
            );
            var aeerr1 = alwaysEErr(e_aeerr1);

            var initState = new State("abc", SourcePos.init("test"), "some");

            mf(acsuc1).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1.toUpperCase());
                    State.equals(state, s_acsuc1).should.be.ok;
                    ParseError.equals(error, e_acsuc1).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal(v_aesuc1.toUpperCase());
                    State.equals(state, s_aesuc1).should.be.ok;
                    ParseError.equals(error, e_aesuc1).should.be.ok;
                },
                throwError
            );

            mf(acerr1).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr1).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aeerr1).run(
                initState,
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(error, e_aeerr1).should.be.ok;
                }
            );
        });
    });

    describe("liftM2(func)", function () {
        it("should lift 'func' to a function that takes two parsers and return a parser", function () {
            var f = function (strA, strB) { return strA + strB; };
            var mf = lq.monad.liftM2(f);

            var v_acsuc1 = "foo1";
            var s_acsuc1 = new State("def", new SourcePos("test", 1, 2), "none");
            var e_acsuc1 = new ParseError(
                new SourcePos("test", 1, 2),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc1")]
            );
            var acsuc1 = alwaysCSuc(v_acsuc1, s_acsuc1, e_acsuc1);

            var e_acerr1 = new ParseError(
                new SourcePos("test", 1, 2),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr1")]
            );
            var acerr1 = alwaysCErr(e_acerr1);

            var v_aesuc1 = "bar1";
            var s_aesuc1 = new State("def", new SourcePos("test", 1, 2), "none");
            var e_aesuc1 = new ParseError(
                new SourcePos("test", 1, 2),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc1")]
            );
            var aesuc1 = alwaysESuc(v_aesuc1, s_aesuc1, e_aesuc1);

            var e_aeerr1 = new ParseError(
                new SourcePos("test", 1, 2),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr1")]
            );
            var aeerr1 = alwaysEErr(e_aeerr1);

            var v_acsuc2 = "foo2";
            var s_acsuc2 = new State("ghi", new SourcePos("test", 3, 4), "none");
            var e_acsuc2 = new ParseError(
                new SourcePos("test", 3, 4),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc2")]
            );
            var acsuc2 = alwaysCSuc(v_acsuc2, s_acsuc2, e_acsuc2);

            var e_acerr2 = new ParseError(
                new SourcePos("test", 3, 4),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr2")]
            );
            var acerr2 = alwaysCErr(e_acerr2);

            var v_aesuc2 = "bar2";
            var s_aesuc2 = new State("ghi", new SourcePos("test", 3, 4), "none");
            var e_aesuc2 = new ParseError(
                new SourcePos("test", 3, 4),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc2")]
            );
            var aesuc2 = alwaysESuc(v_aesuc2, s_aesuc2, e_aesuc2);

            var e_aeerr2 = new ParseError(
                new SourcePos("test", 3, 4),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr2")]
            );
            var aeerr2 = alwaysEErr(e_aeerr2);

            var initState = new State("abc", SourcePos.init("test"), "some");

            mf(acsuc1, acsuc2).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_acsuc2);
                    State.equals(state, s_acsuc2).should.be.ok;
                    ParseError.equals(error, e_acsuc2).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_aesuc2);
                    State.equals(state, s_aesuc2).should.be.ok;
                    ParseError.equals(error, ParseError.merge(e_acsuc1, e_aesuc2)).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, acerr2).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr2).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, aeerr2).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.merge(e_acsuc1, e_aeerr2)).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_acsuc2);
                    State.equals(state, s_acsuc2).should.be.ok;
                    ParseError.equals(error, e_acsuc2).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_aesuc2);
                    State.equals(state, s_aesuc2).should.be.ok;
                    ParseError.equals(error, ParseError.merge(e_aesuc1, e_aesuc2)).should.be.ok;
                },
                throwError
            );

            mf(aesuc1, acerr2).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr2).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, aeerr2).run(
                initState,
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.merge(e_aesuc1, e_aeerr2)).should.be.ok;
                }
            );

            [acsuc2, acerr2, aesuc2, aeerr2].forEach(function (a2) {
                mf(acerr1, a2).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, e_acerr1).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(aeerr1, a2).run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(error, e_aeerr1).should.be.ok;
                    }
                );
            });
        });
    });

    describe("liftM3(func)", function () {
        it("should lift 'func' to a function that takes three parsers and return a parser", function () {
            var f = function (strA, strB, strC) { return strA + strB + strC; };
            var mf = lq.monad.liftM3(f);

            var v_acsuc1 = "foo1";
            var s_acsuc1 = new State("def", new SourcePos("test", 1, 2), "none");
            var e_acsuc1 = new ParseError(
                new SourcePos("test", 1, 2),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc1")]
            );
            var acsuc1 = alwaysCSuc(v_acsuc1, s_acsuc1, e_acsuc1);

            var e_acerr1 = new ParseError(
                new SourcePos("test", 1, 2),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr1")]
            );
            var acerr1 = alwaysCErr(e_acerr1);

            var v_aesuc1 = "bar1";
            var s_aesuc1 = new State("def", new SourcePos("test", 1, 2), "none");
            var e_aesuc1 = new ParseError(
                new SourcePos("test", 1, 2),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc1")]
            );
            var aesuc1 = alwaysESuc(v_aesuc1, s_aesuc1, e_aesuc1);

            var e_aeerr1 = new ParseError(
                new SourcePos("test", 1, 2),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr1")]
            );
            var aeerr1 = alwaysEErr(e_aeerr1);

            var v_acsuc2 = "foo2";
            var s_acsuc2 = new State("ghi", new SourcePos("test", 3, 4), "none");
            var e_acsuc2 = new ParseError(
                new SourcePos("test", 3, 4),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc2")]
            );
            var acsuc2 = alwaysCSuc(v_acsuc2, s_acsuc2, e_acsuc2);

            var e_acerr2 = new ParseError(
                new SourcePos("test", 3, 4),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr2")]
            );
            var acerr2 = alwaysCErr(e_acerr2);

            var v_aesuc2 = "bar2";
            var s_aesuc2 = new State("ghi", new SourcePos("test", 3, 4), "none");
            var e_aesuc2 = new ParseError(
                new SourcePos("test", 3, 4),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc2")]
            );
            var aesuc2 = alwaysESuc(v_aesuc2, s_aesuc2, e_aesuc2);

            var e_aeerr2 = new ParseError(
                new SourcePos("test", 3, 4),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr2")]
            );
            var aeerr2 = alwaysEErr(e_aeerr2);

            var v_acsuc3 = "foo3";
            var s_acsuc3 = new State("jkl", new SourcePos("test", 5, 6), "none");
            var e_acsuc3 = new ParseError(
                new SourcePos("test", 5, 6),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc3")]
            );
            var acsuc3 = alwaysCSuc(v_acsuc3, s_acsuc3, e_acsuc3);

            var e_acerr3 = new ParseError(
                new SourcePos("test", 5, 6),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr3")]
            );
            var acerr3 = alwaysCErr(e_acerr3);

            var v_aesuc3 = "bar3";
            var s_aesuc3 = new State("jkl", new SourcePos("test", 5, 6), "none");
            var e_aesuc3 = new ParseError(
                new SourcePos("test", 5, 6),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc3")]
            );
            var aesuc3 = alwaysESuc(v_aesuc3, s_aesuc3, e_aesuc3);

            var e_aeerr3 = new ParseError(
                new SourcePos("test", 5, 6),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr3")]
            );
            var aeerr3 = alwaysEErr(e_aeerr3);

            var initState = new State("abc", SourcePos.init("test"), "some");

            mf(acsuc1, acsuc2, acsuc3).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_acsuc2 + v_acsuc3);
                    State.equals(state, s_acsuc3).should.be.ok;
                    ParseError.equals(error, e_acsuc3).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, aesuc3).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_acsuc2 + v_aesuc3);
                    State.equals(state, s_aesuc3).should.be.ok;
                    ParseError.equals(error, ParseError.merge(e_acsuc2, e_aesuc3)).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, acerr3).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr3).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, aeerr3).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.merge(e_acsuc2, e_aeerr3)).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, acsuc3).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_aesuc2 + v_acsuc3);
                    State.equals(state, s_acsuc3).should.be.ok;
                    ParseError.equals(error, e_acsuc3).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, aesuc3).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_aesuc2 + v_aesuc3);
                    State.equals(state, s_aesuc3).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc1, ParseError.merge(e_aesuc2, e_aesuc3))
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, acerr3).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr3).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, aeerr3).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc1, ParseError.merge(e_aesuc2, e_aeerr3))
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, acsuc3).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_acsuc2 + v_acsuc3);
                    State.equals(state, s_acsuc3).should.be.ok;
                    ParseError.equals(error, e_acsuc3).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, aesuc3).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_acsuc2 + v_aesuc3);
                    State.equals(state, s_aesuc3).should.be.ok;
                    ParseError.equals(error, ParseError.merge(e_acsuc2, e_aesuc3)).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, acerr3).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr3).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, aeerr3).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.merge(e_acsuc2, e_aeerr3)).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, acsuc3).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_aesuc2 + v_acsuc3);
                    State.equals(state, s_acsuc3).should.be.ok;
                    ParseError.equals(error, e_acsuc3).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, aesuc3).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_aesuc2 + v_aesuc3);
                    State.equals(state, s_aesuc3).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.merge(e_aesuc1, ParseError.merge(e_aesuc2, e_aesuc3))
                    ).should.be.ok;
                },
                throwError
            );

            mf(aesuc1, aesuc2, acerr3).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr3).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, aeerr3).run(
                initState,
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        ParseError.merge(e_aesuc1, ParseError.merge(e_aesuc2, e_aeerr3))
                    ).should.be.ok;
                }
            );

            [acsuc3, acerr3, aesuc3, aeerr3].forEach(function (a3) {
                mf(acsuc1, acerr2, a3).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, e_acerr2).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(acsuc1, aeerr2, a3).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, ParseError.merge(e_acsuc1, e_aeerr2)).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(aesuc1, acerr2, a3).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, e_acerr2).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(aesuc1, aeerr2, a3).run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(error, ParseError.merge(e_aesuc1, e_aeerr2)).should.be.ok;
                    }
                );

                [acsuc2, acerr2, aesuc2, aeerr2].forEach(function (a2) {
                    mf(acerr1, a2, a3).run(
                        initState,
                        throwError,
                        function (error) {
                            ParseError.equals(error, e_acerr1).should.be.ok;
                        },
                        throwError,
                        throwError
                    );

                    mf(aeerr1, a2, a3).run(
                        initState,
                        throwError,
                        throwError,
                        throwError,
                        function (error) {
                            ParseError.equals(error, e_aeerr1).should.be.ok;
                        }
                    );
                });
            });
        });
    });

    describe("liftM4(func)", function () {
        it("should lift 'func' to a function that takes four parsers and return a parser", function () {
            var f = function (strA, strB, strC, strD) { return strA + strB + strC + strD; };
            var mf = lq.monad.liftM4(f);

            var v_acsuc1 = "foo1";
            var s_acsuc1 = new State("def", new SourcePos("test", 1, 2), "none");
            var e_acsuc1 = new ParseError(
                new SourcePos("test", 1, 2),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc1")]
            );
            var acsuc1 = alwaysCSuc(v_acsuc1, s_acsuc1, e_acsuc1);

            var e_acerr1 = new ParseError(
                new SourcePos("test", 1, 2),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr1")]
            );
            var acerr1 = alwaysCErr(e_acerr1);

            var v_aesuc1 = "bar1";
            var s_aesuc1 = new State("def", new SourcePos("test", 1, 2), "none");
            var e_aesuc1 = new ParseError(
                new SourcePos("test", 1, 2),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc1")]
            );
            var aesuc1 = alwaysESuc(v_aesuc1, s_aesuc1, e_aesuc1);

            var e_aeerr1 = new ParseError(
                new SourcePos("test", 1, 2),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr1")]
            );
            var aeerr1 = alwaysEErr(e_aeerr1);

            var v_acsuc2 = "foo2";
            var s_acsuc2 = new State("ghi", new SourcePos("test", 3, 4), "none");
            var e_acsuc2 = new ParseError(
                new SourcePos("test", 3, 4),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc2")]
            );
            var acsuc2 = alwaysCSuc(v_acsuc2, s_acsuc2, e_acsuc2);

            var e_acerr2 = new ParseError(
                new SourcePos("test", 3, 4),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr2")]
            );
            var acerr2 = alwaysCErr(e_acerr2);

            var v_aesuc2 = "bar2";
            var s_aesuc2 = new State("ghi", new SourcePos("test", 3, 4), "none");
            var e_aesuc2 = new ParseError(
                new SourcePos("test", 3, 4),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc2")]
            );
            var aesuc2 = alwaysESuc(v_aesuc2, s_aesuc2, e_aesuc2);

            var e_aeerr2 = new ParseError(
                new SourcePos("test", 3, 4),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr2")]
            );
            var aeerr2 = alwaysEErr(e_aeerr2);

            var v_acsuc3 = "foo3";
            var s_acsuc3 = new State("jkl", new SourcePos("test", 5, 6), "none");
            var e_acsuc3 = new ParseError(
                new SourcePos("test", 5, 6),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc3")]
            );
            var acsuc3 = alwaysCSuc(v_acsuc3, s_acsuc3, e_acsuc3);

            var e_acerr3 = new ParseError(
                new SourcePos("test", 5, 6),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr3")]
            );
            var acerr3 = alwaysCErr(e_acerr3);

            var v_aesuc3 = "bar3";
            var s_aesuc3 = new State("jkl", new SourcePos("test", 5, 6), "none");
            var e_aesuc3 = new ParseError(
                new SourcePos("test", 5, 6),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc3")]
            );
            var aesuc3 = alwaysESuc(v_aesuc3, s_aesuc3, e_aesuc3);

            var e_aeerr3 = new ParseError(
                new SourcePos("test", 5, 6),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr3")]
            );
            var aeerr3 = alwaysEErr(e_aeerr3);

            var v_acsuc4 = "foo4";
            var s_acsuc4 = new State("jkl", new SourcePos("test", 7, 8), "none");
            var e_acsuc4 = new ParseError(
                new SourcePos("test", 7, 8),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc4")]
            );
            var acsuc4 = alwaysCSuc(v_acsuc4, s_acsuc4, e_acsuc4);

            var e_acerr4 = new ParseError(
                new SourcePos("test", 7, 8),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr4")]
            );
            var acerr4 = alwaysCErr(e_acerr4);

            var v_aesuc4 = "bar4";
            var s_aesuc4 = new State("jkl", new SourcePos("test", 7, 8), "none");
            var e_aesuc4 = new ParseError(
                new SourcePos("test", 7, 8),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc4")]
            );
            var aesuc4 = alwaysESuc(v_aesuc4, s_aesuc4, e_aesuc4);

            var e_aeerr4 = new ParseError(
                new SourcePos("test", 7, 8),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr4")]
            );
            var aeerr4 = alwaysEErr(e_aeerr4);

            var initState = new State("abc", SourcePos.init("test"), "some");

            mf(acsuc1, acsuc2, acsuc3, acsuc4).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_acsuc2 + v_acsuc3 + v_acsuc4);
                    State.equals(state, s_acsuc4).should.be.ok;
                    ParseError.equals(error, e_acsuc4).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, acsuc3, aesuc4).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_acsuc2 + v_acsuc3 + v_aesuc4);
                    State.equals(state, s_aesuc4).should.be.ok;
                    ParseError.equals(error, ParseError.merge(e_acsuc3, e_aesuc4)).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, acsuc3, acerr4).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr4).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, acsuc3, aeerr4).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.merge(e_acsuc3, e_aeerr4)).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, aesuc3, acsuc4).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_acsuc2 + v_aesuc3 + v_acsuc4);
                    State.equals(state, s_acsuc4).should.be.ok;
                    ParseError.equals(error, e_acsuc4).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, aesuc3, aesuc4).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_acsuc2 + v_aesuc3 + v_aesuc4);
                    State.equals(state, s_aesuc4).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc2, ParseError.merge(e_aesuc3, e_aesuc4))
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, aesuc3, acerr4).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr4).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, aesuc3, aeerr4).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc2, ParseError.merge(e_aesuc3, e_aeerr4))
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, acsuc3, acsuc4).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_aesuc2 + v_acsuc3 + v_acsuc4);
                    State.equals(state, s_acsuc4).should.be.ok;
                    ParseError.equals(error, e_acsuc4).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, acsuc3, aesuc4).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_aesuc2 + v_acsuc3 + v_aesuc4);
                    State.equals(state, s_aesuc4).should.be.ok;
                    ParseError.equals(error, ParseError.merge(e_acsuc3, e_aesuc4)).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, acsuc3, acerr4).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr4).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, acsuc3, aeerr4).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.merge(e_acsuc3, e_aeerr4)).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, aesuc3, acsuc4).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_aesuc2 + v_aesuc3 + v_acsuc4);
                    State.equals(state, s_acsuc4).should.be.ok;
                    ParseError.equals(error, e_acsuc4).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, aesuc3, aesuc4).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_aesuc2 + v_aesuc3 + v_aesuc4);
                    State.equals(state, s_aesuc4).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc1, ParseError.merge(e_aesuc2, ParseError.merge(e_aesuc3, e_aesuc4)))
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, aesuc3, acerr4).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr4).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, aesuc3, aeerr4).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc1, ParseError.merge(e_aesuc2, ParseError.merge(e_aesuc3, e_aeerr4)))
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, acsuc3, acsuc4).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_acsuc2 + v_acsuc3 + v_acsuc4);
                    State.equals(state, s_acsuc4).should.be.ok;
                    ParseError.equals(error, e_acsuc4).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, acsuc3, aesuc4).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_acsuc2 + v_acsuc3 + v_aesuc4);
                    State.equals(state, s_aesuc4).should.be.ok;
                    ParseError.equals(error, ParseError.merge(e_acsuc3, e_aesuc4)).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, acsuc3, acerr4).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr4).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, acsuc3, aeerr4).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.merge(e_acsuc3, e_aeerr4)).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, aesuc3, acsuc4).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_acsuc2 + v_aesuc3 + v_acsuc4);
                    State.equals(state, s_acsuc4).should.be.ok;
                    ParseError.equals(error, e_acsuc4).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, aesuc3, aesuc4).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_acsuc2 + v_aesuc3 + v_aesuc4);
                    State.equals(state, s_aesuc4).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc2, ParseError.merge(e_aesuc3, e_aesuc4))
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, aesuc3, acerr4).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr4).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, aesuc3, aeerr4).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc2, ParseError.merge(e_aesuc3, e_aeerr4))
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, acsuc3, acsuc4).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_aesuc2 + v_acsuc3 + v_acsuc4);
                    State.equals(state, s_acsuc4).should.be.ok;
                    ParseError.equals(error, e_acsuc4).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, acsuc3, aesuc4).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_aesuc2 + v_acsuc3 + v_aesuc4);
                    State.equals(state, s_aesuc4).should.be.ok;
                    ParseError.equals(error, ParseError.merge(e_acsuc3, e_aesuc4)).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, acsuc3, acerr4).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr4).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, acsuc3, aeerr4).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.merge(e_acsuc3, e_aeerr4)).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, aesuc3, acsuc4).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_aesuc2 + v_aesuc3 + v_acsuc4);
                    State.equals(state, s_acsuc4).should.be.ok;
                    ParseError.equals(error, e_acsuc4).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, aesuc3, aesuc4).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_aesuc2 + v_aesuc3 + v_aesuc4);
                    State.equals(state, s_aesuc4).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.merge(e_aesuc1, ParseError.merge(e_aesuc2, ParseError.merge(e_aesuc3, e_aesuc4)))
                    ).should.be.ok;
                },
                throwError
            );

            mf(aesuc1, aesuc2, aesuc3, acerr4).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr4).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, aesuc3, aeerr4).run(
                initState,
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        ParseError.merge(e_aesuc1, ParseError.merge(e_aesuc2, ParseError.merge(e_aesuc3, e_aeerr4)))
                    ).should.be.ok;
                }
            );

            [acsuc4, acerr4, aesuc4, aeerr4].forEach(function (a4) {
                mf(acsuc1, acsuc2, acerr3, a4).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, e_acerr3).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(acsuc1, acsuc2, aeerr3, a4).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, ParseError.merge(e_acsuc2, e_aeerr3)).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(acsuc1, aesuc2, acerr3, a4).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, e_acerr3).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(acsuc1, aesuc2, aeerr3, a4).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            ParseError.merge(e_acsuc1, ParseError.merge(e_aesuc2, e_aeerr3))
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(aesuc1, acsuc2, acerr3, a4).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, e_acerr3).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(aesuc1, acsuc2, aeerr3, a4).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, ParseError.merge(e_acsuc2, e_aeerr3)).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(aesuc1, aesuc2, acerr3, a4).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, e_acerr3).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(aesuc1, aesuc2, aeerr3, a4).run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            ParseError.merge(e_aesuc1, ParseError.merge(e_aesuc2, e_aeerr3))
                        ).should.be.ok;
                    }
                );

                [acsuc3, acerr3, aesuc3, aeerr3].forEach(function (a3) {
                    mf(acsuc1, acerr2, a3, a4).run(
                        initState,
                        throwError,
                        function (error) {
                            ParseError.equals(error, e_acerr2).should.be.ok;
                        },
                        throwError,
                        throwError
                    );

                    mf(acsuc1, aeerr2, a3, a4).run(
                        initState,
                        throwError,
                        function (error) {
                            ParseError.equals(error, ParseError.merge(e_acsuc1, e_aeerr2)).should.be.ok;
                        },
                        throwError,
                        throwError
                    );

                    mf(aesuc1, acerr2, a3, a4).run(
                        initState,
                        throwError,
                        function (error) {
                            ParseError.equals(error, e_acerr2).should.be.ok;
                        },
                        throwError,
                        throwError
                    );

                    mf(aesuc1, aeerr2, a3, a4).run(
                        initState,
                        throwError,
                        throwError,
                        throwError,
                        function (error) {
                            ParseError.equals(error, ParseError.merge(e_aesuc1, e_aeerr2)).should.be.ok;
                        }
                    );

                    [acsuc2, acerr2, aesuc2, aeerr2].forEach(function (a2) {
                        mf(acerr1, a2, a3, a4).run(
                            initState,
                            throwError,
                            function (error) {
                                ParseError.equals(error, e_acerr1).should.be.ok;
                            },
                            throwError,
                            throwError
                        );

                        mf(aeerr1, a2, a3, a4).run(
                            initState,
                            throwError,
                            throwError,
                            throwError,
                            function (error) {
                                ParseError.equals(error, e_aeerr1).should.be.ok;
                            }
                        );
                    });
                });
            });
        });
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
