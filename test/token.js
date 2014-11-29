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
    });
});
