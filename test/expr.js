/*
 * Loquat.test / expr.js
 * copyright (c) 2014 Susisu
 */

var chai   = require("chai"),
    expect = chai.expect;

var lq = Object.freeze({
    "error" : require("../lib/error"),
    "expr"  : require("../lib/expr"),
    "char"  : require("../lib/char"),
    "pos"   : require("../lib/pos"),
    "prim"  : require("../lib/prim"),
    "util"  : require("../lib/util"),
    "string": require("../lib/string")
});


describe("expr", function () {
    var ErrorMessage = lq.error.ErrorMessage;
    var ErrorMessageType = lq.error.ErrorMessageType;
    var ParseError = lq.error.ParseError;
    var SourcePos = lq.pos.SourcePos;
    var State = lq.prim.State;
    var Result = lq.prim.Result;
    var Parser = lq.prim.Parser;
    var LazyParser = lq.prim.LazyParser;
    var OperatorType = lq.expr.OperatorType;
    var OperatorAssoc = lq.expr.OperatorAssoc;
    var Operator = lq.expr.Operator;
    var buildExpressionParser = lq.expr.buildExpressionParser;

    function alwaysCSuc (value, state, error) {
        return new Parser(function (state_, csuc, cerr, esuc, eerr) {
            return csuc(value, state, error);
        });
    }

    function alwaysCErr (error) {
        return new Parser(function (state, csuc, cerr, esuc, eerr) {
            return cerr(error);
        });
    }

    function alwaysESuc (value, state, error) {
        return new Parser(function (state_, csuc, cerr, esuc, eerr) {
            return esuc(value, state, error);
        });
    }

    function alwaysEErr (error) {
        return new Parser(function (state, csuc, cerr, esuc, eerr) {
            return eerr(error);
        });
    }

    function throwError () {
        throw new Error("unexpected call of result function");
    }

    describe("Operator", function () {
        it("should have fields 'type', 'parser' and 'assoc'", function () {
            var operator = new Operator("infix", {}, "assocNone");
            expect(operator).to.have.property("type").that.is.a("string");
            expect(operator).to.have.property("parser");
            expect(operator).to.have.property("assoc").that.is.a("string");
        });

        describe("constructor(type, parser, assoc)", function () {
            it("should create a new Operator object that represents an operator", function () {
                var dummy = {};
                var operator = new Operator("infix", dummy, "assocNone");
                expect(operator.type).to.equal("infix");
                expect(operator.parser).to.equal(dummy);
                expect(operator.assoc).to.equal("assocNone");
            });
        });
    });

    describe("buildExpressionParser(operators, term)", function () {
        it("should create a parser to parse expressions", function () {
            function Value (value) {
                this.value = value;
            }
            Value.prototype.toString = function () {
                return this.value;
            };
            function Prefix (op, expr) {
                this.op = op;
                this.expr = expr;
            }
            Prefix.prototype.toString = function () {
                return "(" + this.op + this.expr.toString() + ")";
            };
            function Postfix (op, expr) {
                this.op = op;
                this.expr = expr;
            }
            Postfix.prototype.toString = function () {
                return "(" + this.expr.toString() + this.op + ")";
            };
            function Infix (op, left, right) {
                this.op = op;
                this.left = left;
                this.right = right;
            }
            Infix.prototype.toString = function () {
                return "(" + this.left.toString() + this.op + this.right.toString() + ")";
            };

            var newValueM = lq.prim.fmap(function (value) { return new Value(value); });
            var newPrefixOpM = lq.prim.fmap(function (op) {
                return function (expr) { return new Prefix(op, expr); };
            });
            var newPostfixOpM = lq.prim.fmap(function (op) {
                return function (expr) { return new Postfix(op, expr); };
            });
            var newInfixOpM = lq.prim.fmap(function (op) {
                return function (left, right) { return new Infix(op, left, right); };
            });

            (function () {
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
                var term = newValueM(p);
                var parser = lq.expr.buildExpressionParser([], term);

                parser.run(
                    new State("aabcd", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("a1");
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("babcd", SourcePos.init("test"), "none"),
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

                parser.run(
                    new State("cabcd", SourcePos.init("test"), "none"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value.toString()).to.equal("c1");
                        expect(State.equals(
                            state,
                            new State("abcd", new SourcePos("test", 1, 1), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 1),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                            )
                        )).to.be.true;
                    },
                    throwError
                );

                parser.run(
                    new State("dabcd", SourcePos.init("test"), "none"),
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
            })();

            (function () {
                var term = newValueM(lq.char.letter);
                var preop = new Operator(
                    OperatorType.PREFIX,
                    newPrefixOpM(lq.char.char("+"))
                );
                var postop = new Operator(
                    OperatorType.POSTFIX,
                    newPostfixOpM(lq.char.char("-"))
                );
                var parser = lq.expr.buildExpressionParser([[preop, postop]], term);

                parser.run(
                    new State("a", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("a");
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.run(
                    new State("+a", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(+a)");
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
                                    new ErrorMessage(ErrorMessageType.EXPECT, "")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a-", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a-)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                []
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("+a-", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("((+a)-)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                []
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("+", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );
            })();

            (function () {
                var term = newValueM(lq.char.letter);
                var postop1 = new Operator(
                    OperatorType.POSTFIX,
                    newPostfixOpM(lq.char.char("+"))
                );
                var postop2 = new Operator(
                    OperatorType.POSTFIX,
                    newPostfixOpM(lq.char.char("-"))
                );
                var parser1 = lq.expr.buildExpressionParser([[postop1], [postop2]], term);
                var parser2 = lq.expr.buildExpressionParser([[postop2], [postop1]], term);
                var parser3 = lq.expr.buildExpressionParser([[postop2, postop1]], term);

                parser1.run(
                    new State("a+-", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("((a+)-)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                []
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser1.run(
                    new State("a-+", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a-)");
                        expect(State.equals(
                            state,
                            new State("+", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                []
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser2.run(
                    new State("a+-", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a+)");
                        expect(State.equals(
                            state,
                            new State("-", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                []
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser2.run(
                    new State("a-+", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("((a-)+)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                []
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser3.run(
                    new State("a+-", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a+)");
                        expect(State.equals(
                            state,
                            new State("-", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                []
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser3.run(
                    new State("a-+", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a-)");
                        expect(State.equals(
                            state,
                            new State("+", new SourcePos("test", 1, 3), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                []
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            })();

            (function () {
                var term = newValueM(lq.char.letter);
                var op = new Operator(
                    OperatorType.INFIX,
                    newInfixOpM(lq.char.char(":")),
                    OperatorAssoc.ASSOC_NONE
                );
                var parser = lq.expr.buildExpressionParser([[op]], term);

                parser.run(
                    new State("a", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("a");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.run(
                    new State("a:", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a:b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a:b)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(":"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a:b:", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a:b)");
                        expect(State.equals(
                            state,
                            new State(":", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "ambiguous use of a non associative operator")]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            })();

            (function () {
                var term = newValueM(lq.char.letter);
                var op = new Operator(
                    OperatorType.INFIX,
                    newInfixOpM(lq.char.char(":")),
                    OperatorAssoc.ASSOC_RIGHT
                );
                var parser = lq.expr.buildExpressionParser([[op]], term);

                parser.run(
                    new State("a", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("a");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.run(
                    new State("a:", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a:b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a:b)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(":"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a:b:", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a:b:c", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a:(b:c))");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(":"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            })();

            (function () {
                var term = newValueM(lq.char.letter);
                var op = new Operator(
                    OperatorType.INFIX,
                    newInfixOpM(lq.char.char(":")),
                    OperatorAssoc.ASSOC_LEFT
                );
                var parser = lq.expr.buildExpressionParser([[op]], term);

                parser.run(
                    new State("a", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("a");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.run(
                    new State("a:", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a:b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a:b)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(":"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a:b:", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a:b:c", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("((a:b):c)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(":"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            })();

            (function () {
                var term = newValueM(lq.char.letter);
                var op1 = new Operator(
                    OperatorType.INFIX,
                    newInfixOpM(lq.char.char(":")),
                    OperatorAssoc.ASSOC_NONE
                );
                var op2 = new Operator(
                    OperatorType.INFIX,
                    newInfixOpM(lq.char.char("=")),
                    OperatorAssoc.ASSOC_NONE
                );
                var parser = lq.expr.buildExpressionParser([[op1], [op2]], term);

                parser.run(
                    new State("a", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("a");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.run(
                    new State("a:", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a:b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a:b)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(":")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a:b:", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a:b)");
                        expect(State.equals(
                            state,
                            new State(":", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "ambiguous use of a non associative operator")]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.run(
                    new State("a=", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a=b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a=b)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("="))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a=b=", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a=b)");
                        expect(State.equals(
                            state,
                            new State("=", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "ambiguous use of a non associative operator")]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a:=", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("=")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a:b=", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a:=b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("=")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a:b=c", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("((a:b)=c)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("="))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.run(
                    new State("a=b:", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a=b:c", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a=(b:c))");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(":")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("="))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.run(
                    new State("a:b=c:", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 7),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a:b=c:d", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("((a:b)=(c:d))");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 8), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 8),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(":")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("="))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            })();

            (function () {
                var term = newValueM(lq.char.letter);
                var op1 = new Operator(
                    OperatorType.INFIX,
                    newInfixOpM(lq.char.char(".")),
                    OperatorAssoc.ASSOC_RIGHT
                );
                var op2 = new Operator(
                    OperatorType.INFIX,
                    newInfixOpM(lq.char.char("$")),
                    OperatorAssoc.ASSOC_RIGHT
                );
                var parser = lq.expr.buildExpressionParser([[op1], [op2]], term);

                parser.run(
                    new State("a", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("a");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.run(
                    new State("a.", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a.b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a.b)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a.b.", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );
                
                parser.run(
                    new State("a$", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a$b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a$b)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("$"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a$b$", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a.$", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("$")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a.b$", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a.$b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("$")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a.b$c", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("((a.b)$c)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("$"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.run(
                    new State("a$b.", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a$b.c", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a$(b.c))");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("$"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.run(
                    new State("a.b$c.", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 7),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a.b$c.d", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("((a.b)$(c.d))");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 8), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 8),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show(".")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("$"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            })();

            (function () {
                var term = newValueM(lq.char.letter);
                var op1 = new Operator(
                    OperatorType.INFIX,
                    newInfixOpM(lq.char.char("*")),
                    OperatorAssoc.ASSOC_LEFT
                );
                var op2 = new Operator(
                    OperatorType.INFIX,
                    newInfixOpM(lq.char.char("+")),
                    OperatorAssoc.ASSOC_LEFT
                );
                var parser = lq.expr.buildExpressionParser([[op1], [op2]], term);

                parser.run(
                    new State("a", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("a");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 2), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.run(
                    new State("a*", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a*b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a*b)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("*")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a*b*", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );
                
                parser.run(
                    new State("a+", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a+b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a+b)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("+"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a+b+", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a*+", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("+")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a*b+", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a*+b", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 3),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("+")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a*b+c", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("((a*b)+c)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "operator"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("+"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.run(
                    new State("a+b*", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a+b*c", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a+(b*c))");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 6), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 6),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("*")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("+"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
                
                parser.run(
                    new State("a*b+c*", SourcePos.init("test"), "none"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 7),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "letter")
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a*b+c*d", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("((a*b)+(c*d))");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 8), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 8),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("*")),
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("+"))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            })();

            (function () {
                var term = newValueM(lq.char.letter);
                var opN = new Operator(
                    OperatorType.INFIX,
                    newInfixOpM(lq.char.char("=")),
                    OperatorAssoc.ASSOC_NONE
                );
                var opR = new Operator(
                    OperatorType.INFIX,
                    newInfixOpM(lq.char.char("$")),
                    OperatorAssoc.ASSOC_RIGHT
                );
                var opL = new Operator(
                    OperatorType.INFIX,
                    newInfixOpM(lq.char.char("+")),
                    OperatorAssoc.ASSOC_LEFT
                );
                var parser = lq.expr.buildExpressionParser([[opN, opR, opL]], term);

                parser.run(
                    new State("a=b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a=b)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("$")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("+")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("="))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a$b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a$b)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("$")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("+")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("="))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a+b", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a+b)");
                        expect(State.equals(
                            state,
                            new State("", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("+")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("$")),
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, lq.util.show("="))
                                ]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a=b$c", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a=b)");
                        expect(State.equals(
                            state,
                            new State("$c", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "ambiguous use of a right associative operator")]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a=b+c", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a=b)");
                        expect(State.equals(
                            state,
                            new State("+c", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "ambiguous use of a left associative operator")]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a$b=c", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a$b)");
                        expect(State.equals(
                            state,
                            new State("=c", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "ambiguous use of a non associative operator")]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a$b+c", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a$b)");
                        expect(State.equals(
                            state,
                            new State("+c", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "ambiguous use of a left associative operator")]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a+b=c", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a+b)");
                        expect(State.equals(
                            state,
                            new State("=c", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "ambiguous use of a non associative operator")]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                parser.run(
                    new State("a+b$c", SourcePos.init("test"), "none"),
                    function (value, state, error) {
                        expect(value.toString()).to.equal("(a+b)");
                        expect(State.equals(
                            state,
                            new State("$c", new SourcePos("test", 1, 4), "none")
                        )).to.be.true;
                        expect(ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 5),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "ambiguous use of a right associative operator")]
                            )
                        )).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );
            })();
        });
    });
});
