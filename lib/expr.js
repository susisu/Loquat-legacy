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
    "error"     : require("./error"),
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

        function rightAssocParser1 (x) {
            return lq.prim.mplus(
                lq.prim.bind(
                    rightAssocOperator,
                    function (f) {
                        return lq.prim.bind(
                            lq.prim.bind(
                                termParser,
                                function (z) {
                                    return rightAssocParser(z);
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

        function rightAssocParser (x) {
            return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                var values = [];
                var operations = [];
                var currentState = state;
                var currentError = lq.error.ParseError.unknown(state.position);
                var consumed = false;
                var stop = false;
                var termState;
                var termConsumed;
                while (true) {
                    termState = currentState;
                    termConsumed = false;
                    rightAssocOperator.run(termState, opCSuc_, opCErr_, opESuc_, opEErr_);
                    if (stop) {
                        break;
                    }
                    termParser.run(termState, termCSuc_, termCErr_, termESuc_, termEErr_);
                    if (stop) {
                        break;
                    }
                    currentState = termState;
                }
                if (termConsumed) {
                    return cerr(currentError);
                }
                else {
                    lq.prim.mplus(
                        ambiguousLeft,
                        ambiguousNone
                    ).run(currentState, ambCSuc_, ambCErr_, ambESuc_, ambEErr_);
                    var result = x;
                    if (values.length > 0) {
                        var currentValue = values[values.length - 1];
                        for (var i = values.length - 2; i >= 0; i --) {
                            currentValue = operations[i + 1](values[i], currentValue);
                        }
                        result = operations[0](result, currentValue);
                    }
                    if (consumed) {
                        return csuc(result, currentState, currentError);
                    }
                    else {
                        return esuc(result, currentState, currentError);
                    }
                }

                function opCSuc_ (value, state, error) {
                    consumed = true;
                    termConsumed = true;
                    operations.push(value);
                    termState = state;
                    currentError = error;
                }

                function opCErr_ (error) {
                    consumed = true;
                    termConsumed = true;
                    stop = true;
                    termState = state;
                    currentError = error;
                }

                function opESuc_ (value, state, error) {
                    operations.push(value);
                    termState = state;
                    currentError = lq.error.ParseError.merge(currentError, error);
                }

                function opEErr_ (error) {
                    stop = true;
                    currentError = lq.error.ParseError.merge(currentError, error);
                }

                function termCSuc_ (value, state, error) {
                    consumed = true;
                    termConsumed = true;
                    values.push(value);
                    termState = state;
                    currentError = error;
                }

                function termCErr_ (error) {
                    consumed = true;
                    termConsumed = true;
                    stop = true;
                    currentError = error;
                }

                function termESuc_ (value, state, error) {
                    values.push(value);
                    termState = state;
                    currentError = lq.error.ParseError.merge(currentError, error);
                }

                function termEErr_ (error) {
                    stop = true;
                    currentError = lq.error.ParseError.merge(currentError, error);
                }

                function ambCSuc_ (value, state, error) {
                    consumed = true;
                    currentState = state;
                    currentError = error;
                }

                function ambCErr_ (error) {
                    consumed = true;
                    currentError = error;
                }

                function ambESuc_ (value, state, error) {
                    currentState = state;
                    currentError = lq.error.ParseError.merge(currentError, error);
                }

                function ambEErr_ (error) {
                    currentError = lq.error.ParseError.merge(currentError, error);
                }
            });
        }

        function leftAssocParser1 (x) {
            return lq.prim.mplus(
                lq.prim.bind(
                    leftAssocOperator,
                    function (f) {
                        return lq.prim.bind(
                            termParser,
                            function (y) {
                                return leftAssocParser(f(x, y));
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

        function leftAssocParser (x) {
            return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
                var currentValue = x;
                var currentOperation;
                var currentState = state;
                var currentError = lq.error.ParseError.unknown(state.position);
                var consumed = false;
                var stop = false;
                var termState;
                var termConsumed;
                while (true) {
                    termState = currentState;
                    termConsumed = false;
                    leftAssocOperator.run(termState, opCSuc_, opCErr_, opESuc_, opEErr_);
                    if (stop) {
                        break;
                    }
                    termParser.run(termState, termCSuc_, termCErr_, termESuc_, termEErr_);
                    if (stop) {
                        break;
                    }
                    currentState = termState;
                }
                if (termConsumed) {
                    return cerr(currentError);
                }
                else {
                    lq.prim.mplus(
                        ambiguousRight,
                        ambiguousNone
                    ).run(currentState, ambCSuc_, ambCErr_, ambESuc_, ambEErr_);
                    if (consumed) {
                        return csuc(currentValue, currentState, currentError);
                    }
                    else {
                        return esuc(currentValue, currentState, currentError);
                    }
                }

                function opCSuc_ (value, state, error) {
                    consumed = true;
                    termConsumed = true;
                    currentOperation = value;
                    termState = state;
                    currentError = error;
                }

                function opCErr_ (error) {
                    consumed = true;
                    termConsumed = true;
                    stop = true;
                    currentError = error;
                }

                function opESuc_ (value, state, error) {
                    currentOperation = value;
                    termState = state;
                    currentError = lq.error.ParseError.merge(currentError, error);
                }

                function opEErr_ (error) {
                    stop = true;
                    currentError = lq.error.ParseError.merge(currentError, error);
                }

                function termCSuc_ (value, state, error) {
                    consumed = true;
                    termConsumed = true;
                    currentValue = currentOperation(currentValue, value);
                    termState = state;
                    currentError = error;
                }

                function termCErr_ (error) {
                    consumed = true;
                    termConsumed = true;
                    stop = true;
                    currentError = error;
                }

                function termESuc_ (value, state, error) {
                    currentValue = currentOperation(currentValue, value);
                    termState = state;
                    currentError = lq.error.ParseError.merge(currentError, error);
                }

                function termEErr_ (error) {
                    stop = true;
                    currentError = lq.error.ParseError.merge(currentError, error);
                }

                function ambCSuc_ (value, state, error) {
                    consumed = true;
                    currentState = state;
                    currentError = error;
                }

                function ambCErr_ (error) {
                    consumed = true;
                    currentError = error;
                }

                function ambESuc_ (value, state, error) {
                    currentState = state;
                    currentError = lq.error.ParseError.merge(currentError, error);
                }

                function ambEErr_ (error) {
                    currentError = lq.error.ParseError.merge(currentError, error);
                }
            });
        }

        function nonAssocParser1 (x) {
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
                        rightAssocParser1(x),
                        lq.prim.mplus(
                            leftAssocParser1(x),
                            lq.prim.mplus(
                                nonAssocParser1(x),
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
