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
        it("should lift 'func' to a function that takes five parsers and return a parser", function () {
            var f = function (strA, strB, strC, strD, strE) { return strA + strB + strC + strD + strE; };
            var mf = lq.monad.liftM5(f);

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

            var v_acsuc5 = "foo5";
            var s_acsuc5 = new State("jkl", new SourcePos("test", 9, 10), "none");
            var e_acsuc5 = new ParseError(
                new SourcePos("test", 9, 10),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc5")]
            );
            var acsuc5 = alwaysCSuc(v_acsuc5, s_acsuc5, e_acsuc5);

            var e_acerr5 = new ParseError(
                new SourcePos("test", 9, 10),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr5")]
            );
            var acerr5 = alwaysCErr(e_acerr5);

            var v_aesuc5 = "bar5";
            var s_aesuc5 = new State("jkl", new SourcePos("test", 9, 10), "none");
            var e_aesuc5 = new ParseError(
                new SourcePos("test", 9, 10),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc5")]
            );
            var aesuc5 = alwaysESuc(v_aesuc5, s_aesuc5, e_aesuc5);

            var e_aeerr5 = new ParseError(
                new SourcePos("test", 9, 10),
                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr5")]
            );
            var aeerr5 = alwaysEErr(e_aeerr5);

            var initState = new State("abc", SourcePos.init("test"), "some");

            mf(acsuc1, acsuc2, acsuc3, acsuc4, acsuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_acsuc2 + v_acsuc3 + v_acsuc4 + v_acsuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, e_acsuc5).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, acsuc3, acsuc4, aesuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_acsuc2 + v_acsuc3 + v_acsuc4 + v_aesuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, ParseError.merge(e_acsuc4, e_aesuc5)).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, acsuc3, acsuc4, acerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr5).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, acsuc3, acsuc4, aeerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.merge(e_acsuc4, e_aeerr5)).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, acsuc3, aesuc4, acsuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_acsuc2 + v_acsuc3 + v_aesuc4 + v_acsuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, e_acsuc5).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, acsuc3, aesuc4, aesuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_acsuc2 + v_acsuc3 + v_aesuc4 + v_aesuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc3, ParseError.merge(e_aesuc4, e_aesuc5))
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, acsuc3, aesuc4, acerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr5).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, acsuc3, aesuc4, aeerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc3, ParseError.merge(e_acsuc4, e_aeerr5))
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, aesuc3, acsuc4, acsuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_acsuc2 + v_aesuc3 + v_acsuc4 + v_acsuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, e_acsuc5).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, aesuc3, acsuc4, aesuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_acsuc2 + v_aesuc3 + v_acsuc4 + v_aesuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, ParseError.merge(e_acsuc4, e_aesuc5)).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, aesuc3, acsuc4, acerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr5).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, aesuc3, acsuc4, aeerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.merge(e_acsuc4, e_aeerr5)).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, aesuc3, aesuc4, acsuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_acsuc2 + v_aesuc3 + v_aesuc4 + v_acsuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, e_acsuc5).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, aesuc3, aesuc4, aesuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_acsuc2 + v_aesuc3 + v_aesuc4 + v_aesuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc2, ParseError.merge(e_aesuc3, ParseError.merge(e_aesuc4, e_aesuc5)))
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, aesuc3, aesuc4, acerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr5).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, acsuc2, aesuc3, aesuc4, aeerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc2, ParseError.merge(e_aesuc3, ParseError.merge(e_acsuc4, e_aeerr5)))
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, acsuc3, acsuc4, acsuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_aesuc2 + v_acsuc3 + v_acsuc4 + v_acsuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, e_acsuc5).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, acsuc3, acsuc4, aesuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_aesuc2 + v_acsuc3 + v_acsuc4 + v_aesuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, ParseError.merge(e_acsuc4, e_aesuc5)).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, acsuc3, acsuc4, acerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr5).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, acsuc3, acsuc4, aeerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.merge(e_acsuc4, e_aeerr5)).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, acsuc3, aesuc4, acsuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_aesuc2 + v_acsuc3 + v_aesuc4 + v_acsuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, e_acsuc5).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, acsuc3, aesuc4, aesuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_aesuc2 + v_acsuc3 + v_aesuc4 + v_aesuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc3, ParseError.merge(e_aesuc4, e_aesuc5))
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, acsuc3, aesuc4, acerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr5).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, acsuc3, aesuc4, aeerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc3, ParseError.merge(e_acsuc4, e_aeerr5))
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, aesuc3, acsuc4, acsuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_aesuc2 + v_aesuc3 + v_acsuc4 + v_acsuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, e_acsuc5).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, aesuc3, acsuc4, aesuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_aesuc2 + v_aesuc3 + v_acsuc4 + v_aesuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, ParseError.merge(e_acsuc4, e_aesuc5)).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, aesuc3, acsuc4, acerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr5).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, aesuc3, acsuc4, aeerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.merge(e_acsuc4, e_aeerr5)).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, aesuc3, aesuc4, acsuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_aesuc2 + v_aesuc3 + v_aesuc4 + v_acsuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, e_acsuc5).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, aesuc3, aesuc4, aesuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_acsuc1 + v_aesuc2 + v_aesuc3 + v_aesuc4 + v_aesuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc1, ParseError.merge(e_aesuc2, ParseError.merge(e_aesuc3, ParseError.merge(e_aesuc4, e_aesuc5))))
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, aesuc3, aesuc4, acerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr5).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(acsuc1, aesuc2, aesuc3, aesuc4, aeerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc1, ParseError.merge(e_aesuc2, ParseError.merge(e_aesuc3, ParseError.merge(e_acsuc4, e_aeerr5))))
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, acsuc3, acsuc4, acsuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_acsuc2 + v_acsuc3 + v_acsuc4 + v_acsuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, e_acsuc5).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, acsuc3, acsuc4, aesuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_acsuc2 + v_acsuc3 + v_acsuc4 + v_aesuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, ParseError.merge(e_acsuc4, e_aesuc5)).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, acsuc3, acsuc4, acerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr5).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, acsuc3, acsuc4, aeerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.merge(e_acsuc4, e_aeerr5)).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, acsuc3, aesuc4, acsuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_acsuc2 + v_acsuc3 + v_aesuc4 + v_acsuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, e_acsuc5).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, acsuc3, aesuc4, aesuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_acsuc2 + v_acsuc3 + v_aesuc4 + v_aesuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc3, ParseError.merge(e_aesuc4, e_aesuc5))
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, acsuc3, aesuc4, acerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr5).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, acsuc3, aesuc4, aeerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc3, ParseError.merge(e_acsuc4, e_aeerr5))
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, aesuc3, acsuc4, acsuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_acsuc2 + v_aesuc3 + v_acsuc4 + v_acsuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, e_acsuc5).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, aesuc3, acsuc4, aesuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_acsuc2 + v_aesuc3 + v_acsuc4 + v_aesuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, ParseError.merge(e_acsuc4, e_aesuc5)).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, aesuc3, acsuc4, acerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr5).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, aesuc3, acsuc4, aeerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.merge(e_acsuc4, e_aeerr5)).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, aesuc3, aesuc4, acsuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_acsuc2 + v_aesuc3 + v_aesuc4 + v_acsuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, e_acsuc5).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, aesuc3, aesuc4, aesuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_acsuc2 + v_aesuc3 + v_aesuc4 + v_aesuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc2, ParseError.merge(e_aesuc3, ParseError.merge(e_aesuc4, e_aesuc5)))
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, aesuc3, aesuc4, acerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr5).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, acsuc2, aesuc3, aesuc4, aeerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc2, ParseError.merge(e_aesuc3, ParseError.merge(e_acsuc4, e_aeerr5)))
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, acsuc3, acsuc4, acsuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_aesuc2 + v_acsuc3 + v_acsuc4 + v_acsuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, e_acsuc5).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, acsuc3, acsuc4, aesuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_aesuc2 + v_acsuc3 + v_acsuc4 + v_aesuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, ParseError.merge(e_acsuc4, e_aesuc5)).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, acsuc3, acsuc4, acerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr5).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, acsuc3, acsuc4, aeerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.merge(e_acsuc4, e_aeerr5)).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, acsuc3, aesuc4, acsuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_aesuc2 + v_acsuc3 + v_aesuc4 + v_acsuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, e_acsuc5).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, acsuc3, aesuc4, aesuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_aesuc2 + v_acsuc3 + v_aesuc4 + v_aesuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc3, ParseError.merge(e_aesuc4, e_aesuc5))
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, acsuc3, aesuc4, acerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr5).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, acsuc3, aesuc4, aeerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        ParseError.merge(e_acsuc3, ParseError.merge(e_acsuc4, e_aeerr5))
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, aesuc3, acsuc4, acsuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_aesuc2 + v_aesuc3 + v_acsuc4 + v_acsuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, e_acsuc5).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, aesuc3, acsuc4, aesuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_aesuc2 + v_aesuc3 + v_acsuc4 + v_aesuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, ParseError.merge(e_acsuc4, e_aesuc5)).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, aesuc3, acsuc4, acerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr5).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, aesuc3, acsuc4, aeerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.merge(e_acsuc4, e_aeerr5)).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, aesuc3, aesuc4, acsuc5).run(
                initState,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_aesuc2 + v_aesuc3 + v_aesuc4 + v_acsuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(error, e_acsuc5).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, aesuc3, aesuc4, aesuc5).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal(v_aesuc1 + v_aesuc2 + v_aesuc3 + v_aesuc4 + v_aesuc5);
                    State.equals(state, s_acsuc5).should.be.ok;
                    ParseError.equals(
                        error,
                        ParseError.merge(e_aesuc1, ParseError.merge(e_aesuc2, ParseError.merge(e_aesuc3, ParseError.merge(e_aesuc4, e_aesuc5))))
                    ).should.be.ok;
                },
                throwError
            );

            mf(aesuc1, aesuc2, aesuc3, aesuc4, acerr5).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(error, e_acerr5).should.be.ok;
                },
                throwError,
                throwError
            );

            mf(aesuc1, aesuc2, aesuc3, aesuc4, aeerr5).run(
                initState,
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        ParseError.merge(e_aesuc1, ParseError.merge(e_aesuc2, ParseError.merge(e_aesuc3, ParseError.merge(e_acsuc4, e_aeerr5))))
                    ).should.be.ok;
                }
            );

            [acsuc5, acerr5, aesuc5, aeerr5].forEach(function (a5) {
                mf(acsuc1, acsuc2, acsuc3, acerr4, a5).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, e_acerr4).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(acsuc1, acsuc2, acsuc3, aeerr4, a5).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, ParseError.merge(e_acsuc3, e_aeerr4)).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(acsuc1, acsuc2, aesuc3, acerr4, a5).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, e_acerr4).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(acsuc1, acsuc2, aesuc3, aeerr4, a5).run(
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

                mf(acsuc1, aesuc2, acsuc3, acerr4, a5).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, e_acerr4).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(acsuc1, aesuc2, acsuc3, aeerr4, a5).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, ParseError.merge(e_acsuc3, e_aeerr4)).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(acsuc1, aesuc2, aesuc3, acerr4, a5).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, e_acerr4).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(acsuc1, aesuc2, aesuc3, aeerr4, a5).run(
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

                mf(aesuc1, acsuc2, acsuc3, acerr4, a5).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, e_acerr4).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(aesuc1, acsuc2, acsuc3, aeerr4, a5).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, ParseError.merge(e_acsuc3, e_aeerr4)).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(aesuc1, acsuc2, aesuc3, acerr4, a5).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, e_acerr4).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(aesuc1, acsuc2, aesuc3, aeerr4, a5).run(
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

                mf(aesuc1, aesuc2, acsuc3, acerr4, a5).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, e_acerr4).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(aesuc1, aesuc2, acsuc3, aeerr4, a5).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, ParseError.merge(e_acsuc3, e_aeerr4)).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(aesuc1, aesuc2, aesuc3, acerr4, a5).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(error, e_acerr4).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                mf(aesuc1, aesuc2, aesuc3, aeerr4, a5).run(
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
                    mf(acsuc1, acsuc2, acerr3, a4, a5).run(
                        initState,
                        throwError,
                        function (error) {
                            ParseError.equals(error, e_acerr3).should.be.ok;
                        },
                        throwError,
                        throwError
                    );

                    mf(acsuc1, acsuc2, aeerr3, a4, a5).run(
                        initState,
                        throwError,
                        function (error) {
                            ParseError.equals(error, ParseError.merge(e_acsuc2, e_aeerr3)).should.be.ok;
                        },
                        throwError,
                        throwError
                    );

                    mf(acsuc1, aesuc2, acerr3, a4, a5).run(
                        initState,
                        throwError,
                        function (error) {
                            ParseError.equals(error, e_acerr3).should.be.ok;
                        },
                        throwError,
                        throwError
                    );

                    mf(acsuc1, aesuc2, aeerr3, a4, a5).run(
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

                    mf(aesuc1, acsuc2, acerr3, a4, a5).run(
                        initState,
                        throwError,
                        function (error) {
                            ParseError.equals(error, e_acerr3).should.be.ok;
                        },
                        throwError,
                        throwError
                    );

                    mf(aesuc1, acsuc2, aeerr3, a4, a5).run(
                        initState,
                        throwError,
                        function (error) {
                            ParseError.equals(error, ParseError.merge(e_acsuc2, e_aeerr3)).should.be.ok;
                        },
                        throwError,
                        throwError
                    );

                    mf(aesuc1, aesuc2, acerr3, a4, a5).run(
                        initState,
                        throwError,
                        function (error) {
                            ParseError.equals(error, e_acerr3).should.be.ok;
                        },
                        throwError,
                        throwError
                    );

                    mf(aesuc1, aesuc2, aeerr3, a4, a5).run(
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
                        mf(acsuc1, acerr2, a3, a4, a5).run(
                            initState,
                            throwError,
                            function (error) {
                                ParseError.equals(error, e_acerr2).should.be.ok;
                            },
                            throwError,
                            throwError
                        );

                         mf(acsuc1, aeerr2, a3, a4, a5).run(
                            initState,
                            throwError,
                            function (error) {
                                ParseError.equals(error, ParseError.merge(e_acsuc1, e_aeerr2)).should.be.ok;
                            },
                            throwError,
                            throwError
                        );

                         mf(aesuc1, acerr2, a3, a4, a5).run(
                            initState,
                            throwError,
                            function (error) {
                                ParseError.equals(error, e_acerr2).should.be.ok;
                            },
                            throwError,
                            throwError
                        );

                         mf(aesuc1, aeerr2, a3, a4, a5).run(
                            initState,
                            throwError,
                            throwError,
                            throwError,
                            function (error) {
                                ParseError.equals(error, ParseError.merge(e_aesuc1, e_aeerr2)).should.be.ok;
                            }
                        );

                         [acsuc2, acerr2, aesuc2, aeerr2].forEach(function (a2) {
                            mf(acerr1, a2, a3, a4, a5).run(
                                initState,
                                throwError,
                                function (error) {
                                    ParseError.equals(error, e_acerr1).should.be.ok;
                                },
                                throwError,
                                throwError
                            );

                            mf(aeerr1, a2, a3, a4, a5).run(
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
    });

    describe("ltor(funcA, funcB)", function () {
        it("should compose two monadic functions from left to right", function () {
            var acsucf = function (str) {
                return alwaysCSuc(
                    str + "bar",
                    new State("def", new SourcePos("test", 1, 2), "none"),
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_bar")]
                    )
                );
            };

            var acerrf = function (str) {
                return alwaysCErr(
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_bar")]
                    )
                );
            };

            var aesucf = function (str) {
                return alwaysESuc(
                    str + "bar",
                    new State("def", new SourcePos("test", 1, 2), "none"),
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_bar")]
                    )
                );
            };

            var aeerrf = function (str) {
                return alwaysEErr(
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_bar")]
                    )
                );
            };

            var acsucg = function (str) {
                return alwaysCSuc(
                    str + "baz",
                    new State("ghi", new SourcePos("test", 3, 4), "none"),
                    new ParseError(
                        new SourcePos("test", 3, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_baz")]
                    )
                );
            };

            var acerrg = function (str) {
                return alwaysCErr(
                    new ParseError(
                        new SourcePos("test", 3, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_baz")]
                    )
                );
            };

            var aesucg = function (str) {
                return alwaysESuc(
                    str + "baz",
                    new State("ghi", new SourcePos("test", 3, 4), "none"),
                    new ParseError(
                        new SourcePos("test", 3, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_baz")]
                    )
                );
            };

            var aeerrg = function (str) {
                return alwaysEErr(
                    new ParseError(
                        new SourcePos("test", 3, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_baz")]
                    )
                );
            };

            var initState = new State("abc", SourcePos.init("test"), "some");

            lq.monad.ltor(acsucf, acsucg)("foo").run(
                initState,
                function (value, state, error) {
                    value.should.equal("foobarbaz"),
                    State.equals(
                        state,
                        new State("ghi", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_baz")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.ltor(acsucf, acerrg)("foo").run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_baz")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.ltor(acsucf, aesucg)("foo").run(
                initState,
                function (value, state, error) {
                    value.should.equal("foobarbaz"),
                    State.equals(
                        state,
                        new State("ghi", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_bar")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.ltor(acsucf, aeerrg)("foo").run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_bar")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.ltor(aesucf, acsucg)("foo").run(
                initState,
                function (value, state, error) {
                    value.should.equal("foobarbaz"),
                    State.equals(
                        state,
                        new State("ghi", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_baz")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.ltor(aesucf, acerrg)("foo").run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_baz")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.ltor(aesucf, aesucg)("foo").run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("foobarbaz"),
                    State.equals(
                        state,
                        new State("ghi", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_bar")]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.ltor(aesucf, aeerrg)("foo").run(
                initState,
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_bar")]
                        )
                    ).should.be.ok;
                }
            );

            [acsucg, acerrg, aesucg, aeerrg].forEach(function (ag) {
                lq.monad.ltor(acerrf, acerrg)("foo").run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_bar")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.monad.ltor(aeerrf, acerrg)("foo").run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_bar")]
                            )
                        ).should.be.ok;
                    }
                );
            });
        });
    });

    describe("rtol(funcA, funcB)", function () {
        it("should compose two monadic functions from right to left", function () {
            var acsucf = function (str) {
                return alwaysCSuc(
                    str + "bar",
                    new State("def", new SourcePos("test", 1, 2), "none"),
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_bar")]
                    )
                );
            };

            var acerrf = function (str) {
                return alwaysCErr(
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_bar")]
                    )
                );
            };

            var aesucf = function (str) {
                return alwaysESuc(
                    str + "bar",
                    new State("def", new SourcePos("test", 1, 2), "none"),
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_bar")]
                    )
                );
            };

            var aeerrf = function (str) {
                return alwaysEErr(
                    new ParseError(
                        new SourcePos("test", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_bar")]
                    )
                );
            };

            var acsucg = function (str) {
                return alwaysCSuc(
                    str + "baz",
                    new State("ghi", new SourcePos("test", 3, 4), "none"),
                    new ParseError(
                        new SourcePos("test", 3, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_baz")]
                    )
                );
            };

            var acerrg = function (str) {
                return alwaysCErr(
                    new ParseError(
                        new SourcePos("test", 3, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_baz")]
                    )
                );
            };

            var aesucg = function (str) {
                return alwaysESuc(
                    str + "baz",
                    new State("ghi", new SourcePos("test", 3, 4), "none"),
                    new ParseError(
                        new SourcePos("test", 3, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_baz")]
                    )
                );
            };

            var aeerrg = function (str) {
                return alwaysEErr(
                    new ParseError(
                        new SourcePos("test", 3, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_baz")]
                    )
                );
            };

            var initState = new State("abc", SourcePos.init("test"), "some");

            lq.monad.rtol(acsucg, acsucf)("foo").run(
                initState,
                function (value, state, error) {
                    value.should.equal("foobarbaz"),
                    State.equals(
                        state,
                        new State("ghi", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_baz")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.rtol(acerrg, acsucf)("foo").run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_baz")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.rtol(aesucg, acsucf)("foo").run(
                initState,
                function (value, state, error) {
                    value.should.equal("foobarbaz"),
                    State.equals(
                        state,
                        new State("ghi", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_bar")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.rtol(aeerrg, acsucf)("foo").run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_bar")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.rtol(acsucg, aesucf)("foo").run(
                initState,
                function (value, state, error) {
                    value.should.equal("foobarbaz"),
                    State.equals(
                        state,
                        new State("ghi", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_baz")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.rtol(acerrg, aesucf)("foo").run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_baz")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.rtol(aesucg, aesucf)("foo").run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("foobarbaz"),
                    State.equals(
                        state,
                        new State("ghi", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_bar")]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.rtol(aeerrg, aesucf)("foo").run(
                initState,
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_bar")]
                        )
                    ).should.be.ok;
                }
            );

            [acsucg, acerrg, aesucg, aeerrg].forEach(function (ag) {
                lq.monad.rtol(acerrg, acerrf)("foo").run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_bar")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.monad.rtol(acerrg, aeerrf)("foo").run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_bar")]
                            )
                        ).should.be.ok;
                    }
                );
            });
        });
    });

    describe("sequence(parsers)", function () {
        it("should run parsers sequentially and return the array of the results", function () {
            var initState = new State("abc", SourcePos.init("test"), "some");
            
            lq.monad.sequence([]).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    (lq.util.ArrayUtil.equals(value, [])).should.be.ok;
                    State.equals(state, initState).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );

            var acsuc1 = alwaysCSuc(
                "foo",
                new State("def", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_foo")]
                )
            );

            var acerr1 = alwaysCErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_foo")]
                )
            );

            var aesuc1 = alwaysESuc(
                "foo",
                new State("def", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_foo")]
                )
            );

            var aeerr1 = alwaysEErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_foo")]
                )
            );

            var acsuc2 = alwaysCSuc(
                "bar",
                new State("ghi", new SourcePos("test", 3, 4), "none"),
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_bar")]
                )
            );

            var acerr2 = alwaysCErr(
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_bar")]
                )
            );

            var aesuc2 = alwaysESuc(
                "bar",
                new State("ghi", new SourcePos("test", 3, 4), "none"),
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_bar")]
                )
            );

            var aeerr2 = alwaysEErr(
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_bar")]
                )
            );

            lq.monad.sequence([acsuc1, acsuc2]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["foo", "bar"]).should.be.ok;
                    State.equals(
                        state,
                        new State("ghi", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_bar")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.sequence([acsuc1, acerr2]).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_bar")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.sequence([acsuc1, aesuc2]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["foo", "bar"]).should.be.ok;
                    State.equals(
                        state,
                        new State("ghi", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_foo")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.sequence([acsuc1, aeerr2]).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_foo")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.sequence([aesuc1, acsuc2]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["foo", "bar"]).should.be.ok;
                    State.equals(
                        state,
                        new State("ghi", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_bar")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.sequence([aesuc1, acerr2]).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_bar")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.sequence([aesuc1, aesuc2]).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["foo", "bar"]).should.be.ok;
                    State.equals(
                        state,
                        new State("ghi", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_foo")]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.sequence([aesuc1, aeerr2]).run(
                initState,
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_foo")]
                        )
                    ).should.be.ok;
                }
            );

            [acsuc2, acerr2, aesuc2, aeerr2].forEach(function (a2) {
                lq.monad.sequence([acerr1, a2]).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_foo")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.monad.sequence([aeerr1, a2]).run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_foo")]
                            )
                        ).should.be.ok;
                    }
                );
            });
        });
    });

    describe("sequence_(parsers)", function () {
        it("should run parsers sequentially and discard the results", function () {
            var initState = new State("abc", SourcePos.init("test"), "some");
            
            lq.monad.sequence_([]).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(state, initState).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );

            var acsuc1 = alwaysCSuc(
                "foo",
                new State("def", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_foo")]
                )
            );

            var acerr1 = alwaysCErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_foo")]
                )
            );

            var aesuc1 = alwaysESuc(
                "foo",
                new State("def", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_foo")]
                )
            );

            var aeerr1 = alwaysEErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_foo")]
                )
            );

            var acsuc2 = alwaysCSuc(
                "bar",
                new State("ghi", new SourcePos("test", 3, 4), "none"),
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_bar")]
                )
            );

            var acerr2 = alwaysCErr(
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_bar")]
                )
            );

            var aesuc2 = alwaysESuc(
                "bar",
                new State("ghi", new SourcePos("test", 3, 4), "none"),
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_bar")]
                )
            );

            var aeerr2 = alwaysEErr(
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_bar")]
                )
            );

            lq.monad.sequence_([acsuc1, acsuc2]).run(
                initState,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("ghi", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_bar")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.sequence_([acsuc1, acerr2]).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_bar")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.sequence_([acsuc1, aesuc2]).run(
                initState,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("ghi", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_foo")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.sequence_([acsuc1, aeerr2]).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_foo")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.sequence_([aesuc1, acsuc2]).run(
                initState,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("ghi", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_bar")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.sequence_([aesuc1, acerr2]).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 3, 4),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_bar")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.sequence_([aesuc1, aesuc2]).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("ghi", new SourcePos("test", 3, 4), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_foo")]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.sequence_([aesuc1, aeerr2]).run(
                initState,
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_foo")]
                        )
                    ).should.be.ok;
                }
            );

            [acsuc2, acerr2, aesuc2, aeerr2].forEach(function (a2) {
                lq.monad.sequence_([acerr1, a2]).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_foo")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.monad.sequence_([aeerr1, a2]).run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_foo")]
                            )
                        ).should.be.ok;
                    }
                );
            });
        });
    });

    describe("mapM(func, array)", function () {
        it("should map 'func' to array then run the returned parsers sequentially", function () {
            var f = function (str) {
                switch (str.toLowerCase()) {
                    case "foo":
                        return alwaysCSuc(
                            "csuc_" + str,
                            new State("def", new SourcePos("test", 1, 2), "none"),
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_" + str)]
                            )
                        );
                    case "bar":
                        return alwaysCErr(
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_" + str)]
                            )
                        );
                    case "baz":
                        return alwaysESuc(
                            "esuc_" + str,
                            new State("def", new SourcePos("test", 1, 2), "none"),
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_" + str)]
                            )
                        );
                    default:
                        return alwaysEErr(
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_" + str)]
                            )
                        );
                }
            };

            var initState = new State("abc", SourcePos.init("test"), "some");
            
            lq.monad.mapM(f, []).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    (lq.util.ArrayUtil.equals(value, [])).should.be.ok;
                    State.equals(state, initState).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );

            lq.monad.mapM(f, ["foo", "FOO"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["csuc_foo", "csuc_FOO"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_FOO")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.mapM(f, ["foo", "BAR"]).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_BAR")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.mapM(f, ["foo", "BAZ"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["csuc_foo", "esuc_BAZ"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_foo"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_BAZ")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.mapM(f, ["foo", "NYA"]).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_foo"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_NYA")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.mapM(f, ["baz", "FOO"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["esuc_baz", "csuc_FOO"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_FOO")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.mapM(f, ["baz", "BAR"]).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_BAR")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.mapM(f, ["baz", "BAZ"]).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["esuc_baz", "esuc_BAZ"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_baz"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_BAZ")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.mapM(f, ["baz", "NYA"]).run(
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
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_baz"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_NYA")
                            ]
                        )
                    ).should.be.ok;
                }
            );

            ["FOO", "BAR", "BAZ", "NYA"].forEach(function (a) {
                lq.monad.mapM(f, ["bar", a]).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_bar")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.monad.mapM(f, ["nya", a]).run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_nya")]
                            )
                        ).should.be.ok;
                    }
                );
            });
        });
    });

    describe("mapM_(func, array)", function () {
        it("should map 'func' to array then run the returned parsers sequentially and discard the results", function () {
            var f = function (str) {
                switch (str.toLowerCase()) {
                    case "foo":
                        return alwaysCSuc(
                            "csuc_" + str,
                            new State("def", new SourcePos("test", 1, 2), "none"),
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_" + str)]
                            )
                        );
                    case "bar":
                        return alwaysCErr(
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_" + str)]
                            )
                        );
                    case "baz":
                        return alwaysESuc(
                            "esuc_" + str,
                            new State("def", new SourcePos("test", 1, 2), "none"),
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_" + str)]
                            )
                        );
                    default:
                        return alwaysEErr(
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_" + str)]
                            )
                        );
                }
            };

            var initState = new State("abc", SourcePos.init("test"), "some");
            
            lq.monad.mapM_(f, []).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(state, initState).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );

            lq.monad.mapM_(f, ["foo", "FOO"]).run(
                initState,
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
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_FOO")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.mapM_(f, ["foo", "BAR"]).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_BAR")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.mapM_(f, ["foo", "BAZ"]).run(
                initState,
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
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_foo"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_BAZ")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.mapM_(f, ["foo", "NYA"]).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_foo"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_NYA")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.mapM_(f, ["baz", "FOO"]).run(
                initState,
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
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_FOO")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.mapM_(f, ["baz", "BAR"]).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_BAR")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.mapM_(f, ["baz", "BAZ"]).run(
                initState,
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
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_baz"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_BAZ")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.mapM_(f, ["baz", "NYA"]).run(
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
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_baz"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_NYA")
                            ]
                        )
                    ).should.be.ok;
                }
            );

            ["FOO", "BAR", "BAZ", "NYA"].forEach(function (a) {
                lq.monad.mapM_(f, ["bar", a]).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_bar")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.monad.mapM_(f, ["nya", a]).run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_nya")]
                            )
                        ).should.be.ok;
                    }
                );
            });
        });
    });

    describe("forM(array, func)", function () {
        it("should map 'func' to array then run the returned parsers sequentially", function () {
            var f = function (str) {
                switch (str.toLowerCase()) {
                    case "foo":
                        return alwaysCSuc(
                            "csuc_" + str,
                            new State("def", new SourcePos("test", 1, 2), "none"),
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_" + str)]
                            )
                        );
                    case "bar":
                        return alwaysCErr(
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_" + str)]
                            )
                        );
                    case "baz":
                        return alwaysESuc(
                            "esuc_" + str,
                            new State("def", new SourcePos("test", 1, 2), "none"),
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_" + str)]
                            )
                        );
                    default:
                        return alwaysEErr(
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_" + str)]
                            )
                        );
                }
            };

            var initState = new State("abc", SourcePos.init("test"), "some");
            
            lq.monad.forM([], f).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    (lq.util.ArrayUtil.equals(value, [])).should.be.ok;
                    State.equals(state, initState).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );

            lq.monad.forM(["foo", "FOO"], f).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["csuc_foo", "csuc_FOO"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_FOO")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.forM(["foo", "BAR"], f).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_BAR")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.forM(["foo", "BAZ"], f).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["csuc_foo", "esuc_BAZ"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_foo"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_BAZ")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.forM(["foo", "NYA"], f).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_foo"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_NYA")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.forM(["baz", "FOO"], f).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["esuc_baz", "csuc_FOO"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_FOO")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.forM(["baz", "BAR"], f).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_BAR")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.forM(["baz", "BAZ"], f).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["esuc_baz", "esuc_BAZ"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_baz"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_BAZ")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.forM(["baz", "NYA"], f).run(
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
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_baz"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_NYA")
                            ]
                        )
                    ).should.be.ok;
                }
            );

            ["FOO", "BAR", "BAZ", "NYA"].forEach(function (a) {
                lq.monad.forM(["bar", a], f).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_bar")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.monad.forM(["nya", a], f).run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_nya")]
                            )
                        ).should.be.ok;
                    }
                );
            });
        });
    });

    describe("forM_(array, func)", function () {
        it("should map 'func' to array then run the returned parsers sequentially and discard the results", function () {
            var f = function (str) {
                switch (str.toLowerCase()) {
                    case "foo":
                        return alwaysCSuc(
                            "csuc_" + str,
                            new State("def", new SourcePos("test", 1, 2), "none"),
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_" + str)]
                            )
                        );
                    case "bar":
                        return alwaysCErr(
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_" + str)]
                            )
                        );
                    case "baz":
                        return alwaysESuc(
                            "esuc_" + str,
                            new State("def", new SourcePos("test", 1, 2), "none"),
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_" + str)]
                            )
                        );
                    default:
                        return alwaysEErr(
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_" + str)]
                            )
                        );
                }
            };

            var initState = new State("abc", SourcePos.init("test"), "some");
            
            lq.monad.forM_([], f).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(state, initState).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );

            lq.monad.forM_(["foo", "FOO"], f).run(
                initState,
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
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_FOO")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.forM_(["foo", "BAR"], f).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_BAR")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.forM_(["foo", "BAZ"], f).run(
                initState,
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
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_foo"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_BAZ")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.forM_(["foo", "NYA"], f).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_foo"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_NYA")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.forM_(["baz", "FOO"], f).run(
                initState,
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
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_FOO")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.forM_(["baz", "BAR"], f).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_BAR")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.forM_(["baz", "BAZ"], f).run(
                initState,
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
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_baz"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_BAZ")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.forM_(["baz", "NYA"], f).run(
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
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_baz"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_NYA")
                            ]
                        )
                    ).should.be.ok;
                }
            );

            ["FOO", "BAR", "BAZ", "NYA"].forEach(function (a) {
                lq.monad.forM_(["bar", a], f).run(
                    initState,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr_bar")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                lq.monad.forM_(["nya", a], f).run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr_nya")]
                            )
                        ).should.be.ok;
                    }
                );
            });
        });
    });

    describe("filterM(test, array)", function () {
        it("should filter the array with the function that returns parser", function () {
            var acsuct = alwaysCSuc(
                true,
                new State("def", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_true")]
                )
            );

            var acsucf = alwaysCSuc(
                false,
                new State("def", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_false")]
                )
            );

            var acerr = alwaysCErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                )
            );

            var aesuct = alwaysESuc(
                true,
                new State("def", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_true")]
                )
            );

            var aesucf = alwaysESuc(
                false,
                new State("def", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_false")]
                )
            );

            var aeerr = alwaysEErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                )
            );

            var f = function (str) {
                switch (str) {
                    case "foo": return acsuct;
                    case "FOO": return acsucf;
                    case "bar": return aesuct;
                    case "BAR": return aesucf;
                    case "baz": return acerr;
                    default: return aeerr;
                }
            };

            var initState = new State("abc", SourcePos.init("test"), "some");

            lq.monad.filterM(f, []).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, []).should.be.ok;
                    State.equals(state, initState).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );

            lq.monad.filterM(f, ["foo", "foo"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["foo", "foo"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_true")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.filterM(f, ["foo", "FOO"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["foo"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_false")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.filterM(f, ["foo", "bar"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["foo", "bar"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_true"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_true")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.filterM(f, ["foo", "BAR"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["foo"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_true"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_false")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.filterM(f, ["foo", "baz"]).run(
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

            lq.monad.filterM(f, ["foo", "nya"]).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_true"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.filterM(f, ["FOO", "foo"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["foo"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_true")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.filterM(f, ["FOO", "FOO"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, []).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_false")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.filterM(f, ["FOO", "bar"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["bar"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_false"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_true")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.filterM(f, ["FOO", "BAR"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, []).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_false"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_false")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.filterM(f, ["FOO", "baz"]).run(
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

            lq.monad.filterM(f, ["FOO", "nya"]).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_false"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.filterM(f, ["bar", "foo"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["bar", "foo"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_true")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.filterM(f, ["bar", "FOO"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["bar"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_false")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.filterM(f, ["bar", "bar"]).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["bar", "bar"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_true"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_true")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.filterM(f, ["bar", "BAR"]).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["bar"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_true"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_false")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.filterM(f, ["bar", "baz"]).run(
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

            lq.monad.filterM(f, ["bar", "nya"]).run(
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
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_true"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                }
            );

            lq.monad.filterM(f, ["BAR", "foo"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["foo"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_true")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.filterM(f, ["BAR", "FOO"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, []).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_false")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.filterM(f, ["BAR", "bar"]).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["bar"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_false"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_true")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.filterM(f, ["BAR", "BAR"]).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, []).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_false"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_false")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.filterM(f, ["BAR", "baz"]).run(
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

            lq.monad.filterM(f, ["BAR", "nya"]).run(
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
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_false"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                }
            );

            ["foo", "FOO", "bar", "BAR", "baz", "nya"].forEach(function (e2) {
                lq.monad.filterM(f, ["baz", e2]).run(
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

                lq.monad.filterM(f, ["nya", e2]).run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        ).should.be.ok;
                    }
                );
            });
        });
    });

    describe("zipWithM(func, arrayA, arrayB)", function () {
        it("should zip arrays with function that returns parser", function () {
            var f = function (flag, value) {
                switch (flag) {
                    case "csuc": return alwaysCSuc(
                            value,
                            new State("def", new SourcePos("test", 1, 2), "none"),
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                            )
                        );
                    case "cerr": return alwaysCErr(
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        );
                    case "esuc": return alwaysESuc(
                            value,
                            new State("def", new SourcePos("test", 1, 2), "none"),
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                            )
                        );
                    default: return alwaysEErr(
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        );
                }
            };

            var initState = new State("abc", SourcePos.init("test"), "some");

            lq.monad.zipWithM(f, [], []).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, []).should.be.ok;
                    State.equals(state, initState).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );

            lq.monad.zipWithM(f, ["csuc", "cerr", "esuc", "eerr"], []).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, []).should.be.ok;
                    State.equals(state, initState).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );
            
            lq.monad.zipWithM(f, [], ["foo", "bar", "baz", "nya"]).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, []).should.be.ok;
                    State.equals(state, initState).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );

            lq.monad.zipWithM(f, ["csuc", "csuc"], ["foo", "bar"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["foo", "bar"]).should.be.ok;
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

            lq.monad.zipWithM(f, ["csuc", "cerr"], ["foo", "bar"]).run(
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

            lq.monad.zipWithM(f, ["csuc", "esuc"], ["foo", "bar"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["foo", "bar"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
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

            lq.monad.zipWithM(f, ["csuc", "eerr"], ["foo", "bar"]).run(
                initState,
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

            lq.monad.zipWithM(f, ["esuc", "csuc"], ["foo", "bar"]).run(
                initState,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["foo", "bar"]).should.be.ok;
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

            lq.monad.zipWithM(f, ["esuc", "cerr"], ["foo", "bar"]).run(
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

            lq.monad.zipWithM(f, ["esuc", "esuc"], ["foo", "bar"]).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["foo", "bar"]).should.be.ok;
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.zipWithM(f, ["esuc", "eerr"], ["foo", "bar"]).run(
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
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                }
            );

            ["csuc", "cerr", "esuc", "eerr"].forEach(function (e2) {
                lq.monad.zipWithM(f, ["cerr", e2], ["foo", "bar"]).run(
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

                lq.monad.zipWithM(f, ["eerr", e2], ["foo", "bar"]).run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        ).should.be.ok;
                    }
                );
            });
        });
    });

    describe("zipWithM_(func, arrayA, arrayB", function () {
        it("should zip arrays with function that returns parser and discard the results", function () {
            var f = function (flag, value) {
                switch (flag) {
                    case "csuc": return alwaysCSuc(
                            value,
                            new State("def", new SourcePos("test", 1, 2), "none"),
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                            )
                        );
                    case "cerr": return alwaysCErr(
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        );
                    case "esuc": return alwaysESuc(
                            value,
                            new State("def", new SourcePos("test", 1, 2), "none"),
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                            )
                        );
                    default: return alwaysEErr(
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        );
                }
            };

            var initState = new State("abc", SourcePos.init("test"), "some");

            lq.monad.zipWithM_(f, [], []).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(state, initState).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );

            lq.monad.zipWithM_(f, ["csuc", "cerr", "esuc", "eerr"], []).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(state, initState).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );
            
            lq.monad.zipWithM_(f, [], ["foo", "bar", "baz", "nya"]).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(state, initState).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );

            lq.monad.zipWithM_(f, ["csuc", "csuc"], ["foo", "bar"]).run(
                initState,
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

            lq.monad.zipWithM_(f, ["csuc", "cerr"], ["foo", "bar"]).run(
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

            lq.monad.zipWithM_(f, ["csuc", "esuc"], ["foo", "bar"]).run(
                initState,
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

            lq.monad.zipWithM_(f, ["csuc", "eerr"], ["foo", "bar"]).run(
                initState,
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

            lq.monad.zipWithM_(f, ["esuc", "csuc"], ["foo", "bar"]).run(
                initState,
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

            lq.monad.zipWithM_(f, ["esuc", "cerr"], ["foo", "bar"]).run(
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

            lq.monad.zipWithM_(f, ["esuc", "esuc"], ["foo", "bar"]).run(
                initState,
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
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.zipWithM_(f, ["esuc", "eerr"], ["foo", "bar"]).run(
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
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                }
            );

            ["csuc", "cerr", "esuc", "eerr"].forEach(function (e2) {
                lq.monad.zipWithM_(f, ["cerr", e2], ["foo", "bar"]).run(
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

                lq.monad.zipWithM_(f, ["eerr", e2], ["foo", "bar"]).run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        ).should.be.ok;
                    }
                );
            });
        });
    });

    describe("foldM(func, initialValue, array)", function () {
        it("should fold the array left to right with the function that returns parser", function () {
            var f = function (accum, str) {
                switch (str) {
                    case "foo": return alwaysCSuc(
                            accum + " foo",
                            new State("def", new SourcePos("test", 1, 2), "none"),
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                            )
                        );
                    case "bar": return alwaysCErr(
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        );
                    case "baz": return alwaysESuc(
                            accum + " baz",
                            new State("def", new SourcePos("test", 1, 2), "none"),
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                            )
                        );
                    default: return alwaysEErr(
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        );
                }
            };

            var initState = new State("abc", SourcePos.init("test"), "some");

            lq.monad.foldM(f, "say", []).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("say");
                    State.equals(state, initState).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );

            lq.monad.foldM(f, "say", ["foo", "foo"]).run(
                initState,
                function (value, state, error) {
                    value.should.equal("say foo foo");
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

            lq.monad.foldM(f, "say", ["foo", "bar"]).run(
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

            lq.monad.foldM(f, "say", ["foo", "baz"]).run(
                initState,
                function (value, state, error) {
                    value.should.equal("say foo baz");
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
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

            lq.monad.foldM(f, "say", ["foo", "nya"]).run(
                initState,
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

            lq.monad.foldM(f, "say", ["baz", "foo"]).run(
                initState,
                function (value, state, error) {
                    value.should.equal("say baz foo");
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

            lq.monad.foldM(f, "say", ["baz", "bar"]).run(
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

            lq.monad.foldM(f, "say", ["baz", "baz"]).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("say baz baz");
                    State.equals(
                        state,
                        new State("def", new SourcePos("test", 1, 2), "none")
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.foldM(f, "say", ["baz", "nya"]).run(
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
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                }
            );

            ["foo", "bar", "baz", "nya"].forEach(function (e2) {
                lq.monad.foldM(f, "say", ["bar", e2]).run(
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

                lq.monad.foldM(f, "say", ["nya", e2]).run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        ).should.be.ok;
                    }
                );
            });
        });
    });

    describe("foldM_(func, initialValue, array)", function () {
        it("should fold the array left to right with the function that returns parser and discard the result", function () {
            var f = function (accum, str) {
                switch (str) {
                    case "foo": return alwaysCSuc(
                            accum + " foo",
                            new State("def", new SourcePos("test", 1, 2), "none"),
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                            )
                        );
                    case "bar": return alwaysCErr(
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        );
                    case "baz": return alwaysESuc(
                            accum + " baz",
                            new State("def", new SourcePos("test", 1, 2), "none"),
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                            )
                        );
                    default: return alwaysEErr(
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        );
                }
            };

            var initState = new State("abc", SourcePos.init("test"), "some");

            lq.monad.foldM_(f, "say", []).run(
                initState,
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(state, initState).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );

            lq.monad.foldM_(f, "say", ["foo", "foo"]).run(
                initState,
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

            lq.monad.foldM_(f, "say", ["foo", "bar"]).run(
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

            lq.monad.foldM_(f, "say", ["foo", "baz"]).run(
                initState,
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

            lq.monad.foldM_(f, "say", ["foo", "nya"]).run(
                initState,
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

            lq.monad.foldM_(f, "say", ["baz", "foo"]).run(
                initState,
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

            lq.monad.foldM_(f, "say", ["baz", "bar"]).run(
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

            lq.monad.foldM_(f, "say", ["baz", "baz"]).run(
                initState,
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
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.foldM_(f, "say", ["baz", "nya"]).run(
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
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    ).should.be.ok;
                }
            );

            ["foo", "bar", "baz", "nya"].forEach(function (e2) {
                lq.monad.foldM_(f, "say", ["bar", e2]).run(
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

                lq.monad.foldM_(f, "say", ["nya", e2]).run(
                    initState,
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        ).should.be.ok;
                    }
                );
            });
        });
    });

    describe("replicateM(n, parser)", function () {
        it("should run the parser repeatedly", function () {
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

            lq.monad.replicateM(0, p).run(
                new State("abcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, []).should.be.ok;
                    State.equals(state, new State("abcd", SourcePos.init("test"), "some")).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );

            lq.monad.replicateM(2, p).run(
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

            lq.monad.replicateM(2, p).run(
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

            lq.monad.replicateM(2, p).run(
                new State("acabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["a1", "c2"]).should.be.ok;
                    State.equals(
                        state,
                        new State("cabcd", new SourcePos("test", 1, 2), "none")
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

            lq.monad.replicateM(2, p).run(
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

            lq.monad.replicateM(2, p).run(
                new State("cabcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    lq.util.ArrayUtil.equals(value, ["c1", "c1"]).should.be.ok;
                    State.equals(
                        state,
                        new State("cabcd", new SourcePos("test", 1, 1), "none")
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

            lq.monad.replicateM(2, p).run(
                new State("babcd", SourcePos.init("test"), "some"),
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

            lq.monad.replicateM(2, p).run(
                new State("dabcd", SourcePos.init("test"), "some"),
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

    describe("replicateM_(n, parser)", function () {
        it("should run the parser repeatedly and discard the result", function () {
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

            lq.monad.replicateM_(0, p).run(
                new State("abcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(state, new State("abcd", SourcePos.init("test"), "some")).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );

            lq.monad.replicateM_(2, p).run(
                new State("aaabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    (value === undefined).should.be.ok;
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

            lq.monad.replicateM_(2, p).run(
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

            lq.monad.replicateM_(2, p).run(
                new State("acabcd", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("cabcd", new SourcePos("test", 1, 2), "none")
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

            lq.monad.replicateM_(2, p).run(
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

            lq.monad.replicateM_(2, p).run(
                new State("cabcd", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State("cabcd", new SourcePos("test", 1, 1), "none")
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

            lq.monad.replicateM_(2, p).run(
                new State("babcd", SourcePos.init("test"), "some"),
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

            lq.monad.replicateM_(2, p).run(
                new State("dabcd", SourcePos.init("test"), "some"),
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

    describe("guard(flag)", function () {
        it("should return a parser that always succeeds with 'undefined' when 'flag' is true", function () {
            lq.monad.guard(true).run(
                new State("abc", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(state, new State("abc", SourcePos.init("test"), "some")).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                },
                throwError
            );
        });

        it("should retrun 'mzero' when 'flag' is false", function () {
            lq.monad.guard(false).run(
                new State("abc", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                }
            );
        });
    });

    describe("msum(parsers)", function () {
        it("should concatenate the parsers with 'mplus'", function () {
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

            lq.monad.msum([]).run(
                initState,
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(error, ParseError.unknown(SourcePos.init("test"))).should.be.ok;
                }
            );

            [acsuc, acerr, aesuc, aeerr].forEach(function (a2) {
                lq.monad.msum([acsuc, a2]).run(
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

                lq.monad.msum([acerr, a2]).run(
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

                lq.monad.msum([aesuc, a2]).run(
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

            lq.monad.msum([aeerr, acsuc]).run(
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

            lq.monad.msum([aeerr, acerr]).run(
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

            lq.monad.msum([aeerr, aesuc]).run(
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

            lq.monad.msum([aeerr, aeerr]).run(
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

    describe("mfilter(test, parser)", function () {
        it("should filter the result of the parser with the function 'test'", function () {
            var f = function (str) {
                return str === "foo";
            };

            var acsucf = alwaysCSuc(
                "foo",
                new State("def", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_foo")]
                )
            );

            var acsucb = alwaysCSuc(
                "bar",
                new State("def", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_bar")]
                )
            );

            var acerr = alwaysCErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                )
            );

            var aesucf = alwaysESuc(
                "foo",
                new State("def", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_foo")]
                )
            );

            var aesucb = alwaysESuc(
                "bar",
                new State("def", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_bar")]
                )
            );

            var aeerr = alwaysEErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                )
            );

            var initState = new State("abc", SourcePos.init("test"), "some");

            lq.monad.mfilter(f, acsucf).run(
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
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_foo")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.monad.mfilter(f, acsucb).run(
                initState,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc_bar")]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.monad.mfilter(f, acerr).run(
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

            lq.monad.mfilter(f, aesucf).run(
                initState,
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
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_foo")]
                        )
                    ).should.be.ok;
                },
                throwError
            );

            lq.monad.mfilter(f, aesucb).run(
                initState,
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc_bar")]
                        )
                    ).should.be.ok;
                }
            );

            lq.monad.mfilter(f, aeerr).run(
                initState,
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    ).should.be.ok;
                }
            );
        });
    });
});
