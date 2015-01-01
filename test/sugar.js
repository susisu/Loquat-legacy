/*
 * Loquat.test / string.js
 * copyright (c) 2014 Susisu
 */

var chai   = require("chai"),
    should = chai.should();

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

                var end = new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                    switch (state.input.charAt(0)) {
                        case ".": return csuc(
                                ".",
                                new State(
                                    state.input.substr(1),
                                    state.position.setColumn(state.position.column + 1),
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
                    new State("a.abcd", SourcePos.init("test"), "some"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "end_csuc"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show("."))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                p.notFollowedBy(end).run(
                    new State("a,abcd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("a1");
                        State.equals(
                            state,
                            new State(",abcd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "end_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                p.notFollowedBy(end).run(
                    new State("a:abcd", SourcePos.init("test"), "some"),
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
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "end_esuc"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show(":"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                p.notFollowedBy(end).run(
                    new State("a;abcd", SourcePos.init("test"), "some"),
                    function (value, state, error) {
                        value.should.equal("a1");
                        State.equals(
                            state,
                            new State(";abcd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "end_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                [".", ",", ":", ";"].forEach(function (endChar) {
                    p.notFollowedBy(end).run(
                        new State("b" + endChar + "abcd", SourcePos.init("test"), "some"),
                        throwError,
                        throwError,
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                                )
                            ).should.be.ok;
                        }
                    );
                });

                p.notFollowedBy(end).run(
                    new State("c.abcd", SourcePos.init("test"), "some"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "end_csuc"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show("."))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                p.notFollowedBy(end).run(
                    new State("c,abcd", SourcePos.init("test"), "some"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        value.should.equal("c1");
                        State.equals(
                            state,
                            new State(",abcd", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "end_cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );

                p.notFollowedBy(end).run(
                    new State("c:abcd", SourcePos.init("test"), "some"),
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
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "end_esuc"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show(":"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                p.notFollowedBy(end).run(
                    new State("c;abcd", SourcePos.init("test"), "some"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        value.should.equal("c1");
                        State.equals(
                            state,
                            new State(";abcd", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "end_eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );

                [".", ",", ":", ";"].forEach(function (endChar) {
                    p.notFollowedBy(end).run(
                        new State("d" + endChar + "abcd", SourcePos.init("test"), "some"),
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
