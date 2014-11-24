/*
 * Loquat / token.js
 * copyright (c) 2014 Susisu
 *
 * a helper to parse tokens
 */

"use strict";

function end () {
    module.exports = Object.freeze({
        "LanguageDef"    : LanguageDef,
        "TokenParser"    : TokenParser,
        "makeTokenParser": makeTokenParser
    });
}

var lq = Object.freeze({
    "char"      : require("./char"),
    "combinator": require("./combinator"),
    "prim"      : require("./prim"),
    "util"      : require("./util")
});


function LanguageDef (commentStart, commentEnd, commentLine, nestedComments,
        identStart, identLetter, opStart, opLetter,
        reservedNames, reservedOpNames, caseSensitive) {
    this.commentStart    = commentStart;    /* String */
    this.commentEnd      = commentEnd;      /* String */
    this.commentLine     = commentLine;     /* String */
    this.nestedComments  = nestedComments;  /* Boolean */
    this.identStart      = identStart;      /* Parser */
    this.identLetter     = identLetter;     /* Parser */
    this.opStart         = opStart;         /* Parser */
    this.opLetter        = opLetter;        /* Parser */
    this.reservedNames   = reservedNames;   /* Array<String> */
    this.reservedOpNames = reservedOpNames; /* Array<String> */
    this.caseSensitive   = caseSensitive;   /* Boolean */
}

function TokenParser (identifier, reserved, operator, reservedOp,
        charLiteral, stringLiteral, natural, integer, float, naturalOrFloat, decimal, hexadecimal, octal,
        symbol, lexeme, whiteSpace, parens, braces, angles, brackets,
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
    this.dot            = dot;
    this.semiSep        = semiSep;
    this.semiSep1       = semiSep1;
    this.commaSep       = commaSep;
    this.commaSep1      = commaSep1;
}


