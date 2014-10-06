/*
 * Loquat.test / prim.js
 * copyright (c) 2014 Susisu
 */

var should = require("should");

var lq = Object.freeze({
    "error": require("../src/error"),
    "pos"  : require("../src/pos"),
    "prim" : require("../src/prim"),
    "util" : require("../src/util")
});


describe("prim", function () {
    var ErrorMessage = lq.error.ErrorMessage;
    var ErrorMessageType = lq.error.ErrorMessageType;
    var ParseError = lq.error.ParseError;
    var SourcePos = lq.pos.SourcePos;
    var State = lq.prim.State;
    var Result = lq.prim.Result;

    describe("State", function () {
        it("should have fields 'input', 'position' and 'userState'", function () {
            var state = new State("foo", new SourcePos("test", 1, 2), {});
            state.hasOwnProperty("input").should.be.ok;
            state.hasOwnProperty("position").should.be.ok;
            state.hasOwnProperty("userState").should.be.ok;
        });

        describe("coustructor(input, position, userState)", function () {
            it("should create a new State object that represents state of parser", function () {
                var state = new State("foo", new SourcePos("test", 1, 2), "none");
                state.input.should.equal("foo");
                SourcePos.equals(state.position, new SourcePos("test", 1, 2)).should.be.ok;
                state.userState.should.equal("none");
            });
        });

        describe(".equals(stateA, stateB, inputEquals, userStateEquals)", function () {
            it("should return true when 'stateA' and 'stateB' represent the same state", function () {
                var stateA = new State("foo", new SourcePos("test", 1, 2), "none");
                var stateB = new State("foo", new SourcePos("test", 1, 2), "none");
                State.equals(stateA, stateB).should.be.ok;

                var stateC = new State(["f", "o", "o"], new SourcePos("test", 1, 2), "none");
                var stateD = new State(["f", "o", "o"], new SourcePos("test", 1, 2), "none");
                State.equals(stateC, stateD, lq.util.ArrayUtil.equals).should.be.ok;

                var stateE = new State("foo", new SourcePos("test", 1, 2), [1, 2, 3]);
                var stateF = new State("foo", new SourcePos("test", 1, 2), [1, 2, 3]);
                State.equals(stateE, stateF, undefined, lq.util.ArrayUtil.equals).should.be.ok;
            });

            it("should return false when 'stateA' and 'stateB' represent different states", function () {
                var stateA = new State("foo", new SourcePos("test", 1, 2), "none");
                var stateB = new State("bar", new SourcePos("test", 1, 2), "none");
                State.equals(stateA, stateB).should.not.be.ok;

                var stateC = new State("foo", new SourcePos("test", 1, 2), "none");
                var stateD = new State("foo", new SourcePos("test", 3, 4), "none");
                State.equals(stateC, stateD).should.not.be.ok;

                var stateE = new State("foo", new SourcePos("test", 1, 2), "bar");
                var stateF = new State("foo", new SourcePos("test", 3, 4), "baz");
                State.equals(stateE, stateF).should.not.be.ok;
            });
        });

        describe("#setInput(input)", function () {
            it("should return a copy of the state, the input of which is set to the specified input", function () {
                var state = new State("foo", new SourcePos("test", 1, 2), "none");
                var copy = state.setInput("bar");
                (state === copy).should.not.be.ok;
                copy.input.should.equal("bar");
                SourcePos.equals(state.position, copy.position).should.be.ok;
                copy.userState.should.equal(state.userState);
            });
        });

        describe("#setPosition(position)", function () {
            it("should return a copy of the state, the position of which is set to the specified position", function () {
                var state = new State("foo", new SourcePos("test", 1, 2), "none");
                var copy = state.setPosition(new SourcePos("test", 3, 4));
                (state === copy).should.not.be.ok;
                copy.input.should.equal(state.input);
                SourcePos.equals(new SourcePos("test", 3, 4), copy.position).should.be.ok;
                copy.userState.should.equal(state.userState);
            });
        });

        describe("#setUserState(userState)", function () {
            it("should return a copy of the state, the user state of which is set to the specified user state", function () {
                var state = new State("foo", new SourcePos("test", 1, 2), "none");
                var copy = state.setUserState("some");
                (state === copy).should.not.be.ok;
                copy.input.should.equal(state.input);
                SourcePos.equals(state.position, copy.position).should.be.ok;
                copy.userState.should.equal("some");
            });
        });
    });

    describe("Result", function () {
        it("should have fields 'consumed', 'succeeded', 'value', 'state' and 'error'", function () {
            var pos = new SourcePos("test", 1, 2);
            var res = new Result(true, true, "foo",
                new State("some", pos, {}),
                new ParseError(pos, [
                    new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                    new ErrorMessage(ErrorMessageType.EXPECT, "def")
                ])
            );
            res.hasOwnProperty("consumed").should.be.ok;
            res.hasOwnProperty("succeeded").should.be.ok;
            res.hasOwnProperty("value").should.be.ok;
            res.hasOwnProperty("state").should.be.ok;
            res.hasOwnProperty("error").should.be.ok;
        });

        describe("coustructor(consumed, succeeded, value, state, error)", function () {
            it("should create a new Result object that represents result of parsing", function () {
                var pos = new SourcePos("test", 1, 2);
                var res = new Result(true, true, "foo",
                    new State("some", pos, "none"),
                    new ParseError(pos, [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "def")
                    ])
                );
                res.consumed.should.equal(true);
                res.succeeded.should.equal(true);
                res.value.should.equal("foo");
                State.equals(res.state, new State("some", pos, "none")).should.be.ok;
                ParseError.equals(res.error,
                    new ParseError(pos, [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "def")
                    ])
                ).should.be.ok;
            });
        });

        describe(".equals(resultA, resultB, valueEquals, inputEquals, userStateEquals)", function () {
            it("should return true when 'resultA' and 'resultB' represent the same result", function () {
                var posA = new SourcePos("test", 1, 2);
                var resA = new Result(true, true, "foo",
                    new State("some", posA, "none"),
                    new ParseError(posA, [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "def")
                    ])
                );
                var posB = new SourcePos("test", 1, 2);
                var resB = new Result(true, true, "foo",
                    new State("some", posB, "none"),
                    new ParseError(posB, [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "def")
                    ])
                );
                Result.equals(resA, resB).should.be.ok;

                var posC = new SourcePos("test", 1, 2);
                var resC = new Result(true, true, ["f", "o", "o"],
                    new State("some", posC, "none"),
                    new ParseError(posC, [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "def")
                    ])
                );
                var posD = new SourcePos("test", 1, 2);
                var resD = new Result(true, true, ["f", "o", "o"],
                    new State("some", posD, "none"),
                    new ParseError(posD, [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "def")
                    ])
                );
                Result.equals(resC, resD, lq.util.ArrayUtil.equals).should.be.ok;
            });

            it("should return false when 'resultA' and 'resultB' represent different results", function () {
                var posA = new SourcePos("test", 1, 2);
                var resA = new Result(true, true, "foo",
                    new State("some", posA, "none"),
                    new ParseError(posA, [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "def")
                    ])
                );
                var posB = new SourcePos("test", 3, 4);
                var resB = new Result(true, true, "foo",
                    new State("some", posB, "none"),
                    new ParseError(posB, [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "def")
                    ])
                );
                Result.equals(resA, resB).should.not.be.ok;

                var posC = new SourcePos("test", 1, 2);
                var resC = new Result(true, true, "foo",
                    new State("some", posC, "none"),
                    new ParseError(posC, [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "def")
                    ])
                );
                var posD = new SourcePos("test", 1, 2);
                var resD = new Result(false, true, "foo",
                    new State("some", posD, "none"),
                    new ParseError(posD, [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "def")
                    ])
                );
                Result.equals(resC, resD).should.not.be.ok;

                var posE = new SourcePos("test", 1, 2);
                var resE = new Result(true, true, "foo",
                    new State("some", posE, "none"),
                    new ParseError(posE, [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "def")
                    ])
                );
                var posF = new SourcePos("test", 1, 2);
                var resF = new Result(true, false, "foo",
                    new State("some", posF, "none"),
                    new ParseError(posF, [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "def")
                    ])
                );
                Result.equals(resE, resF).should.not.be.ok;

                var posG = new SourcePos("test", 1, 2);
                var resG = new Result(true, true, "foo",
                    new State("some", posG, "none"),
                    new ParseError(posG, [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "def")
                    ])
                );
                var posH = new SourcePos("test", 1, 2);
                var resH = new Result(true, true, "bar",
                    new State("some", posH, "none"),
                    new ParseError(posH, [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "def")
                    ])
                );
                Result.equals(resG, resH).should.not.be.ok;

                var posI = new SourcePos("test", 1, 2);
                var resI = new Result(true, true, "foo",
                    new State("some", posI, "none"),
                    new ParseError(posI, [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "def")
                    ])
                );
                var posJ = new SourcePos("test", 1, 2);
                var resJ = new Result(true, true, "foo",
                    new State("some", posJ, "some"),
                    new ParseError(posJ, [
                        new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                        new ErrorMessage(ErrorMessageType.EXPECT, "def")
                    ])
                );
                Result.equals(resI, resJ).should.not.be.ok;
            });
        });
    });

    describe("Parser", function () {
        describe("run", function () {

        });

        describe("parse", function () {

        });
    });

    describe("LazyParser", function () {
        describe("init", function () {

        });

        describe("run", function () {

        });

        describe("parse", function () {

        });
    });

    describe("parse", function () {

    });

    describe("show", function () {

    });

    describe("fmap", function () {

    });

    describe("pure", function () {

    });

    describe("apply", function () {

    });

    describe("left", function () {

    });

    describe("right", function () {

    });

    describe("bind", function () {

    });

    describe("then", function () {

    });

    describe("fail", function () {

    });

    describe("mzero", function () {

    });

    describe("mplus", function () {

    });

    describe("label", function () {

    });

    describe("labels", function () {

    });

    describe("unexpected", function () {

    });

    describe("attempt", function () {

    });

    describe("lookAhead", function () {

    });

    describe("manyAccum", function () {

    });

    describe("many", function () {

    });

    describe("skipMany", function () {

    });

    describe("tokens", function () {

    });

    describe("token", function () {

    });

    describe("tokenPrim", function () {

    });

    describe("getState", function () {

    });

    describe("setState", function () {

    });

    describe("updateState", function () {

    });

    describe("getInput", function () {

    });

    describe("setInput", function () {

    });

    describe("getPosition", function () {

    });

    describe("setPosition", function () {

    });

    describe("getUserState", function () {

    });

    describe("setUserState", function () {

    });
});
