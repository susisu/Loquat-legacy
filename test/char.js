/*
 * Loquat.test / char.js
 * copyright (c) 2014 Susisu
 */

var should = require("should");

var lq = Object.freeze({
    "array" : require("../lib/array"),
    "char"  : require("../lib/char"),
    "error" : require("../lib/error"),
    "pos"   : require("../lib/pos"),
    "prim"  : require("../lib/prim"),
    "string": require("../lib/string"),
    "util"  : require("../lib/util")
});


describe("char", function () {
    var SourcePos = lq.pos.SourcePos;
    var ParseError = lq.error.ParseError;
    var ErrorMessage = lq.error.ErrorMessage;
    var ErrorMessageType = lq.error.ErrorMessageType;
    var State = lq.prim.State;

    function throwError () {
        throw new Error("unexpected call of result function");
    }

    describe("string(str)", function () {
        it("should return a parser that parses specified string", function () {
            lq.char.string("abc").run(
                new State(
                    "abcd",
                    SourcePos.init("test"),
                    "none"
                ),
                function (value, state, error) {
                    value.should.equal("abc");
                    State.equals(
                        state,
                        new State(
                            "d",
                            new SourcePos("test", 1, 4),
                            "none"
                        )
                    ).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 4))).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.char.string("abc").run(
                new State(
                    "ab",
                    SourcePos.init("test"),
                    "none"
                ),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("abc"))
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.char.string("abc").run(
                new State(
                    "abd",
                    SourcePos.init("test"),
                    "none"
                ),
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("abc"))
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError
            );

            lq.char.string("abc").run(
                new State(
                    "",
                    SourcePos.init("test"),
                    "none"
                ),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("abc"))
                            ]
                        )
                    ).should.be.ok;
                }
            );

            lq.char.string("abc").run(
                new State(
                    "def",
                    SourcePos.init("test"),
                    "none"
                ),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("abc"))
                            ]
                        )
                    ).should.be.ok;
                }
            );

            lq.char.string("").run(
                new State(
                    "abc",
                    SourcePos.init("test"),
                    "none"
                ),
                throwError,
                throwError,
                function (value, state, error) {
                    value.should.equal("");
                    State.equals(
                        state,
                        new State(
                            "abc",
                            new SourcePos("test", 1, 1),
                            "none"
                        )
                    ).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 1))).should.be.ok;
                },
                throwError
            );
        });
    });

    describe("satisfy(test)", function () {
        it("should return a parser that parses a character evaluated as true by 'test'", function () {
            lq.char.satisfy(function (char) { return char === "a"; }).run(
                new State("abc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    value.should.equal("a");
                    State.equals(
                        state,
                        new State(
                            "bc",
                            new SourcePos("test", 1, 2),
                            "none"
                        )
                    ).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2))).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.char.satisfy(function (char) { return char === "a"; }).run(
                new State("bcd", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b"))]
                        )
                    ).should.be.ok;
                }
            );

            lq.char.satisfy(function (char) { return char === "a"; }).run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "")]
                        )
                    ).should.be.ok;
                }
            );
        });
    });

    describe("oneOf(str)", function () {
        it("should return a parser that parses one character of 'str'", function () {
            lq.char.oneOf("xyz").run(
                new State("xabc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    value.should.equal("x");
                    State.equals(
                        state,
                        new State(
                            "abc",
                            new SourcePos("test", 1, 2),
                            "none"
                        )
                    ).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2))).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.char.oneOf("xyz").run(
                new State("yabc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    value.should.equal("y");
                    State.equals(
                        state,
                        new State(
                            "abc",
                            new SourcePos("test", 1, 2),
                            "none"
                        )
                    ).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2))).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.char.oneOf("xyz").run(
                new State("zabc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    value.should.equal("z");
                    State.equals(
                        state,
                        new State(
                            "abc",
                            new SourcePos("test", 1, 2),
                            "none"
                        )
                    ).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2))).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.char.oneOf("xyz").run(
                new State("abc", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a"))]
                        )
                    ).should.be.ok;
                }
            );

            lq.char.oneOf("xyz").run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "")]
                        )
                    ).should.be.ok;
                }
            );

            lq.char.oneOf("").run(
                new State("abc", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a"))]
                        )
                    ).should.be.ok;
                }
            );
        });
    });

    describe("noneOf(str)", function () {
        it("should return a parser that parses one character except characters in 'str'", function () {
            lq.char.noneOf("xyz").run(
                new State("abc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    value.should.equal("a");
                    State.equals(
                        state,
                        new State(
                            "bc",
                            new SourcePos("test", 1, 2),
                            "none"
                        )
                    ).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2))).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.char.noneOf("xyz").run(
                new State("xabc", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("x"))]
                        )
                    ).should.be.ok;
                }
            );

            lq.char.noneOf("xyz").run(
                new State("yabc", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("y"))]
                        )
                    ).should.be.ok;
                }
            );

            lq.char.noneOf("xyz").run(
                new State("zabc", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("z"))]
                        )
                    ).should.be.ok;
                }
            );

            lq.char.noneOf("xyz").run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "")]
                        )
                    ).should.be.ok;
                }
            );

            lq.char.noneOf("").run(
                new State("abc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    value.should.equal("a");
                    State.equals(
                        state,
                        new State(
                            "bc",
                            new SourcePos("test", 1, 2),
                            "none"
                        )
                    ).should.be.ok;
                    ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2))).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );
        });
    });

    describe("space", function () {
        it("should parse one of space characters", function () {
            " \t\n\r\f\v".split("").forEach(function (spaceChar) {
                lq.char.space.run(
                    new State(spaceChar + "abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(spaceChar);
                        State.equals(
                            state,
                            new State(
                                "abc",
                                SourcePos.init("test").addChar(spaceChar),
                                "none"
                            )
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            ParseError.unknown(SourcePos.init("test").addChar(spaceChar))
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            "0Aa!".split("").forEach(function (nonSpaceChar) {
                lq.char.space.run(
                    new State(nonSpaceChar + "abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(nonSpaceChar)),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "space")
                                ]
                            )
                        ).should.be.ok;
                    }
                );
            });

            lq.char.space.run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, "space")
                            ]
                        )
                    ).should.be.ok;
                }
            );
        });
    });

    describe("spaces", function () {
        it("should skip many space characters", function () {
            lq.char.spaces.run(
                new State(" \t\n\r\f\vabc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State(
                            "abc",
                            SourcePos.init("test").addString(" \t\n\r\f\v"),
                            "none"
                        )
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            SourcePos.init("test").addString(" \t\n\r\f\v"),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                new ErrorMessage(ErrorMessageType.EXPECT, "space")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError,
                throwError,
                throwError
            );

            lq.char.spaces.run(
                new State("abc", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                    (value === undefined).should.be.ok;
                    State.equals(
                        state,
                        new State(
                            "abc",
                            SourcePos.init("test"),
                            "none"
                        )
                    ).should.be.ok;
                    ParseError.equals(
                        error,
                        new ParseError(
                            SourcePos.init("test"),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                new ErrorMessage(ErrorMessageType.EXPECT, "white space")
                            ]
                        )
                    ).should.be.ok;
                },
                throwError
            );
        });
    });

    describe("newline", function () {

    });

    describe("tab", function () {

    });

    describe("upper", function () {

    });

    describe("lower", function () {

    });

    describe("alphaNum", function () {

    });

    describe("letter", function () {

    });

    describe("digit", function () {

    });

    describe("hexDigit", function () {

    });

    describe("octDigit", function () {

    });

    describe("char(expectedChar)", function () {

    });

    describe("anyChar", function () {

    });
});
