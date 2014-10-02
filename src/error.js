/*
 * Loquat / error.js
 * copyright (c) 2014 Susisu
 *
 * parse errors
 */

function end () {
    module.exports = Object.freeze({
        "ErrorMessage"    : ErrorMessage,
        "ErrorMessageType": ErrorMessageType,
        "ParseError"      : ParseError
    });
}

var lq = Object.freeze({
    "array": require("./array"),
    "pos"  : require("./pos")
});


function ErrorMessage (type, message) {
    this.type    = type;
    this.message = message;
}

Object.defineProperties(ErrorMessage, {
    "equals": { "value": function (messageA, messageB) {
        return messageA.type === messageB.type
            && messageA.message === messageB.message;
    }},

    "messagesToString": { "value": function (messages) {
        if (messages.length === 0) {
            return "unknown parse error";
        }
        else {
            var systemUnexpects = [];
            var unexpects       = [];
            var expects         = [];
            var defaultMessages = [];
            for (var i = 0; i < messages.length; i ++) {
                switch (messages[i].type) {
                    case ErrorMessageType.SYSTEM_UNEXPECT:
                        systemUnexpects.push(messages[i].message);
                        break;
                    case ErrorMessageType.UNEXPECT:
                        unexpects.push(messages[i].message);
                        break;
                    case ErrorMessageType.EXPECT:
                        expects.push(messages[i].message);
                        break;
                    case ErrorMessageType.MESSAGE:
                        defaultMessages.push(messages[i].message);
                        break;
                }
            }
            return clean([
                unexpects.length === 0 && systemUnexpects.length !== 0
                    ? systemUnexpects[0] === ""
                        ? "unexpected end of input"
                        : "unexpected " + systemUnexpects[0]
                    : "",
                toStringWithDescription("unexpected", clean(unexpects)),
                toStringWithDescription("expecting", clean(expects)),
                toStringWithDescription("", clean(defaultMessages))
            ]).join("\n");
        }

        function clean (messages) {
            return messages.filter(function (element, index, array) {
                return array.indexOf(element) === index
                    && element                !== "";
            });
        }

        function separateByCommasOr (messages) {
            return messages.length <= 1
                 ? messages.toString()
                 : messages.slice(0, messages.length - 1).join(", ") + " or " + messages[messages.length - 1];
        }

        function toStringWithDescription (description, messages) {
            return messages.length === 0
                 ? ""
                 : (description === "" ? "" : description + " ") + separateByCommasOr(messages);
        }
    }}
});


var ErrorMessageType = {};

Object.defineProperties(ErrorMessageType, {
    "SYSTEM_UNEXPECT": { "value": "systemUnexpect" },
    "UNEXPECT": { "value": "unexpect" },
    "EXPECT": { "value": "expect" },
    "MESSAGE": { "value": "message" }
});


function ParseError (position, messages) {
    this.position = position;
    this.messages = messages;
}

Object.defineProperties(ParseError, {
    "unknown": { "value": function (position) {
        return new ParseError(position, []);
    }},

    "equals": { "value": function (errorA, errorB) {
        return lq.pos.SourcePos.equals(errorA.position, errorB.position)
            && errorA.messages.length === errorB.messages.length
            && lq.array.zipWith(ErrorMessage.equals, errorA.messages, errorB.messages)
                .every(function (x) { return x; });
    }},

    "merge": { "value": function (errorA, errorB) {
        var result = lq.pos.SourcePos.compare(errorA.position, errorB.position);
        return errorB.messages.length === 0 && errorA.messages.length !== 0 ? errorA
             : errorA.messages.length === 0 && errorB.messages.length !== 0 ? errorB
             : result < 0                                                   ? errorA
             : result > 0                                                   ? errorB
                                                                            : errorA.addMessages(errorB.messages);
    }}
});

Object.defineProperties(ParseError.prototype, {
    "toString": { "value": function () {
        return this.position.toString() + ":\n" + ErrorMessage.messagesToString(this.messages);
    }},

    "isUnknown": { "value": function () {
        return this.messages.length === 0;
    }},

    "clone": { "value": function () {
        return new ParseError(this.position.clone(), this.messages.slice());
    }},

    "setPosition": { "value": function (position) {
        return new ParseError(position, this.messages);
    }},

    "setMessages": { "value": function (messages) {
        return new ParseError(this.position, messages);
    }},

    "setSpecificTypeMessages": { "value": function (type, messages) {
        return new ParseError(
            this.position,
            this.messages.filter(function (message) { return message.type !== type; })
                .concat(messages.map(function (message) { return new ErrorMessage(type, message); }))
        );
    }},

    "addMessages": { "value": function (messages) {
        return new ParseError(this.position, this.messages.concat(messages));
    }}
});


end();
