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
    var Parser = lq.prim.Parser;
    var LazyParser = lq.prim.LazyParser;

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

    describe("Parser", function () {
        describe("constructor(parserFunc)", function () {
            it("should create a new Parser object", function () {
                var parser = new Parser(function (state, csuc, cerr, esuc, eerr) {
                    /* parser */
                });
            });
        });

        describe("run(state, consumedSucceeded, consumedError, emptySucceeded, emptyError)", function () {
            it("should return a result of parsing generated by 'consumedSucceeded', 'consumedError', 'emptySucceeded' or 'emptyError'", function () {
                var posA = new SourcePos("testA", 1, 2);
                var posB = new SourcePos("testB", 3, 4);

                alwaysCSuc("foo", new State("abc", posA, "none"), new ParseError(posA, [])).run(
                    new State("def", posB, "some"),
                    function (value, state, error) {
                        value.should.equal("foo");
                        State.equals(state, new State("abc", posA, "none")).should.be.ok;
                        ParseError.equals(error, new ParseError(posA, [])).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                alwaysCErr(new ParseError(posA, [])).run(
                    new State("def", posB, "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(error, new ParseError(posA, [])).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                alwaysESuc("foo", new State("abc", posA, "none"), new ParseError(posA, [])).run(
                    new State("def", posB, "some"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        value.should.equal("foo");
                        State.equals(state, new State("abc", posA, "none")).should.be.ok;
                        ParseError.equals(error, new ParseError(posA, [])).should.be.ok;
                    },
                    throwError
                );

                alwaysEErr(new ParseError(posA, [])).run(
                    new State("def", posB, "some"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(error, new ParseError(posA, [])).should.be.ok;
                    }
                );
            });
        });

        describe("parse(state)", function () {
            it("should return a result of parsing", function () {
                var posA = new SourcePos("testA", 1, 2);
                var posB = new SourcePos("testB", 3, 4);

                var resCSuc = alwaysCSuc("foo", new State("abc", posA, "none"), new ParseError(posA, []))
                    .parse(new State("def", posB, "some"));
                Result.equals(
                    resCSuc,
                    new Result(true, true, "foo", new State("abc", posA, "none"), new ParseError(posA, []))
                ).should.be.ok;

                var resCErr = alwaysCErr(new ParseError(posA, []))
                    .parse(new State("def", posB, "some"));
                Result.equals(
                    resCErr,
                    new Result(true, false, undefined, undefined, new ParseError(posA, []))
                ).should.be.ok;

                var resESuc = alwaysESuc("foo", new State("abc", posA, "none"), new ParseError(posA, []))
                    .parse(new State("def", posB, "some"));
                Result.equals(
                    resESuc,
                    new Result(false, true, "foo", new State("abc", posA, "none"), new ParseError(posA, []))
                ).should.be.ok;

                var resEErr = alwaysEErr(new ParseError(posA, []))
                    .parse(new State("def", posB, "some"));
                Result.equals(
                    resEErr,
                    new Result(false, false, undefined, undefined, new ParseError(posA, []))
                ).should.be.ok;
            });
        });
    });

    describe("LazyParser", function () {
        describe("constructor(generator)", function () {
            it("should create a new LazyParser object that contains a parser generated by 'generator'", function () {
                var parser = new LazyParser(function () {
                    /* return a parser */
                });
            });
        });

        describe("init()", function () {
            it("should initialize the parser", function () {
                var posA = new SourcePos("testA", 1, 2);
                var posB = new SourcePos("testB", 3, 4);

                var t;
                var parserA = new LazyParser(function () {
                    return t;
                });
                t = alwaysCSuc("foo", new State("abc", posA, "none"), new ParseError(posA, []));
                parserA.init();
                t = alwaysCErr(new ParseError(posA, []));
                var res = parserA.parse(new State("def", posB, "some"));
                Result.equals(
                    res,
                    new Result(true, true, "foo", new State("abc", posA, "none"), new ParseError(posA, []))
                ).should.be.ok;

                var u;
                var parserB = new LazyParser(function () {
                    return u;
                });
                u = alwaysCSuc("foo", new State("abc", posA, "none"), new ParseError(posA, []));
                u = alwaysCErr(new ParseError(posA, []));
                parserB.init();
                var res = parserB.parse(new State("def", posB, "some"));
                Result.equals(
                    res,
                    new Result(true, false, undefined, undefined, new ParseError(posA, []))
                ).should.be.ok;
            });
        });

        describe("run(state, consumedSucceeded, consumedError, emptySucceeded, emptyError)", function () {
            it("should return a result of parsing generated by 'consumedSucceeded', 'consumedError', 'emptySucceeded' or 'emptyError'", function () {
                var posA = new SourcePos("testA", 1, 2);
                var posB = new SourcePos("testB", 3, 4);

                var lazyCSuc = new LazyParser(function () {
                    return alwaysCSuc("foo", new State("abc", posA, "none"), new ParseError(posA, []));
                });
                lazyCSuc.run(
                    new State("def", posB, "some"),
                    function (value, state, error) {
                        value.should.equal("foo");
                        State.equals(state, new State("abc", posA, "none")).should.be.ok;
                        ParseError.equals(error, new ParseError(posA, [])).should.be.ok;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                var lazyCErr = new LazyParser(function () {
                    return alwaysCErr(new ParseError(posA, []));
                });
                lazyCErr.run(
                    new State("def", posB, "some"),
                    throwError,
                    function (error) {
                        ParseError.equals(error, new ParseError(posA, [])).should.be.ok;
                    },
                    throwError,
                    throwError
                );

                var lazyESuc = new LazyParser(function () {
                    return alwaysESuc("foo", new State("abc", posA, "none"), new ParseError(posA, []));
                });
                lazyESuc.run(
                    new State("def", posB, "some"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        value.should.equal("foo");
                        State.equals(state, new State("abc", posA, "none")).should.be.ok;
                        ParseError.equals(error, new ParseError(posA, [])).should.be.ok;
                    },
                    throwError
                );

                var lazyEErr = new LazyParser(function () {
                    return alwaysEErr(new ParseError(posA, []));
                });
                lazyEErr.run(
                    new State("def", posB, "some"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        ParseError.equals(error, new ParseError(posA, [])).should.be.ok;
                    }
                );
            });
        });

        describe("parse(state)", function () {
            it("should return a result of parsing", function () {
                var posA = new SourcePos("testA", 1, 2);
                var posB = new SourcePos("testB", 3, 4);

                var lazyCSuc = new LazyParser(function () {
                    return alwaysCSuc("foo", new State("abc", posA, "none"), new ParseError(posA, []));
                });
                var resCSuc = lazyCSuc.parse(new State("def", posB, "some"));
                Result.equals(
                    resCSuc,
                    new Result(true, true, "foo", new State("abc", posA, "none"), new ParseError(posA, []))
                ).should.be.ok;

                var lazyCErr = new LazyParser(function () {
                    return alwaysCErr(new ParseError(posA, []));
                });
                var resCErr = lazyCErr.parse(new State("def", posB, "some"));
                Result.equals(
                    resCErr,
                    new Result(true, false, undefined, undefined, new ParseError(posA, []))
                ).should.be.ok;

                var lazyESuc = new LazyParser(function () {
                    return alwaysESuc("foo", new State("abc", posA, "none"), new ParseError(posA, []));
                });
                var resESuc = lazyESuc.parse(new State("def", posB, "some"));
                Result.equals(
                    resESuc,
                    new Result(false, true, "foo", new State("abc", posA, "none"), new ParseError(posA, []))
                ).should.be.ok;

                var lazyEErr = new LazyParser(function () {
                    return alwaysEErr(new ParseError(posA, []));
                });
                var resEErr = lazyEErr.parse(new State("def", posB, "some"));
                Result.equals(
                    resEErr,
                    new Result(false, false, undefined, undefined, new ParseError(posA, []))
                ).should.be.ok;
            });
        });
    });

    describe("parse(parser, name, input, userState)", function () {
        it("should parse 'input' from the head and return the result of parsing", function () {
            var suc = new Parser(function (state, csuc, cerr, esuc, eerr) {
                State.equals(state, new State("abc", new SourcePos("test", 1, 1), "none"));
                return esuc("foo", state, ParseError.unknown(state.position));
            });
            var resSuc = lq.prim.parse(suc, "test", "abc", "none");
            resSuc.succeeded.should.be.ok;
            resSuc.value.should.equal("foo");

            var err = new Parser(function (state, csuc, cerr, esuc, eerr) {
                State.equals(state, new State("abc", new SourcePos("test", 1, 1), "none"));
                return eerr(new ParseError(state.position, [new ErrorMessage(ErrorMessageType.UNEXPECT, "bar")]));
            });
            var resErr = lq.prim.parse(err, "test", "abc", "none");
            resErr.succeeded.should.not.be.ok;
            ParseError.equals(
                resErr.error,
                new ParseError(new SourcePos("test", 1, 1), [new ErrorMessage(ErrorMessageType.UNEXPECT, "bar")])
            ).should.be.ok;
        });
    });

    describe("fmap(func)", function () {

    });

    describe("pure(value)", function () {

    });

    describe("apply(parserA, parserB)", function () {

    });

    describe("left(parserA, parserB)", function () {

    });

    describe("right(parserA, parserB)", function () {

    });

    describe("bind(parserA, func)", function () {

    });

    describe("then(parserA, parserB)", function () {

    });

    describe("fail(message)", function () {

    });

    describe("mzero", function () {

    });

    describe("mplus(parserA, parserB)", function () {

    });

    describe("label(parser, message)", function () {

    });

    describe("labels(parser, messages)", function () {

    });

    describe("unexpected(message)", function () {

    });

    describe("attempt(parser)", function () {

    });

    describe("lookAhead(parser)", function () {

    });

    describe("manyAccum(accumulate, parser)", function () {

    });

    describe("many(parser)", function () {

    });

    describe("skipMany(parser)", function () {

    });

    describe("tokens(tokensToString, calcNextPos, expectedTokens)", function () {

    });

    describe("token(tokenToString, calcValue, calcPos)", function () {

    });

    describe("tokenPrim(tokenToString, calcValue, calcNextPos[, calcNextUserState])", function () {

    });

    describe("getState", function () {

    });

    describe("setState(state)", function () {

    });

    describe("updateState(func)", function () {

    });

    describe("getInput", function () {

    });

    describe("setInput(input)", function () {

    });

    describe("getPosition", function () {

    });

    describe("setPosition(position)", function () {

    });

    describe("getUserState", function () {

    });

    describe("setUserState(userState)", function () {

    });
});
