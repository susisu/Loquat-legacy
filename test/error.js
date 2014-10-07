/*
 * Loquat.test / error.js
 * copyright (c) 2014 Susisu
 */

var should = require("should");

var lq = Object.freeze({
    "error": require("../lib/error"),
    "pos"  : require("../lib/pos"),
    "util" : require("../lib/util")
});

describe("error", function () {
    describe("ErrorMessage", function () {
        var ErrorMessage = lq.error.ErrorMessage;
        var ErrorMessageType = lq.error.ErrorMessageType;

        it("should have fields 'type' and 'message'", function () {
            var mes = new ErrorMessage(ErrorMessageType.MESSAGE, "foo");
            mes.hasOwnProperty("type").should.be.ok;
            mes.hasOwnProperty("message").should.be.ok;
        });

        describe("constructor(type, message)", function () {
            it("should create a new ErrorMessage object", function () {
                var mes = new ErrorMessage(ErrorMessageType.MESSAGE, "foo");
                mes.type.should.equal(ErrorMessageType.MESSAGE);
                mes.message.should.equal("foo");
            });
        });

        describe(".equals(messageA, messageB)", function () {
            it("should return true when two messages represent the same message", function () {
                ErrorMessage.equals(
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "foo")
                ).should.be.ok;
            });

            it("should return false when two messages represent different messages", function () {
                ErrorMessage.equals(
                    new ErrorMessage(ErrorMessageType.EXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.EXPECT, "bar")
                ).should.not.be.ok;
            });
        });

        describe(".messagesToString()", function () {
            it("should return the string representation of the array of error messages", function () {
                var m1 = [];
                ErrorMessage.messagesToString(m1).should.equal("unknown parse error");
                var m2 = [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")];
                ErrorMessage.messagesToString(m2).should.equal("foo");
                var m3 = [
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.EXPECT, "bar"),
                    new ErrorMessage(ErrorMessageType.MESSAGE, "baz")
                ];
                ErrorMessage.messagesToString(m3).should.equal("unexpected foo\nexpecting bar\nbaz");
                var m4 = [
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "bar")
                ];
                ErrorMessage.messagesToString(m4).should.equal("unexpected foo or bar");
                var m5 = [
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "bar"),
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "baz")
                ];
                ErrorMessage.messagesToString(m5).should.equal("unexpected foo, bar or baz");
                var m6 = [
                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.EXPECT, "bar")
                ];
                ErrorMessage.messagesToString(m6).should.equal("unexpected foo\nexpecting bar");
                var m7 = [
                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "bar"),
                    new ErrorMessage(ErrorMessageType.EXPECT, "baz")
                ];
                ErrorMessage.messagesToString(m7).should.equal("unexpected bar\nexpecting baz");
                var m8 = [
                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "")
                ];
                ErrorMessage.messagesToString(m8).should.equal("unexpected foo");
                var m9 = [
                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "foo")
                ];
                ErrorMessage.messagesToString(m9).should.equal("unexpected end of input");
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
            error.hasOwnProperty("position").should.be.ok;
            error.hasOwnProperty("messages").should.be.ok;
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
                SourcePos.equals(error.position, new SourcePos("foo", 1, 2)).should.be.ok;
                lq.util.ArrayUtil.equals(
                    error.messages,
                    [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "bar"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "baz")
                    ],
                    ErrorMessage.equals
                ).should.be.ok;
            });
        });

        describe(".unknown(position)", function () {
            it("should return an error that represents unknown error", function () {
                ParseError.unknown(defaultPos).isUnknown().should.be.ok;
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
                ParseError.equals(errorA, errorB).should.be.ok;

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
                ParseError.equals(errorC, errorD).should.be.ok;
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
                ParseError.equals(errorA, errorB).should.not.be.ok;

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
                ParseError.equals(errorC, errorD).should.not.be.ok;
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
                ParseError.equals(
                    ParseError.merge(error1A, error1B),
                    merged1
                ).should.be.ok;

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
                ParseError.equals(
                    ParseError.merge(error2A, error2B),
                    merged2
                ).should.be.ok;

                var error3A = new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                );
                var error3B = new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                );
                var merged3 = new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                );
                ParseError.equals(
                    ParseError.merge(error3A, error3B),
                    merged3
                ).should.be.ok;

                var error4A = new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                );
                var error4B = new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                );
                var merged4 = new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
                );
                ParseError.equals(
                    ParseError.merge(error4A, error4B),
                    merged4
                ).should.be.ok;

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
                ParseError.equals(
                    ParseError.merge(error5A, error5B),
                    merged5
                ).should.be.ok;
            });
        });

        describe("#toString()", function () {
            it("should return the string representation of the error", function () {
                var messages = [
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "foo"),
                    new ErrorMessage(ErrorMessageType.EXPECT, "bar")
                ];
                var error = new ParseError(new SourcePos("test", 1, 2), messages);
                error.toString().should.equal("\"test\" (line 1, column 2):\n" + ErrorMessage.messagesToString(messages));
            });
        });

        describe("#isUnknown()", function () {
            it("should return true when the error has no message", function () {
                new ParseError(defaultPos, []).isUnknown().should.be.ok;
            });

            it("should return false when the error has some message", function () {
                new ParseError(defaultPos, [defaultMessage]).isUnknown().should.not.be.ok;
            });
        });

        describe("#clone()", function () {
            it("should return a copy of the error", function () {
                var error = new ParseError(defaultPos, [defaultMessage]);
                var copy = error.clone();
                SourcePos.equals(error.position, copy.position).should.be.ok;
                copy.messages.forEach(function (message, index) {
                    ErrorMessage.equals(message, error.messages[index]).should.be.ok;
                });
            });
        });

        describe("#setPosition(position)", function () {
            it("should return a copy of the error, the position of which is set to the specified position", function () {
                var error = new ParseError(defaultPos, [defaultMessage]);
                var copy = error.setPosition(new SourcePos("bar", 3, 4));
                SourcePos.equals(copy.position, new SourcePos("bar", 3, 4)).should.be.ok;

                SourcePos.equals(copy.position, error.position).should.not.be.ok;
                (copy.messages === error.messages).should.be.ok;
                (copy === error).should.not.be.ok;
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
                copy.messages.forEach(function (message, index) {
                    ErrorMessage.equals(message, messages[index]).should.be.ok;
                });

                SourcePos.equals(copy.position, error.position).should.be.ok;
                (copy.messages === error.messages).should.not.be.ok;
                (copy === error).should.not.be.ok;
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
                copy.messages.filter(function (message) { return message.type !== ErrorMessageType.EXPECT; })
                    .map(function (message, index) {
                        ErrorMessage.equals(message, filtered[index]).should.be.ok;
                    });
                ErrorMessage.equals(
                    copy.messages.filter(function (message) { return message.type === ErrorMessageType.EXPECT; })[0],
                    new ErrorMessage(ErrorMessageType.EXPECT, "baz")
                ).should.be.ok;
                
                SourcePos.equals(copy.position, error.position).should.be.ok;
                (copy.messages === error.messages).should.not.be.ok;
                (copy === error).should.not.be.ok;
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
                copy.messages.forEach(function (message, index) {
                    ErrorMessage.equals(message, concatenated[index]).should.be.ok;
                });

                SourcePos.equals(copy.position, error.position).should.be.ok;
                (copy.messages === error.messages).should.not.be.ok;
                (copy === error).should.not.be.ok;
            });
        });
    });
});
