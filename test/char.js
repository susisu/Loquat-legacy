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

    });

    describe("oneOf(str)", function () {

    });

    describe("noneOf(str)", function () {

    });

    describe("space", function () {

    });

    describe("spaces", function () {

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
