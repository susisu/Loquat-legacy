/*
 * Loquat / expr.js
 * copyright (c) 2014 Susisu
 *
 * a helper to parse expressions
 */

"use strict";

function end () {
    module.exports = Object.freeze({
        "OperatorType"         : OperatorType,
        "OperatorAssoc"        : OperatorAssoc,
        "Operator"             : Operator,
        "buildExpressionParser": buildExpressionParser
    });
}

var lq = Object.freeze({
    "combinator": require("./combinator"),
    "prim"      : require("./prim"),
});


var OperatorType = Object.freeze({
    "INFIX": "infix",
    "PREFIX": "prefix",
    "POSTFIX": "postfix"
});

var OperatorAssoc = Object.freeze({
    "ASSOC_NONE": "assocNone",
    "ASSOC_LEFT": "assocLeft",
    "ASSOC_RIGHT": "assocRight"
});

function Operator (type, parser, assoc) {
    this.type = type;
    this.parser = parser;
    this.assoc = assoc;
}

function buildExpressionParser (operators, term) {
    return operators.reduce(makeParser, term);

    function makeParser (term, operators) {
        var nonAssoc   = [];
        var leftAssoc  = [];
        var rightAssoc = [];
        var prefix     = [];
        var postfix    = [];
        for (var i = 0; i < operators.length; i ++) {
            switch (operators[i].type) {
                case OperatorType.INFIX:
                    switch (operators[i].assoc) {
                        case OperatorAssoc.ASSOC_NONE:
                            nonAssoc.push(operators[i].parser);
                            break;
                        case OperatorAssoc.ASSOC_LEFT:
                            leftAssoc.push(operators[i].parser);
                            break;
                        case OperatorAssoc.ASSOC_RIGHT:
                            rightAssoc.push(operators[i].parser);
                            break;
                        default:
                            throw new Error("unknown operator assoc: " + operators[i].assoc);
                    }
                    break;
                case OperatorType.PREFIX:
                    prefix.push(operators[i].parser);
                    break;
                case OperatorType.POSTFIX:
                    postfix.push(operators[i].parser);
                    break;
                default:
                    throw new Error("unknown operator type: " + operators[i].type);
            }
        }

        var nonAssocOperator   = lq.combinator.choice(nonAssoc);
        var leftAssocOperator  = lq.combinator.choice(leftAssoc);
        var rightAssocOperator = lq.combinator.choice(rightAssoc);
        var prefixOperator     = lq.prim.label(lq.combinator.choice(prefix), "");
        var postfixOperator    = lq.prim.label(lq.combinator.choice(postfix), "");

        function ambiguous (assoc, operator) {
            return lq.prim.try(
                lq.prim.then(
                    operator,
                    lq.prim.fail("ambiguous use of a " + assoc + " associative operator")
                )
            );
        }
        var ambiguousNone  = ambiguous("non", nonAssocOperator);
        var ambiguousLeft  = ambiguous("left", leftAssocOperator);
        var ambiguousRight = ambiguous("right", rightAssocOperator);

        function id (x) {
            return x;
        }
        var prefixParser = lq.prim.mplus(
            prefixOperator,
            lq.prim.pure(id)
        );
        var postfixParser = lq.prim.mplus(
            postfixOperator,
            lq.prim.pure(id)
        );
        var termParser = lq.prim.bind(
            prefixParser,
            function (pre) {
                return lq.prim.bind(
                    term,
                    function (x) {
                        return lq.prim.bind(
                            postfixParser,
                            function (post) {
                                return lq.prim.pure(post(pre(x)));
                            }
                        );
                    }
                );
            }
        );
        function rightAssocParser (x) {
            return lq.prim.mplus(
                lq.prim.bind(
                    rightAssocOperator,
                    function (f) {
                        return lq.prim.bind(
                            lq.prim.bind(
                                termParser,
                                function (z) {
                                    return rightAssocParser1(z);
                                }
                            ),
                            function (y) {
                                return lq.prim.pure(f(x, y));
                            }
                        );
                    }
                ),
                lq.prim.mplus(
                    ambiguousLeft,
                    ambiguousNone
                )
            );
        }
        function rightAssocParser1 (x) {
            return lq.prim.mplus(
                rightAssocParser(x),
                lq.prim.pure(x)
            );
        }
        function leftAssocParser (x) {
            return lq.prim.mplus(
                lq.prim.bind(
                    leftAssocOperator,
                    function (f) {
                        return lq.prim.bind(
                            termParser,
                            function (y) {
                                return leftAssocParser1(f(x, y));
                            }
                        );
                    }
                ),
                lq.prim.mplus(
                    ambiguousRight,
                    ambiguousNone
                )
            );
        }
        function leftAssocParser1 (x) {
            return lq.prim.mplus(
                leftAssocParser(x),
                lq.prim.pure(x)
            );
        }
        function nonAssocParser (x) {
            return lq.prim.bind(
                nonAssocOperator,
                function (f) {
                    return lq.prim.bind(
                        termParser,
                        function (y) {
                            return lq.prim.mplus(
                                ambiguousRight,
                                lq.prim.mplus(
                                    ambiguousLeft,
                                    lq.prim.mplus(
                                        ambiguousNone,
                                        lq.prim.pure(f(x, y))
                                    )
                                )
                            );
                        }
                    );
                }
            );
        }

        return lq.prim.bind(
            termParser,
            function (x) {
                return lq.prim.label(
                    lq.prim.mplus(
                        rightAssocParser(x),
                        lq.prim.mplus(
                            leftAssocParser(x),
                            lq.prim.mplus(
                                nonAssocParser(x),
                                lq.prim.pure(x)
                            )
                        )
                    ),
                    "operator"
                );
            }
        );
    }
}


end();
