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
});
