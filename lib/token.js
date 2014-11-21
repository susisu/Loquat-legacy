/*
 * Loquat / token.js
 * copyright (c) 2014 Susisu
 *
 * a helper to parse tokens
 */

"use strict";

function end () {
    module.exports = Object.freeze({
        "LanguageDef": LanguageDef,
        "TokenParser": TokenParser
    });
}

var lq = Object.freeze({
});


function LanguageDef (commentStart, commentEnd, commentLine, nestedComments,
        identStart, identLetter, opStart, opLetter,
        reservedNames, reservedOpNames, caseSensitive) {
    this.commentStart    = commentStart;
    this.commentEnd      = commentEnd;
    this.commentLine     = commentLine;
    this.nestedComments  = nestedComments;
    this.identStart      = identStart;
    this.identLetter     = identLetter;
    this.opStart         = opStart;
    this.opLetter        = opLetter;
    this.reservedNames   = reservedNames;
    this.reservedOpNames = reservedOpNames;
    this.caseSensitive   = caseSensitive;
}

function TokenParser (identifier, reserved, operator, reservedOp,
        charLiteral, stringLiteral, natural, integer, float, naturalOrFloat, decimal, hexadecimal, octal, symbol,
        lexeme, whiteSpace, parens, braces, angles, brackets,
        semi, comma, colon, dot, semiSep, semiSep1, commaSep, commaSep1) {
    this.identifier     = identifier;
    this.reserved       = reserved;
    this.operator       = operator;
    this.reservedOp     = reservedOp;
    this.charLiteral    = charLiteral;
    this.stringLiteral  = stringLiteral;
    this.natural        = natural;
    this.integer        = integer;
    this.float          = float;
    this.naturalOrFloat = naturalOrFloat;
    this.decimal        = decimal;
    this.hexadecimal    = hexadecimal;
    this.octal          = octal;
    this.symbol         = symbol;
    this.lexeme         = lexeme;
    this.whiteSpace     = whiteSpace;
    this.parens         = parens;
    this.braces         = braces;
    this.angles         = angles;
    this.brackets       = brackets;
    this.semi           = semi;
    this.comma          = comma;
    this.colon          = colon;
    this.dot            = this.dot;
    this.semiSep        = semiSep;
    this.semiSep1       = semiSep1;
    this.commaSep       = commaSep;
    this.commaSep1      = commaSep1;
}


end();
