/*
 * Loquat.test / token.js
 * copyright (c) 2014 Susisu
 */

var should = require("should");

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
            def.hasOwnProperty("commentStart").should.be.ok;
            def.hasOwnProperty("commentEnd").should.be.ok;
            def.hasOwnProperty("commentLine").should.be.ok;
            def.hasOwnProperty("nestedComments").should.be.ok;
            def.hasOwnProperty("identStart").should.be.ok;
            def.hasOwnProperty("identLetter").should.be.ok;
            def.hasOwnProperty("opStart").should.be.ok;
            def.hasOwnProperty("opLetter").should.be.ok;
            def.hasOwnProperty("reservedNames").should.be.ok;
            def.hasOwnProperty("reservedOpNames").should.be.ok;
            def.hasOwnProperty("caseSensitive").should.be.ok;
        });

        describe("constructor(ommentStart, commentEnd, commentLine, nestedComments, "
                + "identStart, identLetter, opStart, opLetter, "
                + "reservedNames, reservedOpNames, caseSensitive)", function () {
            it("should create a new LanguageDef object", function () {
                var def = new LanguageDef("commentStart", "commentEnd", "commentLine", "nestedComments",
                    "identStart", "identLetter", "opStart", "opLetter",
                    "reservedNames", "reservedOpNames", "caseSensitive");
                def.commentStart.should.equal("commentStart");
                def.commentEnd.should.equal("commentEnd");
                def.commentLine.should.equal("commentLine");
                def.nestedComments.should.equal("nestedComments");
                def.identStart.should.equal("identStart");
                def.identLetter.should.equal("identLetter");
                def.opStart.should.equal("opStart");
                def.opLetter.should.equal("opLetter");
                def.reservedNames.should.equal("reservedNames");
                def.reservedOpNames.should.equal("reservedOpNames");
                def.caseSensitive.should.equal("caseSensitive");
            });
        });
    });

    describe("TokenParser", function () {
        it("should correctly have fields", function () {
            var tokenp = new TokenParser("identifier", "reserved", "operator", "reservedOp",
                "charLiteral", "stringLiteral", "natural", "integer", "float", "naturalOrFloat", "decimal", "hexadecimal", "octal",
                "symbol", "lexeme", "whiteSpace", "parens", "braces", "angles", "brackets",
                "semi", "comma", "colon", "dot", "semiSep", "semiSep1", "commaSep", "commaSep1");
            tokenp.hasOwnProperty("identifier").should.be.ok;
            tokenp.hasOwnProperty("reserved").should.be.ok;
            tokenp.hasOwnProperty("operator").should.be.ok;
            tokenp.hasOwnProperty("reservedOp").should.be.ok;
            tokenp.hasOwnProperty("charLiteral").should.be.ok;
            tokenp.hasOwnProperty("stringLiteral").should.be.ok;
            tokenp.hasOwnProperty("natural").should.be.ok;
            tokenp.hasOwnProperty("integer").should.be.ok;
            tokenp.hasOwnProperty("float").should.be.ok;
            tokenp.hasOwnProperty("naturalOrFloat").should.be.ok;
            tokenp.hasOwnProperty("decimal").should.be.ok;
            tokenp.hasOwnProperty("hexadecimal").should.be.ok;
            tokenp.hasOwnProperty("octal").should.be.ok;
            tokenp.hasOwnProperty("symbol").should.be.ok;
            tokenp.hasOwnProperty("lexeme").should.be.ok;
            tokenp.hasOwnProperty("whiteSpace").should.be.ok;
            tokenp.hasOwnProperty("parens").should.be.ok;
            tokenp.hasOwnProperty("braces").should.be.ok;
            tokenp.hasOwnProperty("angles").should.be.ok;
            tokenp.hasOwnProperty("brackets").should.be.ok;
            tokenp.hasOwnProperty("semi").should.be.ok;
            tokenp.hasOwnProperty("comma").should.be.ok;
            tokenp.hasOwnProperty("colon").should.be.ok;
            tokenp.hasOwnProperty("dot").should.be.ok;
            tokenp.hasOwnProperty("semiSep").should.be.ok;
            tokenp.hasOwnProperty("semiSep1").should.be.ok;
            tokenp.hasOwnProperty("commaSep").should.be.ok;
            tokenp.hasOwnProperty("commaSep1").should.be.ok;
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
                tokenp.identifier.should.equal("identifier");
                tokenp.reserved.should.equal("reserved");
                tokenp.operator.should.equal("operator");
                tokenp.reservedOp.should.equal("reservedOp");
                tokenp.charLiteral.should.equal("charLiteral");
                tokenp.stringLiteral.should.equal("stringLiteral");
                tokenp.natural.should.equal("natural");
                tokenp.integer.should.equal("integer");
                tokenp.float.should.equal("float");
                tokenp.naturalOrFloat.should.equal("naturalOrFloat");
                tokenp.decimal.should.equal("decimal");
                tokenp.hexadecimal.should.equal("hexadecimal");
                tokenp.octal.should.equal("octal");
                tokenp.symbol.should.equal("symbol");
                tokenp.lexeme.should.equal("lexeme");
                tokenp.whiteSpace.should.equal("whiteSpace");
                tokenp.parens.should.equal("parens");
                tokenp.braces.should.equal("braces");
                tokenp.angles.should.equal("angles");
                tokenp.brackets.should.equal("brackets");
                tokenp.semi.should.equal("semi");
                tokenp.comma.should.equal("comma");
                tokenp.colon.should.equal("colon");
                tokenp.dot.should.equal("dot");
                tokenp.semiSep.should.equal("semiSep");
                tokenp.semiSep1.should.equal("semiSep1");
                tokenp.commaSep.should.equal("commaSep");
                tokenp.commaSep1.should.equal("commaSep1");
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "identifier")
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser1.identifier.run(
                    new State("0foo", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("0")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "identifier")
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser1.identifier.run(
                    new State("foo", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("foo");
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser1.identifier.run(
                    new State("f00", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("f00");
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser1.identifier.run(
                    new State("foo bar", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("foo");
                        State.equals(
                            state,
                            new State("bar", new SourcePos("test", 1, 5), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, "reserved word " + lq.util.show("var"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser1.identifier.run(
                    new State("function", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 9),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, "reserved word " + lq.util.show("function"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser1.identifier.run(
                    new State("Var", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("Var");
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "identifier")
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser2.identifier.run(
                    new State("0foo", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("0")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "identifier")
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser2.identifier.run(
                    new State("foo", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("foo");
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser2.identifier.run(
                    new State("f00", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("f00");
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser2.identifier.run(
                    new State("foo bar", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("foo");
                        State.equals(
                            state,
                            new State("bar", new SourcePos("test", 1, 5), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, "reserved word " + lq.util.show("var"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser2.identifier.run(
                    new State("function", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 9),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, "reserved word " + lq.util.show("function"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser2.identifier.run(
                    new State("Var", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter or digit"),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, "reserved word " + lq.util.show("Var"))
                                ]
                            )
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("var"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser1.reserved("var").run(
                    new State("foo", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("f")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("var"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser1.reserved("var").run(
                    new State("val", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("l")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("var"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser1.reserved("var").run(
                    new State("var", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser1.reserved("var").run(
                    new State("var const", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("const", new SourcePos("test", 1, 5), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show("v")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of " + lq.util.show("var")),
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser1.reserved("var").run(
                    new State("VAR", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("V")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("var")),
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser1.reserved("const").run(
                    new State("const", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 6), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("var"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser2.reserved("var").run(
                    new State("foo", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("f")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("f")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("var"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser2.reserved("var").run(
                    new State("val", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("l")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("l")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("var"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser2.reserved("var").run(
                    new State("var", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser2.reserved("var").run(
                    new State("var const", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("const", new SourcePos("test", 1, 5), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show("v")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of " + lq.util.show("var")),
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser2.reserved("var").run(
                    new State("VAR", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser2.reserved("const").run(
                    new State("const", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 6), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator")
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.operator.run(
                    new State(":+", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(":")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator")
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.operator.run(
                    new State("++", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("++");
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.operator.run(
                    new State("+:", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("+:");
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.operator.run(
                    new State("++ ==", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("++");
                        State.equals(
                            state,
                            new State("==", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, "reserved operator " + lq.util.show("="))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.operator.run(
                    new State("@", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, "reserved operator " + lq.util.show("@"))
                                ]
                            )
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("="))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.reservedOp("=").run(
                    new State("+", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("+")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("="))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.reservedOp("=").run(
                    new State("=", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.reservedOp("=").run(
                    new State("= +", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("+", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.UNEXPECT, lq.util.show("=")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "end of " + lq.util.show("=")),
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.reservedOp("->").run(
                    new State("->", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("+")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("->"))
                                ]
                            )
                        ).should.be.ok;
                    }
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "natural")
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.natural.run(
                    new State("0x123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(parseInt("123456789ABCDEF", 16));
                        State.equals(
                            state,
                            new State("G", new SourcePos("test", 1, 18), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.natural.run(
                    new State("0o123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(parseInt("1234567", 8));
                        State.equals(
                            state,
                            new State("89ABCDEFG", new SourcePos("test", 1, 10), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.natural.run(
                    new State("0123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(0123456789);
                        State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 11), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.natural.run(
                    new State("0.1", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(0);
                        State.equals(
                            state,
                            new State(".1", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.natural.run(
                    new State("123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(123456789);
                        State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 10), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
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
                        ).should.be.ok;
                    }
                );

                parser.integer.run(
                    new State("-", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("+", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("-0x123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(-parseInt("123456789ABCDEF", 16));
                        State.equals(
                            state,
                            new State("G", new SourcePos("test", 1, 19), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.integer.run(
                    new State("-0o123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(-parseInt("1234567", 8));
                        State.equals(
                            state,
                            new State("89ABCDEFG", new SourcePos("test", 1, 11), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("-0123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(-0123456789);
                        State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 12), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("-0.1", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(-0);
                        State.equals(
                            state,
                            new State(".1", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("-123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(-123456789);
                        State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 11), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("+0x123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(parseInt("123456789ABCDEF", 16));
                        State.equals(
                            state,
                            new State("G", new SourcePos("test", 1, 19), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.integer.run(
                    new State("+0o123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(parseInt("1234567", 8));
                        State.equals(
                            state,
                            new State("89ABCDEFG", new SourcePos("test", 1, 11), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("+0123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(0123456789);
                        State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 12), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("+0.1", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(0);
                        State.equals(
                            state,
                            new State(".1", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("+123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(123456789);
                        State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 11), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("0x123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(parseInt("123456789ABCDEF", 16));
                        State.equals(
                            state,
                            new State("G", new SourcePos("test", 1, 18), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.integer.run(
                    new State("0o123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(parseInt("1234567", 8));
                        State.equals(
                            state,
                            new State("89ABCDEFG", new SourcePos("test", 1, 10), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("0123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(0123456789);
                        State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 11), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("0.1", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(0);
                        State.equals(
                            state,
                            new State(".1", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.integer.run(
                    new State("123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(123456789);
                        State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 10), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "number")
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.naturalOrFloat.run(
                    new State("0x123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, [parseInt("0123456789ABCDEF", 16)]).should.be.ok;
                        State.equals(
                            state,
                            new State("G", new SourcePos("test", 1, 18), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("0o123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, [parseInt("01234567", 8)]).should.be.ok;
                        State.equals(
                            state,
                            new State("89ABCDEFG", new SourcePos("test", 1, 10), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("0123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, [0123456789]).should.be.ok;
                        State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 11), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("01234.56789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, [undefined, 1234.56789]).should.be.ok;
                        State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 12), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("0123456789e-4ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, [undefined, 123456789e-4]).should.be.ok;
                        State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 14), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("01234.56789e-6ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, [undefined, 1234.56789e-6]).should.be.ok;
                        State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 15), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, [123456789]).should.be.ok;
                        State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 10), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("1234.56789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, [undefined, 1234.56789]).should.be.ok;
                        State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 11), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("123456789e-4ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, [undefined, 123456789e-4]).should.be.ok;
                        State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 13), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.naturalOrFloat.run(
                    new State("1234.56789e-6ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, [undefined, 1234.56789e-6]).should.be.ok;
                        State.equals(
                            state,
                            new State("ABCDEFG", new SourcePos("test", 1, 14), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit")
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.decimal.run(
                    new State("0", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(0);
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.decimal.run(
                    new State("0123456789A", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(0123456789);
                        State.equals(
                            state,
                            new State("A", new SourcePos("test", 1, 11), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 11),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("A")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "digit")
                                ]
                            )
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.hexadecimal.run(
                    new State("x", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.hexadecimal.run(
                    new State("X", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.hexadecimal.run(
                    new State("x0", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(0);
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.hexadecimal.run(
                    new State("X0", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(0);
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.hexadecimal.run(
                    new State("x0123456789ABCDEFG", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(parseInt("0123456789ABCDEF", 16));
                        State.equals(
                            state,
                            new State("G", new SourcePos("test", 1, 18), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 18),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("G")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.hexadecimal.run(
                    new State("x0123456789abcdefg", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(parseInt("0123456789ABCDEF", 16));
                        State.equals(
                            state,
                            new State("g", new SourcePos("test", 1, 18), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 18),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("g")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "hexadecimal digit")
                                ]
                            )
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.octal.run(
                    new State("o", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.octal.run(
                    new State("O", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.octal.run(
                    new State("o0", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(0);
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.octal.run(
                    new State("O0", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(0);
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.octal.run(
                    new State("o0123456789", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(parseInt("01234567", 8));
                        State.equals(
                            state,
                            new State("89", new SourcePos("test", 1, 10), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 10),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("8")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "octal digit")
                                ]
                            )
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("++"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.symbol("++").run(
                    new State("+", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("++"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.symbol("++").run(
                    new State("++", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("++");
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.symbol("++").run(
                    new State("++ /* foo */ --", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("++");
                        State.equals(
                            state,
                            new State("--", new SourcePos("test", 1, 14), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        value.should.equal("a1");
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.lexeme(p).run(
                    new State("a /* foo */ b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("a1");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 13), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.lexeme(p).run(
                    new State("b", SourcePos.init("test"), "none"),
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

                parser.lexeme(p).run(
                    new State("b /* foo */ b", SourcePos.init("test"), "none"),
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

                parser.lexeme(p).run(
                    new State("c", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        value.should.equal("c1");
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError
                );

                parser.lexeme(p).run(
                    new State("c /* foo */ b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("c1");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 12), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                            )
                        ).should.be.ok;
                    }
                );

                parser.lexeme(p).run(
                    new State("d /* foo */ b", SourcePos.init("test"), "none"),
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
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError
                );

                parser1.whiteSpace.run(
                    new State(" \t\n\r\f\vabc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 2, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser1.whiteSpace.run(
                    new State("// foo\n// bar\nabc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 3, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser1.whiteSpace.run(
                    new State("/* foo */ /* bar */ abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 21), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser1.whiteSpace.run(
                    new State("/* foo /* bar */ */ abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("*/ abc", new SourcePos("test", 1, 18), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError
                );

                parser2.whiteSpace.run(
                    new State(" \t\n\r\f\vabc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 2, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser2.whiteSpace.run(
                    new State("// foo\n// bar\nabc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 3, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser2.whiteSpace.run(
                    new State("/* foo */ /* bar */ abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 21), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser2.whiteSpace.run(
                    new State("/* foo /* bar */ */ abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 21), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );

                parser3.whiteSpace.run(
                    new State(" \t\n\r\f\vabc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 2, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 2, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        ).should.be.ok;
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
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("// foo\n// bar\nabc", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("/")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("/")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );

                parser3.whiteSpace.run(
                    new State("/* foo */ /* bar */ abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 21), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 21),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser3.whiteSpace.run(
                    new State("/* foo /* bar */ */ abc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("*/ abc", new SourcePos("test", 1, 18), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 18),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("*")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("*")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        ).should.be.ok;
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
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );

                parser4.whiteSpace.run(
                    new State(" \t\n\r\f\vabc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 2, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 2, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser4.whiteSpace.run(
                    new State("// foo\n// bar\nabc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 3, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 3, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        ).should.be.ok;
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
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("/* foo */ /* bar */ abc", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("/")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("*")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );
                
                parser4.whiteSpace.run(
                    new State("/* foo /* bar */ */ abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("/* foo /* bar */ */ abc", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("/")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("*")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        ).should.be.ok;
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
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );

                parser5.whiteSpace.run(
                    new State(" \t\n\r\f\vabc", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 2, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 2, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        ).should.be.ok;
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
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("// foo\n// bar\nabc", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("/")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );

                parser5.whiteSpace.run(
                    new State("/* foo */ /* bar */ abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("/* foo */ /* bar */ abc", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("/")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );
                
                parser5.whiteSpace.run(
                    new State("/* foo /* bar */ */ abc", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        (value === undefined).should.be.ok;
                        State.equals(
                            state,
                            new State("/* foo /* bar */ */ abc", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("/")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("("))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.parens(p).run(
                    new State("(ab", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(")"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("(a)b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("a2");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("( a) b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("a3");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 6), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("(bb", SourcePos.init("test"), "none"),
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

                parser.parens(p).run(
                    new State("(b)b", SourcePos.init("test"), "none"),
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

                parser.parens(p).run(
                    new State("( b) b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("(cb", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("(c)b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("c2");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("( c) b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("c3");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 5), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("(db", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("(d)b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.parens(p).run(
                    new State("( d) b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("{"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.braces(p).run(
                    new State("{ab", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("}"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{a}b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("a2");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{ a} b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("a3");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 6), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{bb", SourcePos.init("test"), "none"),
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

                parser.braces(p).run(
                    new State("{b}b", SourcePos.init("test"), "none"),
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

                parser.braces(p).run(
                    new State("{ b} b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{cb", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{c}b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("c2");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{ c} b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("c3");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 5), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{db", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{d}b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.braces(p).run(
                    new State("{ d} b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("<"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.angles(p).run(
                    new State("<ab", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(">"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("<a>b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("a2");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("< a> b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("a3");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 6), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("<bb", SourcePos.init("test"), "none"),
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

                parser.angles(p).run(
                    new State("<b>b", SourcePos.init("test"), "none"),
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

                parser.angles(p).run(
                    new State("< b> b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("<cb", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("<c>b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("c2");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("< c> b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("c3");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 5), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("<db", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("<d>b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.angles(p).run(
                    new State("< d> b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("["))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.brackets(p).run(
                    new State("[ab", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("b")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("]"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[a]b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("a2");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[ a] b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("a3");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 6), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[bb", SourcePos.init("test"), "none"),
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

                parser.brackets(p).run(
                    new State("[b]b", SourcePos.init("test"), "none"),
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

                parser.brackets(p).run(
                    new State("[ b] b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[cb", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[c]b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("c2");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[ c] b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal("c3");
                        State.equals(
                            state,
                            new State("b", new SourcePos("test", 1, 5), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[db", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[d]b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.brackets(p).run(
                    new State("[ d] b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.semi.run(
                    new State(":", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(":")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.semi.run(
                    new State(";", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(";");
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semi.run(
                    new State(";;", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(";");
                        State.equals(
                            state,
                            new State(";", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semi.run(
                    new State("; ;", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(";");
                        State.equals(
                            state,
                            new State(";", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.comma.run(
                    new State(".", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.comma.run(
                    new State(",", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(",");
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.comma.run(
                    new State(",,", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(",");
                        State.equals(
                            state,
                            new State(",", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.comma.run(
                    new State(", ,", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(",");
                        State.equals(
                            state,
                            new State(",", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(":"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.colon.run(
                    new State(";", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(";")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(":"))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.colon.run(
                    new State(":", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(":");
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.colon.run(
                    new State("::", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(":");
                        State.equals(
                            state,
                            new State(":", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.colon.run(
                    new State(": :", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(":");
                        State.equals(
                            state,
                            new State(":", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("."))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.dot.run(
                    new State(",", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show(",")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("."))
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.dot.run(
                    new State(".", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(".");
                        State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.dot.run(
                    new State("..", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(".");
                        State.equals(
                            state,
                            new State(".", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.dot.run(
                    new State(". .", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        value.should.equal(".");
                        State.equals(
                            state,
                            new State(".", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
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
                        ).should.be.ok;
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
                        lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("cabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );

                parser.semiSep(p).run(
                    new State("dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, []).should.be.ok;
                        State.equals(
                            state,
                            new State("dabcd", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );

                parser.semiSep(p).run(
                    new State("a;aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["a1", "a3"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("a; /* foo */ aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["a1", "a14"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 15), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 15),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("a;babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("a;cabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["a1", "c3"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("a;dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
                
                ["a", "b", "c", "d"].forEach(function (c) {
                    parser.semiSep(p).run(
                        new State("b;" + c + "abcd", SourcePos.init("test"), "none"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });

                parser.semiSep(p).run(
                    new State("c;aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["c1", "a2"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("c;babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("c;cabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["c1", "c2"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep(p).run(
                    new State("c;dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
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
                            lq.util.ArrayUtil.equals(value, []).should.be.ok;
                            State.equals(
                                state,
                                new State("d;" + c + "abcd", new SourcePos("test", 1, 1), "none")
                            ).should.be.ok;
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 1),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            ).should.be.ok;
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
                        lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("cabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.semiSep1(p).run(
                    new State("a;aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["a1", "a3"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("a; /* foo */ aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["a1", "a14"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 15), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 15),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("a;babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("a;cabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["a1", "c3"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("a;dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
                
                ["a", "b", "c", "d"].forEach(function (c) {
                    parser.semiSep1(p).run(
                        new State("b;" + c + "abcd", SourcePos.init("test"), "none"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });

                parser.semiSep1(p).run(
                    new State("c;aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["c1", "a2"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("c;babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("c;cabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["c1", "c2"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(";"))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.semiSep1(p).run(
                    new State("c;dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
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
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 1),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            ).should.be.ok;
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
                        lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("cabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );

                parser.commaSep(p).run(
                    new State("dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, []).should.be.ok;
                        State.equals(
                            state,
                            new State("dabcd", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );

                parser.commaSep(p).run(
                    new State("a,aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["a1", "a3"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("a, /* foo */ aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["a1", "a14"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 15), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 15),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("a,babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("a,cabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["a1", "c3"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("a,dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
                
                ["a", "b", "c", "d"].forEach(function (c) {
                    parser.commaSep(p).run(
                        new State("b," + c + "abcd", SourcePos.init("test"), "none"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });

                parser.commaSep(p).run(
                    new State("c,aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["c1", "a2"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("c,babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("c,cabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["c1", "c2"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep(p).run(
                    new State("c,dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
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
                            lq.util.ArrayUtil.equals(value, []).should.be.ok;
                            State.equals(
                                state,
                                new State("d," + c + "abcd", new SourcePos("test", 1, 1), "none")
                            ).should.be.ok;
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 1),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            ).should.be.ok;
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
                        lq.util.ArrayUtil.equals(value, ["a1"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "csuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("cabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["c1"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 1), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "esuc"),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                ]
                            )
                        ).should.be.ok;
                    }
                );

                parser.commaSep1(p).run(
                    new State("a,aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["a1", "a3"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 4), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("a, /* foo */ aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["a1", "a14"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 15), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 15),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("a,babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("a,cabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["a1", "c3"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("a,dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );
                
                ["a", "b", "c", "d"].forEach(function (c) {
                    parser.commaSep1(p).run(
                        new State("b," + c + "abcd", SourcePos.init("test"), "none"),
                        throwError,
                        function (error) {
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 2),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                    ]
                                )
                            ).should.be.ok;
                        },
                        throwError,
                        throwError
                    );
                });

                parser.commaSep1(p).run(
                    new State("c,aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["c1", "a2"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 3), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("c,babcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("c,cabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        lq.util.ArrayUtil.equals(value, ["c1", "c2"]).should.be.ok;
                        State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        ).should.be.ok;
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("a")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(","))
                                ]
                            )
                        ).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.commaSep1(p).run(
                    new State("c,dabcd", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        ParseError.equals(
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
                        ).should.be.ok;
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
                            ParseError.equals(
                                error,
                                new ParseError(
                                    new SourcePos("test", 1, 1),
                                    [
                                        new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")
                                    ]
                                )
                            ).should.be.ok;
                        }
                    );
                });
            });
        });
    });
});
