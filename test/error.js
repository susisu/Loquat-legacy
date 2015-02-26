/*
 * Loquat.test / error.js
 * copyright (c) 2014 Susisu
 */

var chai   = require("chai"),
    expect = chai.expect;

var lq = Object.freeze({
    "error": require("../lib/error"),
    "pos"  : require("../lib/pos"),
    "util" : require("../lib/util")
});

describe("error", function () {
    ArrayUtil = lq.util.ArrayUtil;

    describe("ErrorMessage", function () {
        var ErrorMessage = lq.error.ErrorMessage;
        var ErrorMessageType = lq.error.ErrorMessageType;

        it("should have fields 'type' and 'message'", function () {
            var mes = new ErrorMessage(ErrorMessageType.MESSAGE, "foo");
            expect(mes).to.have.property("type").that.is.a("string");
            expect(mes).to.have.property("message").that.is.a("string");
        });

        describe("constructor(type, message)", function () {
            it("should create a new ErrorMessage object", function () {
                var mes = new ErrorMessage(ErrorMessageType.MESSAGE, "foo");
                expect(mes).to.have.property("type", ErrorMessageType.MESSAGE);
                expect(mes).to.have.property("message", "foo");
            });
        });

        describe(".equals(messageA, messageB)", function () {
            it("should return true when two messages represent the same message", function () {
                expect(
                    ErrorMessage.equals(
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "foo")
                    )
                ).to.be.true;
            });

            it("should return false when two messages represent different messages", function () {
                expect(
                    ErrorMessage.equals(
                        new ErrorMessage(ErrorMessageType.EXPECT, "foo"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "bar")
                    )
                ).to.be.false;
            });
        });

        describe(".messagesToString()", function () {
            it("should return the string representation of the array of error messages", function () {
                var m1 = [];
                expect(ErrorMessage.messagesToString(m1)).to.equal("unknown parse error");
                var m2 = [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")];
                expect(ErrorMessage.messagesToString(m2)).to.equal("foo");
                var m3 = [
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.EXPECT, "bar"),
                    new ErrorMessage(ErrorMessageType.MESSAGE, "baz")
                ];
                expect(ErrorMessage.messagesToString(m3)).to.equal("unexpected foo\nexpecting bar\nbaz");
                var m4 = [
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "bar")
                ];
                expect(ErrorMessage.messagesToString(m4)).to.equal("unexpected foo or bar");
                var m5 = [
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "bar"),
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "baz")
                ];
                expect(ErrorMessage.messagesToString(m5)).to.equal("unexpected foo, bar or baz");
                var m6 = [
                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.EXPECT, "bar")
                ];
                expect(ErrorMessage.messagesToString(m6)).to.equal("unexpected foo\nexpecting bar");
                var m7 = [
                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "bar"),
                    new ErrorMessage(ErrorMessageType.EXPECT, "baz")
                ];
                expect(ErrorMessage.messagesToString(m7)).to.equal("unexpected bar\nexpecting baz");
                var m8 = [
                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "")
                ];
                expect(ErrorMessage.messagesToString(m8)).to.equal("unexpected foo");
                var m9 = [
                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "foo")
                ];
                expect(ErrorMessage.messagesToString(m9)).to.equal("unexpected end of input");
            });
        });
    });

    describe("ParseError", function () {
        var ErrorMessage = lq.error.ErrorMessage;
        var ErrorMessageType = lq.error.ErrorMessageType;
        var ParseError = lq.error.ParseError;
        var SourcePos = lq.pos.SourcePos;

        var defaultPos = new SourcePos("test", 1, 2);
        var defaultMessage = new ErrorMessage(ErrorMessageType.MESSAGE, "test");

        it("should have fields 'position' and 'messages'", function () {
            var error = new ParseError(defaultPos, [defaultMessage]);
            expect(error).to.have.property("position").that.is.instanceOf(SourcePos);
            expect(error).to.have.property("messages").that.is.instanceOf(Array);
        });

        describe("constructor(position, messages)", function () {
            it("should create a new ParseError object that represents parse error", function () {
                var error = new ParseError(
                    new SourcePos("foo", 1, 2),
                    [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "bar"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "baz")
                    ]
                );
                expect(SourcePos.equals(error.position, new SourcePos("foo", 1, 2))).to.be.true;
                expect(
                    ArrayUtil.equals(
                        error.messages,
                        [
                            new ErrorMessage(ErrorMessageType.UNEXPECT, "bar"),
                            new ErrorMessage(ErrorMessageType.EXPECT, "baz")
                        ],
                        ErrorMessage.equals
                    )
                ).to.be.true;
            });
        });

        describe(".unknown(position)", function () {
            it("should return an error that represents unknown error", function () {
                expect(ParseError.unknown(defaultPos).isUnknown()).to.be.true;
            });
        });

        describe(".equals(errorA, errorB)", function () {
            it("should return true when two errors have the same position and the same messages", function () {
                var errorA = new ParseError(
                    new SourcePos("test", 1, 2),
                    []
                );
                var errorB = new ParseError(
                    new SourcePos("test", 1, 2),
                    []
                );
                expect(ParseError.equals(errorA, errorB)).to.be.true;

                var errorC = new ParseError(
                    new SourcePos("test", 3, 4),
                    [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "bar")
                    ]
                );
                var errorD = new ParseError(
                    new SourcePos("test", 3, 4),
                    [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "bar")
                    ]
                );
                expect(ParseError.equals(errorC, errorD)).to.be.true;
            });

            it("should return false when two errors have different positions or different messages", function () {
                var errorA = new ParseError(
                    new SourcePos("test", 1, 2),
                    [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "bar")
                    ]
                );
                var errorB = new ParseError(
                    new SourcePos("test", 3, 4),
                    [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "bar")
                    ]
                );
                expect(ParseError.equals(errorA, errorB)).to.be.false;

                var errorC = new ParseError(
                    new SourcePos("test", 3, 4),
                    [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "bar")
                    ]
                );
                var errorD = new ParseError(
                    new SourcePos("test", 3, 4),
                    [
                        new ErrorMessage(ErrorMessageType.EXPECT, "bar"),
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "foo")
                    ]
                );
                expect(ParseError.equals(errorC, errorD)).to.be.false;
            });
        });

        describe(".merge(errorA, errorB)", function () {
            it("should return merged error", function () {
                var error1A = new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                );
                var error1B = new ParseError(
                    new SourcePos("test", 1, 2),
                    []
                );
                var merged1 = new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                );
                expect(
                    ParseError.equals(
                        ParseError.merge(error1A, error1B),
                        merged1
                    )
                ).to.be.true;

                var error2A = new ParseError(
                    new SourcePos("test", 1, 2),
                    []
                );
                var error2B = new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                );
                var merged2 = new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                );
                expect(
                    ParseError.equals(
                        ParseError.merge(error2A, error2B),
                        merged2
                    )
                ).to.be.true;

                var error3A = new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                );
                var error3B = new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                );
                var merged3 = new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                );
                expect(
                    ParseError.equals(
                        ParseError.merge(error3A, error3B),
                        merged3
                    )
                ).to.be.true;

                var error4A = new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                );
                var error4B = new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                );
                var merged4 = new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                );
                expect(
                    ParseError.equals(
                        ParseError.merge(error4A, error4B),
                        merged4
                    )
                ).to.be.true;

                var error5A = new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                );
                var error5B = new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                );
                var merged5 = new ParseError(
                    new SourcePos("test", 1, 2),
                    [
                        new ErrorMessage(ErrorMessageType.MESSAGE, "foo"),
                        new ErrorMessage(ErrorMessageType.MESSAGE, "bar")
                    ]
                );
                expect(
                    ParseError.equals(
                        ParseError.merge(error5A, error5B),
                        merged5
                    )
                ).to.be.true;
            });
        });

        describe("#toString()", function () {
            it("should return the string representation of the error", function () {
                var messages = [
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.EXPECT, "bar")
                ];
                var error = new ParseError(new SourcePos("test", 1, 2), messages);
                expect(error.toString()).to.equal(
                    "\"test\" (line 1, column 2):\n" + ErrorMessage.messagesToString(messages)
                );
            });
        });

        describe("#isUnknown()", function () {
            it("should return true when the error has no message", function () {
                expect(new ParseError(defaultPos, []).isUnknown()).to.be.true;
            });

            it("should return false when the error has some message", function () {
                expect(new ParseError(defaultPos, [defaultMessage]).isUnknown()).to.be.false;
            });
        });

        describe("#clone()", function () {
            it("should return a copy of the error", function () {
                var error = new ParseError(defaultPos, [defaultMessage]);
                var copy = error.clone();
                expect(SourcePos.equals(copy.position, error.position)).to.be.true;
                expect(ArrayUtil.equals(copy.messages, error.messages, ErrorMessage.equals)).to.be.true;
            });
        });

        describe("#setPosition(position)", function () {
            it("should return a copy of the error, the position of which is set to the specified position", function () {
                var error = new ParseError(defaultPos, [defaultMessage]);
                var copy = error.setPosition(new SourcePos("bar", 3, 4));
                expect(SourcePos.equals(copy.position, new SourcePos("bar", 3, 4))).to.be.true;

                expect(SourcePos.equals(copy.position, error.position)).to.be.false;
                expect(copy.messages).to.equal(error.messages);
                expect(copy).not.to.equal(error);
            });
        });

        describe("#setMessages(messages)", function () {
            it("should return a copy of the error, the messages of which is set to the specified messages", function () {
                var error = new ParseError(defaultPos, [defaultMessage]);
                var messages = [
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.EXPECT, "bar")
                ];
                var copy = error.setMessages(messages);
                expect(ArrayUtil.equals(copy.messages, messages, ErrorMessage.equals)).to.be.true;

                expect(SourcePos.equals(copy.position, error.position)).to.be.true;
                expect(copy.messages).not.to.equal(error.messages);
                expect(copy).not.to.equal(error);
            });
        });

        describe("#setSpecificTypeMessages(type, messages)", function () {
            it("should return a copy of the error, the messages of the specified type of which is set to the specified messages", function () {
                var messages = [
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.EXPECT, "bar")
                ];
                var error = new ParseError(defaultPos, messages);
                var copy = error.setSpecificTypeMessages(ErrorMessageType.EXPECT, ["baz"]);
                var filtered = messages.filter(function (message) { return message.type !== ErrorMessageType.EXPECT; });
                expect(
                    ArrayUtil.equals(
                        copy.messages.filter(function (message) { return message.type !== ErrorMessageType.EXPECT; }),
                        filtered,
                        ErrorMessage.equals
                    )
                ).to.be.true;
                expect(
                    ErrorMessage.equals(
                        copy.messages.filter(function (message) { return message.type === ErrorMessageType.EXPECT; })[0],
                        new ErrorMessage(ErrorMessageType.EXPECT, "baz")
                    )
                ).to.be.true;
                
                expect(SourcePos.equals(copy.position, error.position)).to.be.true;
                expect(copy.messages).not.to.equal(error.messages);
                expect(copy).not.to.equal(error);
            });
        });

        describe("#addMessages(messages)", function () {
            it("should return a copy of the error, the messages of which is concatenated with the specified messages", function () {
                var error = new ParseError(defaultPos, [defaultMessage]);
                var messages = [
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.EXPECT, "bar")
                ];
                var copy = error.addMessages(messages);
                var concatenated = [defaultMessage].concat(messages);
                expect(ArrayUtil.equals(copy.messages, concatenated, ErrorMessage.equals)).to.be.true;

                expect(SourcePos.equals(copy.position, error.position)).to.be.true;
                expect(copy.messages).not.to.equal(error.messages);
                expect(copy).not.to.equal(error);
            });
        });
    });
});
