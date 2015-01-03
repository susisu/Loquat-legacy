/*
 * Loquat.test / char.js
 * copyright (c) 2014 Susisu
 */

var chai   = require("chai"),
    expect = chai.expect;

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
                    expect(value).to.equal("abc");
                    expect(State.equals(
                        state,
                        new State(
                            "d",
                            new SourcePos("test", 1, 4),
                            "none"
                        )
                    )).to.be.true;
                    expect(ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 4)))).to.be.true;
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
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("abc"))
                            ]
                        )
                    )).to.be.true;
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
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("abc"))
                            ]
                        )
                    )).to.be.true;
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
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("abc"))
                            ]
                        )
                    )).to.be.true;
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
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("abc"))
                            ]
                        )
                    )).to.be.true;
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
                    expect(value).to.equal("");
                    expect(State.equals(
                        state,
                        new State(
                            "abc",
                            new SourcePos("test", 1, 1),
                            "none"
                        )
                    )).to.be.true;
                    expect(ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 1)))).to.be.true;
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
                    expect(value).to.equal("a");
                    expect(State.equals(
                        state,
                        new State(
                            "bc",
                            new SourcePos("test", 1, 2),
                            "none"
                        )
                    )).to.be.true;
                    expect(ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2)))).to.be.true;
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
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b"))]
                        )
                    )).to.be.true;
                }
            );

            lq.char.satisfy(function (char) { return char === "a"; }).run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "")]
                        )
                    )).to.be.true;
                }
            );
        });
    });

    describe("oneOf(str)", function () {
        it("should return a parser that parses one character of 'str'", function () {
            lq.char.oneOf("xyz").run(
                new State("xabc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    expect(value).to.equal("x");
                    expect(State.equals(
                        state,
                        new State(
                            "abc",
                            new SourcePos("test", 1, 2),
                            "none"
                        )
                    )).to.be.true;
                    expect(ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2)))).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.char.oneOf("xyz").run(
                new State("yabc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    expect(value).to.equal("y");
                    expect(State.equals(
                        state,
                        new State(
                            "abc",
                            new SourcePos("test", 1, 2),
                            "none"
                        )
                    )).to.be.true;
                    expect(ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2)))).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.char.oneOf("xyz").run(
                new State("zabc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    expect(value).to.equal("z");
                    expect(State.equals(
                        state,
                        new State(
                            "abc",
                            new SourcePos("test", 1, 2),
                            "none"
                        )
                    )).to.be.true;
                    expect(ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2)))).to.be.true;
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
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a"))]
                        )
                    )).to.be.true;
                }
            );

            lq.char.oneOf("xyz").run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "")]
                        )
                    )).to.be.true;
                }
            );

            lq.char.oneOf("").run(
                new State("abc", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a"))]
                        )
                    )).to.be.true;
                }
            );
        });
    });

    describe("noneOf(str)", function () {
        it("should return a parser that parses one character except characters in 'str'", function () {
            lq.char.noneOf("xyz").run(
                new State("abc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    expect(value).to.equal("a");
                    expect(State.equals(
                        state,
                        new State(
                            "bc",
                            new SourcePos("test", 1, 2),
                            "none"
                        )
                    )).to.be.true;
                    expect(ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2)))).to.be.true;
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
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("x"))]
                        )
                    )).to.be.true;
                }
            );

            lq.char.noneOf("xyz").run(
                new State("yabc", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("y"))]
                        )
                    )).to.be.true;
                }
            );

            lq.char.noneOf("xyz").run(
                new State("zabc", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("z"))]
                        )
                    )).to.be.true;
                }
            );

            lq.char.noneOf("xyz").run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "")]
                        )
                    )).to.be.true;
                }
            );

            lq.char.noneOf("").run(
                new State("abc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    expect(value).to.equal("a");
                    expect(State.equals(
                        state,
                        new State(
                            "bc",
                            new SourcePos("test", 1, 2),
                            "none"
                        )
                    )).to.be.true;
                    expect(ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2)))).to.be.true;
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
                        expect(value).to.equal(spaceChar);
                        expect(State.equals(
                            state,
                            new State(
                                "abc",
                                SourcePos.init("test").addChar(spaceChar),
                                "none"
                            )
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            ParseError.unknown(SourcePos.init("test").addChar(spaceChar))
                        )).to.be.true;
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
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(nonSpaceChar)),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "space")
                                ]
                            )
                        )).to.be.true;
                    }
                );
            });

            lq.char.space.run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, "space")
                            ]
                        )
                    )).to.be.true;
                }
            );
        });
    });

    describe("spaces", function () {
        it("should skip many space characters", function () {
            lq.char.spaces.run(
                new State(" \t\n\r\f\vabc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    expect(value).to.be.undefined;
                    expect(State.equals(
                        state,
                        new State(
                            "abc",
                            SourcePos.init("test").addString(" \t\n\r\f\v"),
                            "none"
                        )
                    )).to.be.true;
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            SourcePos.init("test").addString(" \t\n\r\f\v"),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                new ErrorMessage(ErrorMessageType.EXPECT, "space")
                            ]
                        )
                    )).to.be.true;
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
                    expect(value).to.be.undefined;
                    expect(State.equals(
                        state,
                        new State(
                            "abc",
                            SourcePos.init("test"),
                            "none"
                        )
                    )).to.be.true;
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            SourcePos.init("test"),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                new ErrorMessage(ErrorMessageType.EXPECT, "white space")
                            ]
                        )
                    )).to.be.true;
                },
                throwError
            );
        });
    });

    describe("newline", function () {
        it("should parse a new line character (\\n)", function () {
            lq.char.newline.run(
                new State("\nabc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    expect(value).to.equal("\n");
                    expect(State.equals(
                        state,
                        new State(
                            "abc",
                            new SourcePos("test", 2, 1),
                            "none"
                        )
                    )).to.be.true;
                    expect(ParseError.equals(
                        error,
                        ParseError.unknown(new SourcePos("test", 2, 1))
                    )).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            " 0Aa!".split("").forEach(function (dummyChar) {
                lq.char.newline.run(
                    new State(dummyChar + "abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(dummyChar)),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "new-line")
                                ]
                            )
                        )).to.be.true;
                    }
                );
            });

            lq.char.newline.run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, "new-line")
                            ]
                        )
                    )).to.be.true;
                }
            );
        });
    });

    describe("tab", function () {
        it("should parse a tab character (\\t)", function () {
            lq.char.tab.run(
                new State("\tabc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    expect(value).to.equal("\t");
                    expect(State.equals(
                        state,
                        new State(
                            "abc",
                            new SourcePos("test", 1, 9),
                            "none"
                        )
                    )).to.be.true;
                    expect(ParseError.equals(
                        error,
                        ParseError.unknown(new SourcePos("test", 1, 9))
                    )).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            " 0Aa!".split("").forEach(function (dummyChar) {
                lq.char.tab.run(
                    new State(dummyChar + "abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(dummyChar)),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "tab")
                                ]
                            )
                        )).to.be.true;
                    }
                );
            });

            lq.char.tab.run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, "tab")
                            ]
                        )
                    )).to.be.true;
                }
            );
        });
    });

    describe("upper", function () {
        it("should parse an uppercase character (A-Z)", function () {
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(function (uppercaseChar) {
                lq.char.upper.run(
                    new State(uppercaseChar + "abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(uppercaseChar);
                        expect(State.equals(
                            state,
                            new State(
                                "abc",
                                new SourcePos("test", 1, 2),
                                "none"
                            )
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 1, 2))
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            " 0a!".split("").forEach(function (nonUppercaseChar) {
                lq.char.upper.run(
                    new State(nonUppercaseChar + "abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(nonUppercaseChar)),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "uppercase letter")
                                ]
                            )
                        )).to.be.true;
                    }
                );
            });

            lq.char.upper.run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, "uppercase letter")
                            ]
                        )
                    )).to.be.true;
                }
            );
        });
    });

    describe("lower", function () {
        it("should parse a lowercase character (a-z)", function () {
            "abcdefghijklmnopqrstuvwxyz".split("").forEach(function (lowercaseChar) {
                lq.char.lower.run(
                    new State(lowercaseChar + "abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(lowercaseChar);
                        expect(State.equals(
                            state,
                            new State(
                                "abc",
                                new SourcePos("test", 1, 2),
                                "none"
                            )
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 1, 2))
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            " 0A!".split("").forEach(function (nonLowercaseChar) {
                lq.char.lower.run(
                    new State(nonLowercaseChar + "abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(nonLowercaseChar)),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "lowercase letter")
                                ]
                            )
                        )).to.be.true;
                    }
                );
            });

            lq.char.lower.run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, "lowercase letter")
                            ]
                        )
                    )).to.be.true;
                }
            );
        });
    });

    describe("alphaNum", function () {
        it("should parse an alphabet or a digit (A-Z, a-z or 0-9)", function () {
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("").forEach(function (alphaNumChar) {
                lq.char.alphaNum.run(
                    new State(alphaNumChar + "abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(alphaNumChar);
                        expect(State.equals(
                            state,
                            new State(
                                "abc",
                                new SourcePos("test", 1, 2),
                                "none"
                            )
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 1, 2))
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            " !".split("").forEach(function (nonAlphaNumChar) {
                lq.char.alphaNum.run(
                    new State(nonAlphaNumChar + "abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(nonAlphaNumChar)),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit")
                                ]
                            )
                        )).to.be.true;
                    }
                );
            });

            lq.char.alphaNum.run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit")
                            ]
                        )
                    )).to.be.true;
                }
            );
        });
    });

    describe("letter", function () {
        it("should parse an alphabet (A-Z or a-z)", function () {
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("").forEach(function (letterChar) {
                lq.char.letter.run(
                    new State(letterChar + "abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(letterChar);
                        expect(State.equals(
                            state,
                            new State(
                                "abc",
                                new SourcePos("test", 1, 2),
                                "none"
                            )
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 1, 2))
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            " 0!".split("").forEach(function (nonLetterChar) {
                lq.char.letter.run(
                    new State(nonLetterChar + "abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(nonLetterChar)),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    }
                );
            });

            lq.char.letter.run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                            ]
                        )
                    )).to.be.true;
                }
            );
        });
    });

    describe("digit", function () {
        it("should parse a digit (0-9)", function () {
            "0123456789".split("").forEach(function (digitChar) {
                lq.char.digit.run(
                    new State(digitChar + "abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(digitChar);
                        expect(State.equals(
                            state,
                            new State(
                                "abc",
                                new SourcePos("test", 1, 2),
                                "none"
                            )
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 1, 2))
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            " Aa!".split("").forEach(function (nonDigitChar) {
                lq.char.digit.run(
                    new State(nonDigitChar + "abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(nonDigitChar)),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit")
                                ]
                            )
                        )).to.be.true;
                    }
                );
            });

            lq.char.digit.run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, "digit")
                            ]
                        )
                    )).to.be.true;
                }
            );
        });
    });

    describe("hexDigit", function () {
        it("should parse a hexadecimal digit (0-9 or A-Z (a-z))", function () {
            "0123456789ABCDEFabcdef".split("").forEach(function (digitChar) {
                lq.char.hexDigit.run(
                    new State(digitChar + "abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(digitChar);
                        expect(State.equals(
                            state,
                            new State(
                                "abc",
                                new SourcePos("test", 1, 2),
                                "none"
                            )
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 1, 2))
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            " Gg!".split("").forEach(function (nonDigitChar) {
                lq.char.hexDigit.run(
                    new State(nonDigitChar + "abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(nonDigitChar)),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit")
                                ]
                            )
                        )).to.be.true;
                    }
                );
            });

            lq.char.hexDigit.run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit")
                            ]
                        )
                    )).to.be.true;
                }
            );
        });
    });

    describe("octDigit", function () {
        it("should parse a octal digit (0-7)", function () {
            "01234567".split("").forEach(function (digitChar) {
                lq.char.octDigit.run(
                    new State(digitChar + "abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(digitChar);
                        expect(State.equals(
                            state,
                            new State(
                                "abc",
                                new SourcePos("test", 1, 2),
                                "none"
                            )
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 1, 2))
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            " 89Aa!".split("").forEach(function (nonDigitChar) {
                lq.char.octDigit.run(
                    new State(nonDigitChar + "abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(nonDigitChar)),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit")
                                ]
                            )
                        )).to.be.true;
                    }
                );
            });

            lq.char.octDigit.run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, "octal digit")
                            ]
                        )
                    )).to.be.true;
                }
            );
        });
    });

    describe("char(expectedChar)", function () {
        it("should return a parser that parses specified character", function () {
            lq.char.char("a").run(
                new State("abc", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    expect(value).to.equal("a");
                    expect(State.equals(
                        state,
                        new State(
                            "bc",
                            new SourcePos("test", 1, 2),
                            "none"
                        )
                    )).to.be.true;
                    expect(ParseError.equals(
                        error,
                        ParseError.unknown(new SourcePos("test", 1, 2))
                    )).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.char.char("d").run(
                new State("abc", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("d"))
                            ]
                        )
                    )).to.be.true;
                }
            );

            lq.char.char("a").run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("a"))
                            ]
                        )
                    )).to.be.true;
                }
            );
        });
    });

    describe("anyChar", function () {
        it("should parse any single character", function () {
            " 0Aa!".split("").forEach(function (char) {
                lq.char.anyChar.run(
                    new State(char + "abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(char);
                        expect(State.equals(
                            state,
                            new State(
                                "abc",
                                SourcePos.init("test").addChar(char),
                                "none"
                            )
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            ParseError.unknown(SourcePos.init("test").addChar(char))
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });

            lq.char.anyChar.run(
                new State("", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "")]
                        )
                    )).to.be.true;
                }
            );
        });
    });

    describe("manyChar(parser)", function () {
        it("should return a parser that parses zero or more occurrence of characters parsed by 'parser' and accumulates them in a string", function () {
            lq.char.manyChar(lq.char.char("a")).run(
                new State("aaab", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    expect(value).to.equal("aaa");
                    expect(State.equals(state, new State("b", new SourcePos("test", 1, 4), "none"))).to.be.true;
                    expect(ParseError.equals(
                        error,
                         new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("a"))
                            ]
                        )
                    )).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.char.manyChar(
                new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                    return lq.char.char("a").run(state, csuc, cerr, esuc, cerr);
                })
            ).run(
                new State("aaab", SourcePos.init("test"), "none"),
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("a"))
                            ]
                        )
                    )).to.be.true;
                },
                throwError,
                throwError
            );

            lq.char.manyChar(
                new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                    return lq.char.char("c").run(state, csuc, cerr, esuc, cerr);
                })
            ).run(
                new State("aaab", SourcePos.init("test"), "none"),
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("c"))
                            ]
                        )
                    )).to.be.true;
                },
                throwError,
                throwError
            );

            lq.char.manyChar(lq.char.char("c")).run(
                new State("aaab", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                   expect(value).to.equal("");
                    expect(State.equals(state, new State("aaab", SourcePos.init("test"), "none"))).to.be.true;
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("c"))
                            ]
                        )
                    )).to.be.true;
                },
                throwError
            );

            expect(function () {
                lq.char.manyChar(
                    lq.prim.mplus(
                        lq.char.char("a"),
                        new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                            return lq.char.char("b").run(state, esuc, cerr, esuc, eerr);
                        })
                    )
                ).run(
                    new State("aaab", SourcePos.init("test"), "none"),
                    function () {},
                    function () {},
                    function () {},
                    function () {}
                );
            }).to.throw(Error);

            expect(function () {
                lq.char.manyChar(
                    new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                        return lq.char.char("a").run(state, esuc, cerr, esuc, eerr);
                    })
                ).run(
                    new State("aaab", SourcePos.init("test"), "none"),
                    function () {},
                    function () {},
                    function () {},
                    function () {}
                );
            }).to.throw(Error);
        });
    });

    describe("manyChar1(parser)", function () {
        it("should return a parser that parses one or more occurrence of characters parsed by 'parser' and accumulates them in a string", function () {
            lq.char.manyChar1(lq.char.char("a")).run(
                new State("aaab", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    expect(value).to.equal("aaa");
                    expect(State.equals(state, new State("b", new SourcePos("test", 1, 4), "none"))).to.be.true;
                    expect(ParseError.equals(
                        error,
                         new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("a"))
                            ]
                        )
                    )).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.char.manyChar1(
                new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                    return lq.char.char("a").run(state, csuc, cerr, esuc, cerr);
                })
            ).run(
                new State("aaab", SourcePos.init("test"), "none"),
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 4),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("a"))
                            ]
                        )
                    )).to.be.true;
                },
                throwError,
                throwError
            );

            lq.char.manyChar1(
                new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                    return lq.char.char("c").run(state, csuc, cerr, esuc, cerr);
                })
            ).run(
                new State("aaab", SourcePos.init("test"), "none"),
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("c"))
                            ]
                        )
                    )).to.be.true;
                },
                throwError,
                throwError
            );

            lq.char.manyChar1(lq.char.char("c")).run(
                new State("aaab", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(
                        error,
                        new ParseError(
                            new SourcePos("test", 1, 1),
                            [
                                new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("c"))
                            ]
                        )
                    )).to.be.true;
                }
            );

            expect(function () {
                lq.char.manyChar1(
                    lq.prim.mplus(
                        lq.char.char("a"),
                        new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                            return lq.char.char("b").run(state, esuc, cerr, esuc, eerr);
                        })
                    )
                ).run(
                    new State("aaab", SourcePos.init("test"), "none"),
                    function () {},
                    function () {},
                    function () {},
                    function () {}
                );
            }).to.throw(Error);

            expect(function () {
                lq.char.manyChar1(
                    new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                        return lq.char.char("a").run(state, esuc, cerr, esuc, eerr);
                    })
                ).run(
                    new State("aaab", SourcePos.init("test"), "none"),
                    function () {},
                    function () {},
                    function () {},
                    function () {}
                );
            }).to.throw(Error);
        });
    });
});
