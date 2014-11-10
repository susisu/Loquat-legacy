/*
 * Loquat.test / expr.js
 * copyright (c) 2014 Susisu
 */

var should = require("should");

var lq = Object.freeze({
    "error" : require("../lib/error"),
    "expr"  : require("../lib/expr"),
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
            operator.hasOwnProperty("type").should.be.ok;
            operator.hasOwnProperty("parser").should.be.ok;
            operator.hasOwnProperty("assoc").should.be.ok;
        });

        describe("constructor(type, parser, assoc)", function () {
            it("should create a new Operator object that represents an operator", function () {
                var dummy = {};
                var operator = new Operator("infix", dummy, "assocNone");
                operator.type.should.equal("infix");
                operator.parser.should.equal(dummy);
                operator.assoc.should.equal("assocNone");
            });
        });
    });
});
