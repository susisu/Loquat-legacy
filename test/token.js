/*
 * Loquat.test / token.js
 * copyright (c) 2014 Susisu
 */

var chai   = require("chai"),
    expect = chai.expect;

var lq = Object.freeze({
    "char"  : require("../lib/char"),
    "error" : require("../lib/error"),
    "pos"   : require("../lib/pos"),
    "prim"  : require("../lib/prim"),
    "string": require("../lib/string"),
    "token" : require("../lib/token"),
    "util"  : require("../lib/util")
});


describe("token", function () {
    var LanguageDef = lq.token.LanguageDef;
    var TokenParser = lq.token.TokenParser;
    var makeTokenParser = lq.token.makeTokenParser;

    var ParseError = lq.error.ParseError;
    var ErrorMessage = lq.error.ErrorMessage;
    var ErrorMessageType = lq.error.ErrorMessageType;
    var SourcePos = lq.pos.SourcePos;
    var State = lq.prim.State;

    function throwError () {
        throw new Error("unexpected call of result function");
    }

    describe("LanguageDef", function () {
        it("should correctly have fields", function () {
            var def = new LanguageDef("commentStart", "commentEnd", "commentLine", "nestedComments",
                "identStart", "identLetter", "opStart", "opLetter",
                "reservedNames", "reservedOpNames", "caseSensitive");
            expect(def).to.have.property("commentStart");
            expect(def).to.have.property("commentEnd");
            expect(def).to.have.property("commentLine");
            expect(def).to.have.property("nestedComments");
            expect(def).to.have.property("identStart");
            expect(def).to.have.property("identLetter");
            expect(def).to.have.property("opStart");
            expect(def).to.have.property("opLetter");
            expect(def).to.have.property("reservedNames");
            expect(def).to.have.property("reservedOpNames");
            expect(def).to.have.property("caseSensitive");
        });

        describe("constructor(ommentStart, commentEnd, commentLine, nestedComments, "
                + "identStart, identLetter, opStart, opLetter, "
                + "reservedNames, reservedOpNames, caseSensitive)", function () {
            it("should create a new LanguageDef object", function () {
                var def = new LanguageDef("commentStart", "commentEnd", "commentLine", "nestedComments",
                    "identStart", "identLetter", "opStart", "opLetter",
                    "reservedNames", "reservedOpNames", "caseSensitive");
                expect(def.commentStart).to.equal("commentStart");
                expect(def.commentEnd).to.equal("commentEnd");
                expect(def.commentLine).to.equal("commentLine");
                expect(def.nestedComments).to.equal("nestedComments");
                expect(def.identStart).to.equal("identStart");
                expect(def.identLetter).to.equal("identLetter");
                expect(def.opStart).to.equal("opStart");
                expect(def.opLetter).to.equal("opLetter");
                expect(def.reservedNames).to.equal("reservedNames");
                expect(def.reservedOpNames).to.equal("reservedOpNames");
                expect(def.caseSensitive).to.equal("caseSensitive");
            });
        });
    });

    describe("TokenParser", function () {
        it("should correctly have fields", function () {
            var tokenp = new TokenParser("identifier", "reserved", "operator", "reservedOp",
                "charLiteral", "stringLiteral", "natural", "integer", "float", "naturalOrFloat", "decimal", "hexadecimal", "octal",
                "symbol", "lexeme", "whiteSpace", "parens", "braces", "angles", "brackets",
                "semi", "comma", "colon", "dot", "semiSep", "semiSep1", "commaSep", "commaSep1");
            expect(tokenp).to.have.property("identifier");
            expect(tokenp).to.have.property("reserved");
            expect(tokenp).to.have.property("operator");
            expect(tokenp).to.have.property("reservedOp");
            expect(tokenp).to.have.property("charLiteral");
            expect(tokenp).to.have.property("stringLiteral");
            expect(tokenp).to.have.property("natural");
            expect(tokenp).to.have.property("integer");
            expect(tokenp).to.have.property("float");
            expect(tokenp).to.have.property("naturalOrFloat");
            expect(tokenp).to.have.property("decimal");
            expect(tokenp).to.have.property("hexadecimal");
            expect(tokenp).to.have.property("octal");
            expect(tokenp).to.have.property("symbol");
            expect(tokenp).to.have.property("lexeme");
            expect(tokenp).to.have.property("whiteSpace");
            expect(tokenp).to.have.property("parens");
            expect(tokenp).to.have.property("braces");
            expect(tokenp).to.have.property("angles");
            expect(tokenp).to.have.property("brackets");
            expect(tokenp).to.have.property("semi");
            expect(tokenp).to.have.property("comma");
            expect(tokenp).to.have.property("colon");
            expect(tokenp).to.have.property("dot");
            expect(tokenp).to.have.property("semiSep");
            expect(tokenp).to.have.property("semiSep1");
            expect(tokenp).to.have.property("commaSep");
            expect(tokenp).to.have.property("commaSep1");
        });

        describe("constructor(identifier, reserved, operator, reservedOp, "
                + "charLiteral, stringLiteral, natural, integer, float, naturalOrFloat, decimal, hexadecimal, octal, "
                + "symbol, lexeme, whiteSpace, parens, braces, angles, brackets, "
                + "semi, comma, colon, dot, semiSep, semiSep1, commaSep, commaSep1)", function () {
            it("should create a new TokenParser object", function () {
                var tokenp = new TokenParser("identifier", "reserved", "operator", "reservedOp",
                    "charLiteral", "stringLiteral", "natural", "integer", "float", "naturalOrFloat", "decimal", "hexadecimal", "octal",
                    "symbol", "lexeme", "whiteSpace", "parens", "braces", "angles", "brackets",
                    "semi", "comma", "colon", "dot", "semiSep", "semiSep1", "commaSep", "commaSep1");
                expect(tokenp.identifier).to.equal("identifier");
                expect(tokenp.reserved).to.equal("reserved");
                expect(tokenp.operator).to.equal("operator");
                expect(tokenp.reservedOp).to.equal("reservedOp");
                expect(tokenp.charLiteral).to.equal("charLiteral");
                expect(tokenp.stringLiteral).to.equal("stringLiteral");
                expect(tokenp.natural).to.equal("natural");
                expect(tokenp.integer).to.equal("integer");
                expect(tokenp.float).to.equal("float");
                expect(tokenp.naturalOrFloat).to.equal("naturalOrFloat");
                expect(tokenp.decimal).to.equal("decimal");
                expect(tokenp.hexadecimal).to.equal("hexadecimal");
                expect(tokenp.octal).to.equal("octal");
                expect(tokenp.symbol).to.equal("symbol");
                expect(tokenp.lexeme).to.equal("lexeme");
                expect(tokenp.whiteSpace).to.equal("whiteSpace");
                expect(tokenp.parens).to.equal("parens");
                expect(tokenp.braces).to.equal("braces");
                expect(tokenp.angles).to.equal("angles");
                expect(tokenp.brackets).to.equal("brackets");
                expect(tokenp.semi).to.equal("semi");
                expect(tokenp.comma).to.equal("comma");
                expect(tokenp.colon).to.equal("colon");
                expect(tokenp.dot).to.equal("dot");
                expect(tokenp.semiSep).to.equal("semiSep");
                expect(tokenp.semiSep1).to.equal("semiSep1");
                expect(tokenp.commaSep).to.equal("commaSep");
                expect(tokenp.commaSep1).to.equal("commaSep1");
            });
        });
    });

    describe("makeTokenParser(languageDef)", function () {
        describe(".identifier", function () {
            it("should parse identifier", function () {
                var def1 = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    lq.char.letter, /* identStart */
                    lq.char.alphaNum, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser1 = makeTokenParser(def1);
                var def2 = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    lq.char.letter, /* identStart */
                    lq.char.alphaNum, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    false /* caseSensitive */
                );
                var parser2 = makeTokenParser(def2);

                parser1.identifier.run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, "identifier")
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser1.identifier.run(
                    new State("0foo", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("0")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "identifier")
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser1.identifier.run(
                    new State("foo", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("foo");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser1.identifier.run(
                    new State("f00", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("f00");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser1.identifier.run(
                    new State("foo bar", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("foo");
                        expect(State.equals(
                            state,
                            new State("bar", new SourcePos("test", 1, 5), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser1.identifier.run(
                    new State("var", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, "reserved word " + lq.util.show("var"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser1.identifier.run(
                    new State("function", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 9),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, "reserved word " + lq.util.show("function"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser1.identifier.run(
                    new State("Var", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("Var");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser2.identifier.run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, "identifier")
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser2.identifier.run(
                    new State("0foo", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("0")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "identifier")
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser2.identifier.run(
                    new State("foo", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("foo");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser2.identifier.run(
                    new State("f00", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("f00");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser2.identifier.run(
                    new State("foo bar", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("foo");
                        expect(State.equals(
                            state,
                            new State("bar", new SourcePos("test", 1, 5), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser2.identifier.run(
                    new State("var", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, "reserved word " + lq.util.show("var"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser2.identifier.run(
                    new State("function", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 9),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, "reserved word " + lq.util.show("function"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser2.identifier.run(
                    new State("Var", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, "reserved word " + lq.util.show("Var"))
                                ]
                            )
                        )).to.be.true;
                    }
                );
            });
        });

        describe(".reserved(name)", function () {
            it("should parse reserved word 'name'", function () {
                var def1 = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    lq.char.letter, /* identStart */
                    lq.char.alphaNum, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser1 = makeTokenParser(def1);
                var def2 = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    lq.char.letter, /* identStart */
                    lq.char.alphaNum, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    false /* caseSensitive */
                );
                var parser2 = makeTokenParser(def2);

                parser1.reserved("var").run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("var"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser1.reserved("var").run(
                    new State("foo", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("f")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("var"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser1.reserved("var").run(
                    new State("val", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("l")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("var"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser1.reserved("var").run(
                    new State("var", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of " + lq.util.show("var")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser1.reserved("var").run(
                    new State("var const", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("const", new SourcePos("test", 1, 5), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser1.reserved("var").run(
                    new State("varvar", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show("v")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of " + lq.util.show("var")),
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser1.reserved("var").run(
                    new State("VAR", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("V")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("var")),
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser1.reserved("const").run(
                    new State("const", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of " + lq.util.show("const")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser2.reserved("var").run(
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
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("var"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser2.reserved("var").run(
                    new State("foo", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("f")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("f")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("var"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser2.reserved("var").run(
                    new State("val", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("l")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("l")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("var"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser2.reserved("var").run(
                    new State("var", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of " + lq.util.show("var")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser2.reserved("var").run(
                    new State("var const", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("const", new SourcePos("test", 1, 5), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser2.reserved("var").run(
                    new State("varvar", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show("v")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of " + lq.util.show("var")),
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser2.reserved("var").run(
                    new State("VAR", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of " + lq.util.show("var")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser2.reserved("const").run(
                    new State("const", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of " + lq.util.show("const")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
        });
        
        describe(".operator", function () {
            it("should parse operator", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    lq.char.oneOf("!#$%&*+./<=>?@\\^|-~"), /* opStart */
                    lq.char.oneOf("!#$%&*+./<=>?@\\^|-~:"), /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);

                parser.operator.run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator")
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.operator.run(
                    new State(":+", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(":")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator")
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.operator.run(
                    new State("++", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("++");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.operator.run(
                    new State("+:", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("+:");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.operator.run(
                    new State("++ ==", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("++");
                        expect(State.equals(
                            state,
                            new State("==", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("=")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("=")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("=")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.operator.run(
                    new State("=", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, "reserved operator " + lq.util.show("="))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.operator.run(
                    new State("@", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, "reserved operator " + lq.util.show("@"))
                                ]
                            )
                        )).to.be.true;
                    }
                );
            });
        });

        describe(".reservedOp(name)", function () {
            it("should parse reserved operator 'name'", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    lq.char.oneOf("!#$%&*+./<=>?@\\^|-~"), /* opStart */
                    lq.char.oneOf("!#$%&*+./<=>?@\\^|-~:"), /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);

                parser.reservedOp("=").run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("="))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.reservedOp("=").run(
                    new State("+", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("+")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("="))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.reservedOp("=").run(
                    new State("=", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of " + lq.util.show("=")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.reservedOp("=").run(
                    new State("= +", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("+", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("+")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("+")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("+")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.reservedOp("=").run(
                    new State("==", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show("=")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of " + lq.util.show("=")),
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.reservedOp("->").run(
                    new State("->", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of " + lq.util.show("->")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.reservedOp("->").run(
                    new State("-+", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("+")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("->"))
                                ]
                            )
                        )).to.be.true;
                    }
                );
            });
        });

        describe(".stringLiteral", function () {
            it("should parse strgin literal and return the value as a string", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);

                parser.stringLiteral.run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, "literal string")
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.stringLiteral.run(
                    new State("\"\"", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"foo\"", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("foo");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"\\\"", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "string character"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of string")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"a\\        b\"", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 12),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "space"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of string gap")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"a\\        \\b\"", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("ab");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 15), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 15),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"a\\&b\"", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("ab");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 7), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 7),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"\\?\"", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [].concat(
                                    [
                                        new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("?")),
                                        new ErrorMessage(ErrorMessageType.EXPECT, "space")
                                    ],
                                    [
                                        new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("?")),
                                        new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("&"))
                                    ],
                                    lq.util.ArrayUtil.replicate(
                                        10, new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("?"))
                                    ),
                                    [
                                        new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("?")),
                                        new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("?")),
                                        new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("?"))
                                    ],
                                    lq.util.ArrayUtil.replicate(
                                        14, new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("?"))
                                    ),
                                    lq.util.ArrayUtil.replicate(
                                        20, new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("?"))
                                    ),
                                    [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("?"))],
                                    [new ErrorMessage(ErrorMessageType.EXPECT, "escape code")]
                                )
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"a\\\"b\"", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("a\"b");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 7), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 7),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"a\\nb\"", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("a\nb");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 7), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 7),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"a\\65b\"", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("aAb");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 8), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 8),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"\\o\"", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("\"")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"a\\o101b\"", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("aAb");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 10), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 10),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"\\x\"", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("\"")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"y\\x41z\"", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("yAz");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 9), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 9),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"a\\BSb\"", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("a\u0008b");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 8), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 8),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"a\\NULb\"", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("a\u0000b");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 9), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 9),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"\\^\"", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("\"")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "uppercase letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.stringLiteral.run(
                    new State("\"a\\^Ab\"", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("a\u0001b");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 8), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 8),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
        });

        describe(".charLiteral", function () {
            it("should parse character literal and return the value as a string", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);

                parser.charLiteral.run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, "character")
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.charLiteral.run(
                    new State("'a'", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("a");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.charLiteral.run(
                    new State("'ab'", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of character")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.charLiteral.run(
                    new State("''", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("'")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("'")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "literal character")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.charLiteral.run(
                    new State("'\\'", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of character")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.charLiteral.run(
                    new State("'\\?'", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [].concat(
                                    lq.util.ArrayUtil.replicate(
                                        10, new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("?"))
                                    ),
                                    [
                                        new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("?")),
                                        new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("?")),
                                        new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("?"))
                                    ],
                                    lq.util.ArrayUtil.replicate(
                                        14, new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("?"))
                                    ),
                                    lq.util.ArrayUtil.replicate(
                                        20, new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("?"))
                                    ),
                                    [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("?"))],
                                    [new ErrorMessage(ErrorMessageType.EXPECT, "escape code")]
                                )
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.charLiteral.run(
                    new State("'\\''", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("'");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 5), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.charLiteral.run(
                    new State("'\\n'", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("\n");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 5), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.charLiteral.run(
                    new State("'\\65'", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("A");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.charLiteral.run(
                    new State("'\\o'", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("'")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.charLiteral.run(
                    new State("'\\o101'", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("A");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 8), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 8),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.charLiteral.run(
                    new State("'\\x'", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("'")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.charLiteral.run(
                    new State("'\\x41'", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("A");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 7), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 7),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.charLiteral.run(
                    new State("'\\BS'", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("\u0008");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.charLiteral.run(
                    new State("'\\NUL'", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("\u0000");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 7), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 7),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.charLiteral.run(
                    new State("'\\^'", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("'")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "uppercase letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.charLiteral.run(
                    new State("'\\^A'", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("\u0001");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
        });

        describe(".natural", function () {
            it("should parse natural and return the value as a number", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);

                parser.natural.run(
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
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "natural")
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.natural.run(
                    new State("0x123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(parseInt("123456789ABCDEF", 16));
                        expect(State.equals(
                            state,
                            new State("G", new SourcePos("test", 1, 18), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 18),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.natural.run(
                    new State("0o123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(parseInt("1234567", 8));
                        expect(State.equals(
                            state,
                            new State("89ABCDEFG", new SourcePos("test", 1, 10), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 10),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.natural.run(
                    new State("0123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(0123456789);
                        expect(State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 11), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 11),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.natural.run(
                    new State("0.1", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(0);
                        expect(State.equals(
                            state,
                            new State(".1", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.natural.run(
                    new State("123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(123456789);
                        expect(State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 10), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 10),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
        });

        describe(".integer", function () {
            it("should parse integer and return the value as a number", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);

                parser.integer.run(
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
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "integer")
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.integer.run(
                    new State("-", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("+", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("-0x123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(-parseInt("123456789ABCDEF", 16));
                        expect(State.equals(
                            state,
                            new State("G", new SourcePos("test", 1, 19), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 19),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.integer.run(
                    new State("-0o123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(-parseInt("1234567", 8));
                        expect(State.equals(
                            state,
                            new State("89ABCDEFG", new SourcePos("test", 1, 11), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 11),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("-0123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(-0123456789);
                        expect(State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 12), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 12),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("-0.1", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(-0);
                        expect(State.equals(
                            state,
                            new State(".1", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("-123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(-123456789);
                        expect(State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 11), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 11),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("+0x123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(parseInt("123456789ABCDEF", 16));
                        expect(State.equals(
                            state,
                            new State("G", new SourcePos("test", 1, 19), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 19),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.integer.run(
                    new State("+0o123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(parseInt("1234567", 8));
                        expect(State.equals(
                            state,
                            new State("89ABCDEFG", new SourcePos("test", 1, 11), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 11),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("+0123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(0123456789);
                        expect(State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 12), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 12),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("+0.1", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(0);
                        expect(State.equals(
                            state,
                            new State(".1", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("+123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(123456789);
                        expect(State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 11), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 11),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("0x123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(parseInt("123456789ABCDEF", 16));
                        expect(State.equals(
                            state,
                            new State("G", new SourcePos("test", 1, 18), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 18),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.integer.run(
                    new State("0o123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(parseInt("1234567", 8));
                        expect(State.equals(
                            state,
                            new State("89ABCDEFG", new SourcePos("test", 1, 10), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 10),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("0123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(0123456789);
                        expect(State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 11), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 11),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("0.1", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(0);
                        expect(State.equals(
                            state,
                            new State(".1", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(123456789);
                        expect(State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 10), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 10),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
        });

        describe(".float", function () {
            it("should parse float and return the value as a number", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);

                parser.float.run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, "float")
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.float.run(
                    new State("1234567890A", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 11),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "fraction"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "exponent")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.float.run(
                    new State("1234567890.A", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 12),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "fraction")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.float.run(
                    new State("1234567890.5A", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(1234567890.5);
                        expect(State.equals(
                            state,
                            new State("A", new SourcePos("test", 1, 13), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 13),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "exponent"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.float.run(
                    new State("1234567890eA", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 12),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("-")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("+")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "exponent")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.float.run(
                    new State("1234567890e-1A", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(1234567890e-1);
                        expect(State.equals(
                            state,
                            new State("A", new SourcePos("test", 1, 14), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 14),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.float.run(
                    new State("1234567890e+1A", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(1234567890e+1);
                        expect(State.equals(
                            state,
                            new State("A", new SourcePos("test", 1, 14), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 14),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.float.run(
                    new State("1234567890e1A", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(1234567890e1);
                        expect(State.equals(
                            state,
                            new State("A", new SourcePos("test", 1, 13), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 13),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.float.run(
                    new State("1234567890.5e-2A", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(1234567890.5e-2);
                        expect(State.equals(
                            state,
                            new State("A", new SourcePos("test", 1, 16), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 16),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
        });

        describe(".naturalOrFloat", function () {
            it("should parse natural or float and return the value as a number", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);

                parser.naturalOrFloat.run(
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
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "number")
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.naturalOrFloat.run(
                    new State("0x123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal([parseInt("0123456789ABCDEF", 16)]);
                        expect(State.equals(
                            state,
                            new State("G", new SourcePos("test", 1, 18), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 18),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("0o123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal([parseInt("01234567", 8)]);
                        expect(State.equals(
                            state,
                            new State("89ABCDEFG", new SourcePos("test", 1, 10), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 10),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("0123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal([0123456789]);
                        expect(State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 11), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 11),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "fraction"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "exponent"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("01234.56789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal([undefined, 1234.56789]);
                        expect(State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 12), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 12),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "exponent"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("0123456789e-4ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal([undefined, 123456789e-4]);
                        expect(State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 14), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 14),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("01234.56789e-6ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal([undefined, 1234.56789e-6]);
                        expect(State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 15), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 15),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal([123456789]);
                        expect(State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 10), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 10),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "fraction"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "exponent"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("1234.56789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal([undefined, 1234.56789]);
                        expect(State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 11), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 11),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "exponent"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("123456789e-4ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal([undefined, 123456789e-4]);
                        expect(State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 13), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 13),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("1234.56789e-6ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal([undefined, 1234.56789e-6]);
                        expect(State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 14), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 14),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
        });

        describe(".decimal", function () {
            it("should parse decimal digits and return the value as a number", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);

                parser.decimal.run(
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

                parser.decimal.run(
                    new State("0", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(0);
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.decimal.run(
                    new State("0123456789A", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(0123456789);
                        expect(State.equals(
                            state,
                            new State("A", new SourcePos("test", 1, 11), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 11),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
        });

        describe(".hexadecimal", function () {
            it("should parse hexadecimal digits and return the value as a number", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);

                parser.hexadecimal.run(
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
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.hexadecimal.run(
                    new State("x", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.hexadecimal.run(
                    new State("X", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.hexadecimal.run(
                    new State("x0", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(0);
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.hexadecimal.run(
                    new State("X0", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(0);
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.hexadecimal.run(
                    new State("x0123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(parseInt("0123456789ABCDEF", 16));
                        expect(State.equals(
                            state,
                            new State("G", new SourcePos("test", 1, 18), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 18),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.hexadecimal.run(
                    new State("x0123456789abcdefg", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(parseInt("0123456789ABCDEF", 16));
                        expect(State.equals(
                            state,
                            new State("g", new SourcePos("test", 1, 18), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 18),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("g")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
        });

        describe(".octal", function () {
            it("should parse octal digits and return the value as a number", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);

                parser.octal.run(
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
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.octal.run(
                    new State("o", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.octal.run(
                    new State("O", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.octal.run(
                    new State("o0", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(0);
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.octal.run(
                    new State("O0", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(0);
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.octal.run(
                    new State("o0123456789", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(parseInt("01234567", 8));
                        expect(State.equals(
                            state,
                            new State("89", new SourcePos("test", 1, 10), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 10),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
        });

        describe(".symbol(name)", function () {
            it("should parse a symbol and skip trailing spaces", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);

                parser.symbol("++").run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("++"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.symbol("++").run(
                    new State("+", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("++"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.symbol("++").run(
                    new State("++", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("++");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.symbol("++").run(
                    new State("++ /* foo */ --", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("++");
                        expect(State.equals(
                            state,
                            new State("--", new SourcePos("test", 1, 14), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 14),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("-")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("-")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("-")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
        });

        describe(".lexeme(parser)", function () {
            it("should run the parser and skip trailing spaces", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);
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

                parser.lexeme(p).run(
                    new State("a", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("a1");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.lexeme(p).run(
                    new State("a /* foo */ b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("a1");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 13), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 13),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.lexeme(p).run(
                    new State("b", SourcePos.init("test"), "none"),
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

                parser.lexeme(p).run(
                    new State("b /* foo */ b", SourcePos.init("test"), "none"),
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

                parser.lexeme(p).run(
                    new State("c", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.equal("c1");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                parser.lexeme(p).run(
                    new State("c /* foo */ b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("c1");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 12), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 12),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.lexeme(p).run(
                    new State("d", SourcePos.init("test"), "none"),
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

                parser.lexeme(p).run(
                    new State("d /* foo */ b", SourcePos.init("test"), "none"),
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

        describe(".whiteSpace", function () {
            it("should skip white spaces and comments", function () {
                var def1 = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser1 = makeTokenParser(def1);
                
                parser1.whiteSpace.run(
                    new State("abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                parser1.whiteSpace.run(
                    new State(" \t\n\r\f\vabc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 2, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 2, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser1.whiteSpace.run(
                    new State("// foo\n// bar\nabc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 3, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 3, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser1.whiteSpace.run(
                    new State("/* foo */ /* bar */ abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 21), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 21),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser1.whiteSpace.run(
                    new State("/* foo /* bar */ */ abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("*/ abc", new SourcePos("test", 1, 18), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 18),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("*")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("*")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("*")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                var def2 = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    true, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser2 = makeTokenParser(def2);
                
                parser2.whiteSpace.run(
                    new State("abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                parser2.whiteSpace.run(
                    new State(" \t\n\r\f\vabc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 2, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 2, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser2.whiteSpace.run(
                    new State("// foo\n// bar\nabc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 3, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 3, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser2.whiteSpace.run(
                    new State("/* foo */ /* bar */ abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 21), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 21),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser2.whiteSpace.run(
                    new State("/* foo /* bar */ */ abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 21), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 21),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                var def3 = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser3 = makeTokenParser(def3);
                
                parser3.whiteSpace.run(
                    new State("abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                parser3.whiteSpace.run(
                    new State(" \t\n\r\f\vabc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 2, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 2, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser3.whiteSpace.run(
                    new State("// foo\n// bar\nabc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("// foo\n// bar\nabc", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("/")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("/")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                parser3.whiteSpace.run(
                    new State("/* foo */ /* bar */ abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 21), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 21),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser3.whiteSpace.run(
                    new State("/* foo /* bar */ */ abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("*/ abc", new SourcePos("test", 1, 18), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 18),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("*")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("*")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                var def4 = new LanguageDef(
                    "", /* commentStart */
                    "", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser4 = makeTokenParser(def4);
                
                parser4.whiteSpace.run(
                    new State("abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                parser4.whiteSpace.run(
                    new State(" \t\n\r\f\vabc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 2, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 2, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser4.whiteSpace.run(
                    new State("// foo\n// bar\nabc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 3, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 3, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser4.whiteSpace.run(
                    new State("/* foo */ /* bar */ abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("/* foo */ /* bar */ abc", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("/")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("*")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );
                
                parser4.whiteSpace.run(
                    new State("/* foo /* bar */ */ abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("/* foo /* bar */ */ abc", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("/")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("*")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                var def5 = new LanguageDef(
                    "", /* commentStart */
                    "", /* commentEnd */
                    "", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser5 = makeTokenParser(def5);
                
                parser5.whiteSpace.run(
                    new State("abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                parser5.whiteSpace.run(
                    new State(" \t\n\r\f\vabc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("abc", new SourcePos("test", 2, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 2, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser5.whiteSpace.run(
                    new State("// foo\n// bar\nabc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("// foo\n// bar\nabc", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("/")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                parser5.whiteSpace.run(
                    new State("/* foo */ /* bar */ abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("/* foo */ /* bar */ abc", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("/")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );
                
                parser5.whiteSpace.run(
                    new State("/* foo /* bar */ */ abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.be.undefined;
                        expect(State.equals(
                            state,
                            new State("/* foo /* bar */ */ abc", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("/")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );
            });
        });
        
        describe(".parens(parser)", function () {
            it("should parse token between '(' and ')'", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);
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

                parser.parens(p).run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("("))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.parens(p).run(
                    new State("(ab", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(")"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("(a)b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("a2");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("( a) b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("a3");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("(bb", SourcePos.init("test"), "none"),
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

                parser.parens(p).run(
                    new State("(b)b", SourcePos.init("test"), "none"),
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

                parser.parens(p).run(
                    new State("( b) b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("(cb", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(")"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("(c)b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("c2");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("( c) b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("c3");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 5), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("(db", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("(d)b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("( d) b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );
            });
        });

        describe(".braces(parser)", function () {
            it("should parse token between '{' and '}'", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);
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

                parser.braces(p).run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("{"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.braces(p).run(
                    new State("{ab", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("}"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{a}b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("a2");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{ a} b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("a3");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{bb", SourcePos.init("test"), "none"),
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

                parser.braces(p).run(
                    new State("{b}b", SourcePos.init("test"), "none"),
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

                parser.braces(p).run(
                    new State("{ b} b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{cb", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("}"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{c}b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("c2");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{ c} b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("c3");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 5), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{db", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{d}b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{ d} b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );
            });
        });

        describe(".angles(parser)", function () {
            it("should parse token between '<' and '>'", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);
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

                parser.angles(p).run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("<"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.angles(p).run(
                    new State("<ab", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(">"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("<a>b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("a2");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("< a> b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("a3");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("<bb", SourcePos.init("test"), "none"),
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

                parser.angles(p).run(
                    new State("<b>b", SourcePos.init("test"), "none"),
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

                parser.angles(p).run(
                    new State("< b> b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("<cb", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(">"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("<c>b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("c2");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("< c> b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("c3");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 5), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("<db", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("<d>b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("< d> b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );
            });
        });

        describe(".brackets(parser)", function () {
            it("should parse token between '[' and ']'", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);
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

                parser.brackets(p).run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("["))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.brackets(p).run(
                    new State("[ab", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("]"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[a]b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("a2");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[ a] b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("a3");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[bb", SourcePos.init("test"), "none"),
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

                parser.brackets(p).run(
                    new State("[b]b", SourcePos.init("test"), "none"),
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

                parser.brackets(p).run(
                    new State("[ b] b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[cb", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("c")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("]"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[c]b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("c2");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[ c] b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal("c3");
                        expect(State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 5), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[db", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[d]b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[ d] b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );
            });
        });

        describe(".semi", function () {
            it("should parse semicolon", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);

                parser.semi.run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.semi.run(
                    new State(":", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(":")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.semi.run(
                    new State(";", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(";");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semi.run(
                    new State(";;", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(";");
                        expect(State.equals(
                            state,
                            new State(";", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(";")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(";")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(";")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semi.run(
                    new State("; ;", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(";");
                        expect(State.equals(
                            state,
                            new State(";", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(";")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(";")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(";")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
        });

        describe(".comma", function () {
            it("should parse comma", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);

                parser.comma.run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.comma.run(
                    new State(".", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.comma.run(
                    new State(",", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(",");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.comma.run(
                    new State(",,", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(",");
                        expect(State.equals(
                            state,
                            new State(",", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(",")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(",")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(",")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.comma.run(
                    new State(", ,", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(",");
                        expect(State.equals(
                            state,
                            new State(",", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(",")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(",")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(",")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
        });

        describe(".colon", function () {
            it("should parse colon", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);

                parser.colon.run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(":"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.colon.run(
                    new State(";", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(";")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(":"))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.colon.run(
                    new State(":", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(":");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.colon.run(
                    new State("::", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(":");
                        expect(State.equals(
                            state,
                            new State(":", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(":")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(":")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(":")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.colon.run(
                    new State(": :", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(":");
                        expect(State.equals(
                            state,
                            new State(":", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(":")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(":")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(":")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
        });

        describe(".dot", function () {
            it("should parse dot", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);

                parser.dot.run(
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("."))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.dot.run(
                    new State(",", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(",")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("."))
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.dot.run(
                    new State(".", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(".");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.dot.run(
                    new State("..", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(".");
                        expect(State.equals(
                            state,
                            new State(".", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.dot.run(
                    new State(". .", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.equal(".");
                        expect(State.equals(
                            state,
                            new State(".", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            });
        });
        
        describe(".semiSep(parser)", function () {
            it("should parse many tokens separated by ';'", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);
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

                parser.semiSep(p).run(
                    new State("aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["a1"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("cabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.deep.equal(["c1"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                parser.semiSep(p).run(
                    new State("dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.deep.equal([]);
                        expect(State.equals(
                            state,
                            new State("dabcd", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                parser.semiSep(p).run(
                    new State("a;aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["a1", "a3"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("a; /* foo */ aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["a1", "a14"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 15), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 15),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("a;babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("a;cabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["a1", "c3"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("a;dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );
                
                ["a", "b", "c", "d"].forEach(function (c) {
                    parser.semiSep(p).run(
                        new State("b;" + c + "abcd", SourcePos.init("test"), "none"),
                        throwError,
                        function (error) {
                            expect(ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                    ]
                                )
                            )).to.be.true;
                        },
                        throwError,
                        throwError
                    );
                });

                parser.semiSep(p).run(
                    new State("c;aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["c1", "a2"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("c;babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("c;cabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["c1", "c2"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("c;dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                ["a", "b", "c", "d"].forEach(function (c) {
                    parser.semiSep(p).run(
                        new State("d;" + c + "abcd", SourcePos.init("test"), "none"),
                        throwError,
                        throwError,
                        function (value, state, error) {
                            expect(value).to.deep.equal([]);
                            expect(State.equals(
                                state,
                                new State("d;" + c + "abcd", new SourcePos("test", 1, 1), "none")
                            )).to.be.true;
                            expect(ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 1),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            )).to.be.true;
                        },
                        throwError
                    );
                });
            });
        });

        describe(".semiSep1(parser)", function () {
            it("should parse one or more tokens separated by ';'", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);
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

                parser.semiSep1(p).run(
                    new State("aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["a1"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("cabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.deep.equal(["c1"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.semiSep1(p).run(
                    new State("a;aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["a1", "a3"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("a; /* foo */ aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["a1", "a14"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 15), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 15),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("a;babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("a;cabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["a1", "c3"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("a;dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );
                
                ["a", "b", "c", "d"].forEach(function (c) {
                    parser.semiSep1(p).run(
                        new State("b;" + c + "abcd", SourcePos.init("test"), "none"),
                        throwError,
                        function (error) {
                            expect(ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                    ]
                                )
                            )).to.be.true;
                        },
                        throwError,
                        throwError
                    );
                });

                parser.semiSep1(p).run(
                    new State("c;aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["c1", "a2"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("c;babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("c;cabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["c1", "c2"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("c;dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                ["a", "b", "c", "d"].forEach(function (c) {
                    parser.semiSep1(p).run(
                        new State("d;" + c + "abcd", SourcePos.init("test"), "none"),
                        throwError,
                        throwError,
                        throwError,
                        function (error) {
                            expect(ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 1),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            )).to.be.true;
                        }
                    );
                });
            });
        });

        describe(".commaSep(parser)", function () {
            it("should parse many tokens separated by ','", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);
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

                parser.commaSep(p).run(
                    new State("aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["a1"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("cabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.deep.equal(["c1"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                parser.commaSep(p).run(
                    new State("dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.deep.equal([]);
                        expect(State.equals(
                            state,
                            new State("dabcd", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                parser.commaSep(p).run(
                    new State("a,aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["a1", "a3"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("a, /* foo */ aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["a1", "a14"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 15), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 15),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("a,babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("a,cabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["a1", "c3"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("a,dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );
                
                ["a", "b", "c", "d"].forEach(function (c) {
                    parser.commaSep(p).run(
                        new State("b," + c + "abcd", SourcePos.init("test"), "none"),
                        throwError,
                        function (error) {
                            expect(ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                    ]
                                )
                            )).to.be.true;
                        },
                        throwError,
                        throwError
                    );
                });

                parser.commaSep(p).run(
                    new State("c,aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["c1", "a2"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("c,babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("c,cabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["c1", "c2"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("c,dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                ["a", "b", "c", "d"].forEach(function (c) {
                    parser.commaSep(p).run(
                        new State("d," + c + "abcd", SourcePos.init("test"), "none"),
                        throwError,
                        throwError,
                        function (value, state, error) {
                            expect(value).to.deep.equal([]);
                            expect(State.equals(
                                state,
                                new State("d," + c + "abcd", new SourcePos("test", 1, 1), "none")
                            )).to.be.true;
                            expect(ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 1),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            )).to.be.true;
                        },
                        throwError
                    );
                });
            });
        });

        describe(".commaSep1(parser)", function () {
            it("should parse one or more tokens separated by ','", function () {
                var def = new LanguageDef(
                    "/*", /* commentStart */
                    "*/", /* commentEnd */
                    "//", /* commentLine */
                    false, /* nestedComments */
                    undefined, /* identStart */
                    undefined, /* identLetter */
                    undefined, /* opStart */
                    undefined, /* opLetter */
                    ["var", "function"], /* reservedNames */
                    ["=", "@"], /* reservedOpNames */
                    true /* caseSensitive */
                );
                var parser = makeTokenParser(def);
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

                parser.commaSep1(p).run(
                    new State("aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["a1"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("cabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.deep.equal(["c1"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    }
                );

                parser.commaSep1(p).run(
                    new State("a,aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["a1", "a3"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("a, /* foo */ aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["a1", "a14"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 15), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 15),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("a,babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("a,cabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["a1", "c3"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("a,dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );
                
                ["a", "b", "c", "d"].forEach(function (c) {
                    parser.commaSep1(p).run(
                        new State("b," + c + "abcd", SourcePos.init("test"), "none"),
                        throwError,
                        function (error) {
                            expect(ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                    ]
                                )
                            )).to.be.true;
                        },
                        throwError,
                        throwError
                    );
                });

                parser.commaSep1(p).run(
                    new State("c,aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["c1", "a2"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("c,babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("c,cabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value).to.deep.equal(["c1", "c2"]);
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("c,dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("d")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                ["a", "b", "c", "d"].forEach(function (c) {
                    parser.commaSep1(p).run(
                        new State("d," + c + "abcd", SourcePos.init("test"), "none"),
                        throwError,
                        throwError,
                        throwError,
                        function (error) {
                            expect(ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 1),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            )).to.be.true;
                        }
                    );
                });
            });
        });
    });
});
