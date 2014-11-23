/*
 * Loquat.test / token.js
 * copyright (c) 2014 Susisu
 */

var should = require("should");

var lq = Object.freeze({
    "token" : require("../lib/token")
});


describe("token", function () {
    var LanguageDef = lq.token.LanguageDef;
    var TokenParser = lq.token.TokenParser;
    var makeTokenParser = lq.token.makeTokenParser;

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
});