function makeTokenParser (languageDef) {
    var simpleSpace = lq.combinator.skipMany1(lq.char.satisfy(lq.util.CharUtil.isSpace));
    var oneLineComment = lq.prim.then(
        lq.prim.try(lq.char.string(languageDef.commentLine)),
        lq.prim.then(
            lq.prim.skipMany(lq.char.satisfy(function (c) { return c !== "\n"; })),
            lq.prim.pure(undefined)
        )
    );
    var inCommentMulti = new lq.prim.LazyParser(function () {
        var startEnd = lq.util.ArrayUtil.nub((languageDef.commentEnd + languageDef.commentStart).split("")).join("");
        return lq.prim.label(
            lq.prim.mplus(
                lq.prim.then(lq.prim.try(lq.char.string(languageDef.commentEnd)), lq.prim.pure(undefined)),
                lq.prim.mplus(
                    lq.prim.then(multiLineComment, inCommentMulti),
                    lq.prim.mplus(
                        lq.prim.then(lq.combinator.skipMany1(lq.char.noneOf(startEnd)), inCommentMulti),
                        lq.prim.then(lq.char.oneOf(startEnd), inCommentMulti)
                    )
                )
            ),
            "end of comment"
        );
    });
    var inCommentSingle = new lq.prim.LazyParser(function () {
        var startEnd = lq.util.ArrayUtil.nub((languageDef.commentEnd + languageDef.commentStart).split("")).join("");
        return lq.prim.label(
            lq.prim.mplus(
                lq.prim.then(lq.prim.try(lq.char.string(languageDef.commentEnd)), lq.prim.pure(undefined)),
                lq.prim.mplus(
                    lq.prim.then(lq.combinator.skipMany1(lq.char.noneOf(startEnd)), inCommentSingle),
                    lq.prim.then(lq.char.oneOf(startEnd), inCommentSingle)
                )
            ),
            "end of comment"
        );
    });
    var inComment = languageDef.nestedComments ? inCommentMulti : inCommentSingle;
    var multiLineComment = lq.prim.then(
        lq.prim.try(lq.char.string(languageDef.commentStart)),
        inComment
    );
    var noOneLineComment = languageDef.commentLine === "";
    var noMultiLineComment = languageDef.commentStart === "";
    var whiteSpace = lq.prim.skipMany(
        lq.prim.label(
              noOneLineComment && noMultiLineComment ? simpleSpace
            : noOneLineComment   ? lq.prim.mplus(simpleSpace, multiLineComment)
            : noMultiLineComment ? lq.prim.mplus(simpleSpace, oneLineComment)
            : lq.prim.mplus(simpleSpace, lq.prim.mplus(oneLineComment, multiLineComment)),
            ""
        )
    );
    function lexeme (parser) {
        return lq.prim.bind(
            parser,
            function (x) {
                return lq.prim.then(
                    whiteSpace,
                    lq.prim.pure(x)
                );
            }
        );
    }
    function symbol (name) {
        return lexeme(lq.char.string(name));
    }

    function parens (parser) {
        return lq.combinator.between(lq.char.char("("), lq.char.char(")"), parser);
    }
    function braces (parser) {
        return lq.combinator.between(lq.char.char("{"), lq.char.char("}"), parser);
    }
    function angles (parser) {
        return lq.combinator.between(lq.char.char("<"), lq.char.char(">"), parser);
    }
    function brackets (parser) {
        return lq.combinator.between(lq.char.char("["), lq.char.char("]"), parser);
    }

    var semi  = symbol(";");
    var comma = symbol(",");
    var dot   = symbol(".");
    var colon = symbol(":");
    function semiSep (parser) {
        return lq.combinator.sepBy(parser, semi);
    }
    function semiSep1 (parser) {
        return lq.combinator.sepBy1(parser, semi);
    }
    function commaSep (parser) {
        return lq.combinator.sepBy(parser, comma);
    }
    function commaSep1 (parser) {
        return lq.combinator.sepBy1(parser, comma);
    }

    function number (base, baseDigit) {
        return lq.prim.bind(
            lq.char.manyChar1(baseDigit),
            function (digits) {
                return lq.prim.pure(parseInt(digits, base));
            }
        );
    }
    var decimal = number(10, lq.char.digit);
    var hexadecimal = lq.prim.then(
        lq.char.oneOf("xX"),
        number(16, lq.char.hexDigit)
    );
    var octal = lq.prim.then(
        lq.char.oneOf("oO"),
        number(8, lq.char.octDigit)
    );
    var zeroNumber = lq.prim.label(
        lq.prim.then(
            lq.char.char("0"),
            lq.prim.mplus(
                hexadecimal,
                lq.prim.mplus(
                    octal,
                    lq.prim.mplus(
                        decimal,
                        lq.prim.pure(0)
                    )
                )
            )
        ),
        ""
    );
    var nat = lq.prim.mplus(zeroNumber, decimal);
    function id (x) {
        return x;
    }
    function negate (x) {
        return -x;
    }
    var sign = lq.prim.mplus(
        lq.prim.then(lq.char.char("-"), lq.prim.pure(negate)),
        lq.prim.mplus(
            lq.prim.then(lq.char.char("+"), lq.prim.pure(id)),
            lq.prim.pure(id)
        )
    );
    var int = lq.prim.bind(
        lexeme(sign),
        function (f) {
            return lq.prim.bind(
                nat,
                function (n) {
                    return lq.prim.pure(f(n));
                }
            );
        }
    );
    var fraction = lq.prim.label(
        lq.prim.then(
            lq.char.char("."),
            lq.prim.bind(
                lq.prim.label(lq.char.manyChar1(lq.char.digit), "fraction"),
                function (digits) {
                    return lq.prim.pure(parseFloat("0." + digits));
                }
            )
        ),
        "fraction"
    );
    var exponent = lq.prim.label(
        lq.prim.then(
            lq.char.oneOf("eE"),
            lq.prim.bind(
                sign,
                function (f) {
                    return lq.prim.bind(
                        lq.prim.label(decimal, "exponent"),
                        function (e) {
                            return lq.prim.pure(Math.pow(10, f(e)));
                        }
                    )
                }
            )
        ),
        "exponent"
    );
    function fractExponent (n) {
        return lq.prim.mplus(
            lq.prim.bind(
                fraction,
                function (fract) {
                    return lq.prim.bind(
                        lq.combinator.option(1.0, exponent),
                        function (expo) {
                            return lq.prim.pure((n + fract) * expo)
                        }
                    );
                }
            ),
            lq.prim.bind(
                exponent,
                function (expo) {
                    return lq.prim.pure(n * expo);
                }
            )
        );
    }
    var floating = lq.prim.bind(
        decimal,
        function (n) {
            return fractExponent(n);
        }
    );
    function fractFloat (n) {
        return lq.prim.bind(
            fractExponent(n),
            function (f) {
                return lq.prim.pure([undefined, f]);
            }
        );
    }
    var decimalFloat = lq.prim.bind(
        decimal,
        function (n) {
            return lq.combinator.option([n, undefined], fractFloat(n))
        }
    );
    var zeroNumFloat = lq.prim.mplus(
        lq.prim.bind(
            lq.prim.mplus(hexadecimal, octal),
            function (n) {
                return lq.prim.pure([n, undefined]);
            }
        ),
        lq.prim.mplus(
            decimalFloat,
            lq.prim.mplus(
                fractFloat(0),
                lq.prim.pure([0, undefined])
            )
        )
    );
    var natFloat = lq.prim.mplus(
        lq.prim.then(
            lq.char.char("0"),
            zeroNumFloat
        ),
        decimalFloat
    );
    var natural        = lq.prim.label(lexeme(nat), "natural");
    var integer        = lq.prim.label(lexeme(int), "integer");
    var float          = lq.prim.label(lexeme(floating), "float");
    var naturalOrFloat = lq.prim.label(lexeme(natFloat), "number");
    
    var escMap = {
        "a" : "\u0007",
        "b" : "\b",
        "f" : "\f",
        "n" : "\n",
        "r" : "\r",
        "t" : "\t",
        "v" : "\v",
        "\\": "\\",
        "\"": "\"",
        "'" : "'"
    };
    var asciiMap = {
        "BS" : "\u0008",
        "HT" : "\u0009",
        "LF" : "\u000a",
        "VT" : "\u000b",
        "FF" : "\u000c",
        "CR" : "\u000d",
        "SO" : "\u000e",
        "SI" : "\u000f",
        "EM" : "\u0019",
        "FS" : "\u001c",
        "GS" : "\u001d",
        "RS" : "\u001e",
        "US" : "\u001f",
        "SP" : "\u0020",
        "NUL": "\u0000",
        "SOH": "\u0001",
        "STX": "\u0002",
        "ETX": "\u0003",
        "EOT": "\u0004",
        "ENQ": "\u0005",
        "ACK": "\u0006",
        "BEL": "\u0007",
        "DLE": "\u0010",
        "DC1": "\u0011",
        "DC2": "\u0012",
        "DC3": "\u0013",
        "DC4": "\u0014",
        "NAK": "\u0015",
        "SYN": "\u0016",
        "ETB": "\u0017",
        "CAN": "\u0018",
        "SUB": "\u001a",
        "ESC": "\u001b",
        "DEL": "\u007f"
    };
    var charEsc = lq.combinator.choice(
        Object.keys(escMap).sort().map(function (c) {
            return lq.prim.then(lq.char.char(c), lq.prim.pure(escMap[c])); 
        })
    );
    var charNum = lq.prim.then(
        lq.prim.mplus(
            decimal,
            lq.prim.mplus(
                lq.prim.then(lq.char.char("o"), number(8, lq.char.octDigit)),
                lq.prim.then(lq.char.char("x"), number(16, lq.char.hexDigit))
            )
        ),
        function (code) {
            return lq.prim.pure(String.fromCharCode(parseInt(code)));
        }
    );
    var charAscii = lq.combinator.choice(
        Object.keys(asciiMap).sort().map(function (asc) {
            return lq.prim.try(
                lq.prim.then(lq.char.string(asc), lq.prim.pure(asciiMap[asc]))
            );
        })
    );
    var charControl = lq.prim.then(
        lq.char.char("^"),
        lq.prim.bind(
            lq.char.upper,
            function (code) {
                return lq.prim.pure(String.fromCharCode(code.charCodeAt(0) - "A".charCodeAt(0) + 1));
            }
        )
    );
    var escapeCode = lq.prim.label(
        lq.prim.mplus(
            charEsc,
            lq.prim.mplus(
                charNum,
                lq.prim.mplus(
                    charAscii,
                    charControl
                )
            )
        ),
        "escape code"
    );
    var charLetter = lq.char.satisfy(function (c) { return c !== "'" && c !== "\\" && c > "\u001a"; });
    var charEscape = lq.prim.then(lq.char.char("\\"), escapeCode);
    var characterChar = lq.prim.label(
        lq.prim.mplus(charLetter, charEscape),
        "literal character"
    );
    var charLiteral = lq.prim.label(
        lexeme(
            lq.combinator.between(
                lq.char.char("'"),
                lq.prim.label(lq.char.char("'"), "end of character"),
                characterChar
            )
        ),
        "character"
    );
    function maybe (defaultValue, func) {
        return function (maybeValue) {
            return maybeValue.length === 0 ? defaultValue : func(maybeValue[0]);
        };
    }
    function cons (char, str) {
        return char + str;
    }
    function flip (f) {
        return function (x, y) {
            return f(y, x);
        };
    }
    var stringLetter = lq.char.satisfy(function (c) { return c !== "\"" && c !== "\\" && c > "\u001a"; });
    var escapeGap = lq.prim.then(
        lq.combinator.many1(lq.char.space),
        lq.prim.label(lq.char.char("\\"), "end of string gap")
    );
    var escapeEmpty = lq.char.char("&");
    var stringEscape = lq.prim.then(
        lq.char.char("\\"),
        lq.prim.mplus(
            lq.prim.then(escapeGap, lq.prim.pure([])),
            lq.prim.mplus(
                lq.prim.then(escapeEmpty, lq.prim.pure([])),
                lq.prim.bind(
                    escapeCode,
                    function (esc) {
                        return lq.prim.pure([esc]);
                    }
                )
            )
        )
    );
    var stringChar = lq.prim.label(
        lq.prim.mplus(
            lq.prim.bind(
                stringLetter,
                function (c) {
                    return lq.prim.pure([c]);
                }
            ),
            stringEscape
        ),
        "string character"
    );
    var stringLiteral = lexeme(
        lq.prim.label(
            lq.prim.bind(
                lq.combinator.between(
                    lq.char.char("\""),
                    lq.prim.label(lq.char.char("\""), "end of string"),
                    lq.prim.many(stringChar)
                ),
                function (str) {
                    return lq.prim.pure(str.reduceRight(flip(maybe(id, cons)), ""));
                }
            ),
            "literal string"
        )
    );

    var ident = lq.prim.label(
        lq.prim.bind(
            languageDef.identStart,
            function (c) {
                return lq.prim.bind(
                    lq.char.manyChar(languageDef.identLetter),
                    function (cs) {
                        return lq.prim.pure(c + cs);
                    }
                );
            }
        ),
        "identifier"
    );
    var reservedNames = languageDef.caseSensitive
        ? languageDef.reservedNames.sort()
        : languageDef.reservedNames.map(function (name) { return name.toLowerCase(); }).sort();
    function isReservedName (name) {
        return isReserved(reservedNames, languageDef.caseSensitive ? name : name.toLowerCase());
    }
    function isReserved (names, name) {
        return !names.every(function (reservedName) { return reservedName !== name; });
    }
    var identifier = lexeme(
        lq.prim.try(
            lq.prim.bind(
                ident,
                function (name) {
                    if (isReservedName(name)) {
                        return lq.prim.unexpected("reserved word " + lq.util.show(name));
                    }
                    else {
                        return lq.prim.pure(name);
                    }
                }
            )
        )
    );
    function caseString (name) {
        if (languageDef.caseSensitive) {
            return lq.char.string(name);
        }
        else {
            return lq.prim.then(
                walk(name),
                lq.prim.pure(name)
            );
        }

        function walk (str) {
            if (str.length === 0) {
                return lq.prim.pure(undefined);
            }
            else {
                return lq.prim.then(
                    lq.prim.label(caseChar(str[0]), lq.util.show(name)),
                    walk(str.substr(1))
                );
            }
        }
        function caseChar (c) {
            if (lq.util.CharUtil.isAlpha(c)) {
                return lq.prim.mplus(
                    lq.char.char(c.toLowerCase()),
                    lq.char.char(c.toUpperCase())
                );
            }
            else {
                return lq.char.char(c);
            }
        }
    }
    function reserved (name) {
        return lexeme(
            lq.prim.try(
                lq.prim.then(
                    caseString(name),
                    lq.prim.label(
                        lq.combinator.notFollowedBy(languageDef.identLetter),
                        "end of " + lq.util.show(name)
                    )
                )
            )
        );
    }
    var oper = lq.prim.label(
        lq.prim.bind(
            languageDef.opStart,
            function (c) {
                return lq.prim.bind(
                    lq.char.manyChar(languageDef.opLetter),
                    function (cs) {
                        return lq.prim.pure(c + cs);
                    }
                );
            }
        ),
        "operator"
    );
    function isReservedOp (name) {
        return isReserved(languageDef.reservedOpNames.sort(), name);
    }
    var operator = lexeme(
        lq.prim.try(
            lq.prim.bind(
                oper,
                function (name) {
                    if (isReservedOp(name)) {
                        return lq.prim.unexpected("reserved operator " + lq.util.show(name));
                    }
                    else {
                        return lq.prim.pure(name);
                    }
                }
            )
        )
    );
    function reservedOp (name) {
        return lexeme(
            lq.prim.try(
                lq.prim.then(
                    lq.char.string(name),
                    lq.prim.label(
                        lq.combinator.notFollowedBy(languageDef.opLetter),
                        "end of " + lq.util.show(name)
                    )
                )
            )
        );
    }

    return new TokenParser(identifier, reserved, operator, reservedOp,
        charLiteral, stringLiteral, natural, integer, float, naturalOrFloat, decimal, hexadecimal, octal,
        symbol, lexeme, whiteSpace, parens, braces, angles, brackets,
        semi, comma, colon, dot, semiSep, semiSep1, commaSep, commaSep1
    );
}


end();
