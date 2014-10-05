/*
 * Loquat.test / prim.js
 * copyright (c) 2014 Susisu
 */

var should = require("should");

var lq = Object.freeze({
    "pos" : require("../src/pos"),
    "prim": require("../src/prim"),
    "util": require("../src/util")
});


describe("prim", function () {
    var SourcePos = lq.pos.SourcePos;
    var State = lq.prim.State;

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
        it("should have fields 'consumed', 'succeeded', 'value', 'state' and 'error'");

        describe("coustructor(consumed, succeeded, value, state, error)", function () {
            it("should create a new Result object that represents result of parsing");
        });

        describe(".equals(resultA, resultB, valueEquals, inputEquals, userStateEquals)", function () {
            it("should return true when 'resultA' and 'resultB' represent the same result");

            it("should return false when 'resultA' and 'resultB' represent different results");
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

    describe("zero", function () {

    });

    describe("plus", function () {

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
