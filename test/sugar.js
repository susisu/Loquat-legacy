/*
 * Loquat.test / string.js
 * copyright (c) 2014 Susisu
 */

var chai   = require("chai"),
    expect = chai.expect;

var lq = Object.freeze({
    "error": require("../lib/error"),
    "pos"  : require("../lib/pos"),
    "prim" : require("../lib/prim"),
    "sugar": require("../lib/sugar"),
    "util" : require("../lib/util")
});


describe("sugar", function () {
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

    describe("Parser, LazyParser", function () {
        describe("#notFollowedBy(parser)", function () {
            it("should create a new parser that parses what the original parser accepts only when not followed by 'parser'", function () {
                var p = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                    switch (state.input.charAt(0)) {
                        case "a": return csuc(
                                "a" + state.position.column.toString(),
                                new State(
                                    state.input.substr(1),
                                    state.position.setColumn(state.position.column + 1),
                                    state.tabWidth,
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
                                    state.tabWidth,
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

                var end = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                    switch (state.input.charAt(0)) {
                        case ".": return csuc(
                                ".",
                                new State(
                                    state.input.substr(1),
                                    state.position.setColumn(state.position.column + 1),
                                    state.tabWidth,
                                    "none"
                                ),
                                new ParseError(
                                    state.position.setColumn(state.position.column + 1),
                                    [new ErrorMessage(ErrorMessageType.MESSAGE, "end_csuc")]
                                )
                            );
                        case ",": return cerr(
                                new ParseError(
                                    state.position.setColumn(state.position.column + 1),
                                    [new ErrorMessage(ErrorMessageType.MESSAGE, "end_cerr")]
                                )
                            );
                        case ":": return esuc(
                                ":",
                                new State(
                                    state.input.substr(1),
                                    state.position,
                                    state.tabWidth,
                                    "none"
                                ),
                                new ParseError(
                                    state.position,
                                    [new ErrorMessage(ErrorMessageType.MESSAGE, "end_esuc")]
                                )
                            );
                        default: return eerr(
                                new ParseError(
                                    state.position,
                                    [new ErrorMessage(ErrorMessageType.MESSAGE, "end_eerr")]
                                )
                            );
                    }
                });

                p.notFollowedBy(end).run(
                    new State("a.abcd", SourcePos.init("test"), 8, "some"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "end_csuc"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show("."))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                p.notFollowedBy(end).run(
                    new State("a,abcd", SourcePos.init("test"), 8, "some"),
                    function (value, state, error) {
                        expect(value).to.equal("a1");
                        expect(State.equals(
                            state,
                            new State(",abcd", new SourcePos("test", 1, 2), 8, "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "end_cerr")]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                p.notFollowedBy(end).run(
                    new State("a:abcd", SourcePos.init("test"), 8, "some"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "end_esuc"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show(":"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                p.notFollowedBy(end).run(
                    new State("a;abcd", SourcePos.init("test"), 8, "some"),
                    function (value, state, error) {
                        expect(value).to.equal("a1");
                        expect(State.equals(
                            state,
                            new State(";abcd", new SourcePos("test", 1, 2), 8, "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "end_eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                [".", ",", ":", ";"].forEach(function (endChar) {
                    p.notFollowedBy(end).run(
                        new State("b" + endChar + "abcd", SourcePos.init("test"), 8, "some"),
                        throwError,
                        throwError,
                        throwError,
                        function (error) {
                            expect(ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                                )
                            )).to.be.true;
                        }
                    );
                });

                p.notFollowedBy(end).run(
                    new State("c.abcd", SourcePos.init("test"), 8, "some"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "end_csuc"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show("."))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                p.notFollowedBy(end).run(
                    new State("c,abcd", SourcePos.init("test"), 8, "some"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.equal("c1");
                        expect(State.equals(
                            state,
                            new State(",abcd", new SourcePos("test", 1, 1), 8, "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "end_cerr")]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                p.notFollowedBy(end).run(
                    new State("c:abcd", SourcePos.init("test"), 8, "some"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "end_esuc"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show(":"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                p.notFollowedBy(end).run(
                    new State("c;abcd", SourcePos.init("test"), 8, "some"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.equal("c1");
                        expect(State.equals(
                            state,
                            new State(";abcd", new SourcePos("test", 1, 1), 8, "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "end_eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                [".", ",", ":", ";"].forEach(function (endChar) {
                    p.notFollowedBy(end).run(
                        new State("d" + endChar + "abcd", SourcePos.init("test"), 8, "some"),
                        throwError,
                        throwError,
                        throwError,
                        function (error) {
                            expect(ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 1),
                                    [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                                )
                            )).to.be.true;
                        }
                    );
                });
            });
        });
    });

    describe("gen(generator)", function () {
        var p = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
            switch (state.input.charAt(0)) {
                case "a": return csuc(
                        "a" + state.position.column.toString(),
                        new State(
                            state.input.substr(1),
                            state.position.setColumn(state.position.column + 1),
                            state.tabWidth,
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
                            state.tabWidth,
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
        it("should run sequentially parsers yielded by the generator and return the value when the generator is done", function () {
            var parser = lq.sugar.gen(function * () {
                var x = yield p;
                var y = yield p;
                return x + y;
            });

            parser.run(
                new State("aaabcd", SourcePos.init("test"), 8, "some"),
                function (value, state, error) {
                    expect(value).to.equal("a1a2");
                    expect(State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 3), 8, "none")
                    )).to.be.true;
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                        )
                    )).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            parser.run(
                new State("ababcd", SourcePos.init("test"), 8, "some"),
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 3),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    )).to.be.true;
                },
                throwError,
                throwError
            );

            parser.run(
                new State("acabcd", SourcePos.init("test"), 8, "some"),
                function (value, state, error) {
                    expect(value).to.equal("a1c2");
                    expect(State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 2), 8, "none")
                    )).to.be.true;
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")
                            ]
                        )
                    )).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            parser.run(
                new State("adabcd", SourcePos.init("test"), 8, "some"),
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    )).to.be.true;
                },
                throwError,
                throwError
            );

            parser.run(
                new State("baabcd", SourcePos.init("test"), 8, "some"),
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    )).to.be.true;
                },
                throwError,
                throwError
            );

            parser.run(
                new State("caabcd", SourcePos.init("test"), 8, "some"),
                function (value, state, error) {
                    expect(value).to.equal("c1a1");
                    expect(State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 2), 8, "none")
                    )).to.be.true;
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                        )
                    )).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            parser.run(
                new State("cbabcd", SourcePos.init("test"), 8, "some"),
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                        )
                    )).to.be.true;
                },
                throwError,
                throwError
            );

            parser.run(
                new State("ccabcd", SourcePos.init("test"), 8, "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal("c1c1");
                    expect(State.equals(
                        state,
                        new State("abcd", new SourcePos("test", 1, 1), 8, "none")
                    )).to.be.true;
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")
                            ]
                        )
                    )).to.be.true;
                },
                throwError
            );

            parser.run(
                new State("cdabcd", SourcePos.init("test"), 8, "some"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                            ]
                        )
                    )).to.be.true;
                }
            );

            parser.run(
                new State("daabcd", SourcePos.init("test"), 8, "some"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                        )
                    )).to.be.true;
                }
            );
        });

        it("should fail when a error message is thrown from the generator", function () {
            var parserA = lq.sugar.gen(function * () {
                yield p;
                throw "test message";
            });

            parserA.run(
                new State("aabcd", SourcePos.init("test"), 8, "some"),
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 2),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "test message")
                            ]
                        )
                    )).to.be.true;
                },
                throwError,
                throwError
            );

            parserA.run(
                new State("cabcd", SourcePos.init("test"), 8, "some"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                new ErrorMessage(ErrorMessageType.MESSAGE, "test message")
                            ]
                        )
                    )).to.be.true;
                }
            );

            var parserB = lq.sugar.gen(function * () {
                throw "test message";
            });

            parserB.run(
                new State("abcd", SourcePos.init("test"), 8, "some"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "test message")]
                        )
                    )).to.be.true;
                }
            );
        });
    });
});
