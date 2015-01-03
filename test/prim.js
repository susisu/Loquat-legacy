/*
 * Loquat.test / prim.js
 * copyright (c) 2014 Susisu
 */

var chai   = require("chai"),
    expect = chai.expect;

var lq = Object.freeze({
    "array" : require("../lib/array"),
    "error" : require("../lib/error"),
    "pos"   : require("../lib/pos"),
    "prim"  : require("../lib/prim"),
    "util"  : require("../lib/util"),
    "string": require("../lib/string")
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
            expect(state).to.have.property("input");
            expect(state).to.have.property("position").that.is.instanceOf(SourcePos);
            expect(state).to.have.property("userState");
        });

        describe("coustructor(input, position, userState)", function () {
            it("should create a new State object that represents state of parser", function () {
                var state = new State("foo", new SourcePos("test", 1, 2), "none");
                expect(state.input).to.equal("foo");
                expect(SourcePos.equals(state.position, new SourcePos("test", 1, 2))).to.be.true;
                expect(state.userState).to.equal("none");
            });
        });

        describe(".equals(stateA, stateB, inputEquals, userStateEquals)", function () {
            it("should return true when 'stateA' and 'stateB' represent the same state", function () {
                var stateA = new State("foo", new SourcePos("test", 1, 2), "none");
                var stateB = new State("foo", new SourcePos("test", 1, 2), "none");
                expect(State.equals(stateA, stateB)).to.be.true;

                var stateC = new State(["f", "o", "o"], new SourcePos("test", 1, 2), "none");
                var stateD = new State(["f", "o", "o"], new SourcePos("test", 1, 2), "none");
                expect(State.equals(stateC, stateD, lq.util.ArrayUtil.equals)).to.be.true;

                var stateE = new State("foo", new SourcePos("test", 1, 2), [1, 2, 3]);
                var stateF = new State("foo", new SourcePos("test", 1, 2), [1, 2, 3]);
                expect(State.equals(stateE, stateF, undefined, lq.util.ArrayUtil.equals)).to.be.true;
            });

            it("should return false when 'stateA' and 'stateB' represent different states", function () {
                var stateA = new State("foo", new SourcePos("test", 1, 2), "none");
                var stateB = new State("bar", new SourcePos("test", 1, 2), "none");
                expect(State.equals(stateA, stateB)).to.be.false;

                var stateC = new State("foo", new SourcePos("test", 1, 2), "none");
                var stateD = new State("foo", new SourcePos("test", 3, 4), "none");
                expect(State.equals(stateC, stateD)).to.be.false;

                var stateE = new State("foo", new SourcePos("test", 1, 2), "bar");
                var stateF = new State("foo", new SourcePos("test", 3, 4), "baz");
                expect(State.equals(stateE, stateF)).to.be.false;
            });
        });

        describe("#setInput(input)", function () {
            it("should return a copy of the state, the input of which is set to the specified input", function () {
                var state = new State("foo", new SourcePos("test", 1, 2), "none");
                var copy = state.setInput("bar");
                expect(copy).not.to.equal(state);
                expect(copy.input).to.equal("bar");
                expect(SourcePos.equals(copy.position, state.position)).to.be.true;
                expect(copy.userState).to.equal(state.userState);
            });
        });

        describe("#setPosition(position)", function () {
            it("should return a copy of the state, the position of which is set to the specified position", function () {
                var state = new State("foo", new SourcePos("test", 1, 2), "none");
                var copy = state.setPosition(new SourcePos("test", 3, 4));
                expect(copy).not.to.equal(state);
                expect(copy.input).to.equal(state.input);
                expect(SourcePos.equals(copy.position, new SourcePos("test", 3, 4))).to.be.true;
                expect(copy.userState).to.equal(state.userState);
            });
        });

        describe("#setUserState(userState)", function () {
            it("should return a copy of the state, the user state of which is set to the specified user state", function () {
                var state = new State("foo", new SourcePos("test", 1, 2), "none");
                var copy = state.setUserState("some");
                expect(copy).not.to.equal(state);
                expect(copy.input).to.equal(state.input);
                expect(SourcePos.equals(copy.position, state.position)).to.be.true;
                expect(copy.userState).to.equal("some");
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
            expect(res).to.have.property("consumed").that.is.a("boolean");
            expect(res).to.have.property("succeeded").that.is.a("boolean");
            expect(res).to.have.property("value");
            expect(res).to.have.property("state");
            expect(res).to.have.property("error");
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
                expect(res.consumed).to.be.true;
                expect(res.succeeded).to.be.true;
                expect(res.value).to.equal("foo");
                expect(State.equals(res.state, new State("some", pos, "none"))).to.be.true;
                expect(
                    ParseError.equals(res.error,
                        new ParseError(pos, [
                            new ErrorMessage(ErrorMessageType.UNEXPECT, "abc"),
                            new ErrorMessage(ErrorMessageType.EXPECT, "def")
                        ])
                    )
                ).to.be.true;
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
                expect(Result.equals(resA, resB)).to.be.true;

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
                expect(Result.equals(resC, resD, lq.util.ArrayUtil.equals)).to.be.true;
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
                expect(Result.equals(resA, resB)).to.be.false;

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
                expect(Result.equals(resC, resD)).to.be.false;

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
                expect(Result.equals(resE, resF)).to.be.false;

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
                expect(Result.equals(resG, resH)).to.be.false;

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
                expect(Result.equals(resI, resJ)).to.be.false;
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
                expect(function () {
                    var parser = new Parser(function (state, csuc, cerr, esuc, eerr) {
                    /* parser */
                    });
                }).not.to.throw(Error);
            });
        });

        describe("run(state, consumedSucceeded, consumedError, emptySucceeded, emptyError)", function () {
            it("should return a result of parsing generated by 'consumedSucceeded', 'consumedError', 'emptySucceeded' or 'emptyError'", function () {
                var posA = new SourcePos("testA", 1, 2);
                var posB = new SourcePos("testB", 3, 4);

                alwaysCSuc("foo", new State("abc", posA, "none"), new ParseError(posA, [])).run(
                    new State("def", posB, "some"),
                    function (value, state, error) {
                        expect(value).to.equal("foo");
                        expect(State.equals(state, new State("abc", posA, "none"))).to.be.true;
                        expect(ParseError.equals(error, new ParseError(posA, []))).to.be.true;
                    },
                    throwError,
                    throwError,
                    throwError
                );

                alwaysCErr(new ParseError(posA, [])).run(
                    new State("def", posB, "some"),
                    throwError,
                    function (error) {
                        expect(ParseError.equals(error, new ParseError(posA, []))).to.be.true;
                    },
                    throwError,
                    throwError
                );

                alwaysESuc("foo", new State("abc", posA, "none"), new ParseError(posA, [])).run(
                    new State("def", posB, "some"),
                    throwError,
                    throwError,
                    function (value, state, error) {
                        expect(value).to.equal("foo");
                        expect(State.equals(state, new State("abc", posA, "none"))).to.be.true;
                        expect(ParseError.equals(error, new ParseError(posA, []))).to.be.true;
                    },
                    throwError
                );

                alwaysEErr(new ParseError(posA, [])).run(
                    new State("def", posB, "some"),
                    throwError,
                    throwError,
                    throwError,
                    function (error) {
                        expect(ParseError.equals(error, new ParseError(posA, []))).to.be.true;
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
                expect(
                    Result.equals(
                        resCSuc,
                        new Result(true, true, "foo", new State("abc", posA, "none"), new ParseError(posA, []))
                    )
                ).to.be.true;

                var resCErr = alwaysCErr(new ParseError(posA, []))
                    .parse(new State("def", posB, "some"));
                expect(
                    Result.equals(
                        resCErr,
                        new Result(true, false, undefined, undefined, new ParseError(posA, []))
                    )
                ).to.be.true;

                var resESuc = alwaysESuc("foo", new State("abc", posA, "none"), new ParseError(posA, []))
                    .parse(new State("def", posB, "some"));
                expect(
                    Result.equals(
                        resESuc,
                        new Result(false, true, "foo", new State("abc", posA, "none"), new ParseError(posA, []))
                    )
                ).to.be.true;

                var resEErr = alwaysEErr(new ParseError(posA, []))
                    .parse(new State("def", posB, "some"));
                expect(
                    Result.equals(
                        resEErr,
                        new Result(false, false, undefined, undefined, new ParseError(posA, []))
                    )
                ).to.be.true;
            });
        });
    });

    describe("LazyParser", function () {
        describe("constructor(generator)", function () {
            it("should create a new LazyParser object that contains a parser generated by 'generator'", function () {
                expect(function () {
                    var parser = new LazyParser(function () {
                        /* return a parser */
                    });
                }).not.to.throw(Error);
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
                expect(
                    Result.equals(
                        res,
                        new Result(true, true, "foo", new State("abc", posA, "none"), new ParseError(posA, []))
                    )
                ).to.be.true;

                var u;
                var parserB = new LazyParser(function () {
                    return u;
                });
                u = alwaysCSuc("foo", new State("abc", posA, "none"), new ParseError(posA, []));
                u = alwaysCErr(new ParseError(posA, []));
                parserB.init();
                var res = parserB.parse(new State("def", posB, "some"));
                expect(
                    Result.equals(
                        res,
                        new Result(true, false, undefined, undefined, new ParseError(posA, []))
                    )
                ).to.be.true;
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
                        expect(value).to.equal("foo");
                        expect(State.equals(state, new State("abc", posA, "none"))).to.be.true;
                        expect(ParseError.equals(error, new ParseError(posA, []))).to.be.true;
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
                        expect(ParseError.equals(error, new ParseError(posA, []))).to.be.true;
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
                        expect(value).to.equal("foo");
                        expect(State.equals(state, new State("abc", posA, "none"))).to.be.true;
                        expect(ParseError.equals(error, new ParseError(posA, []))).to.be.true;
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
                        expect(ParseError.equals(error, new ParseError(posA, []))).to.be.true;
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
                expect(
                    Result.equals(
                        resCSuc,
                        new Result(true, true, "foo", new State("abc", posA, "none"), new ParseError(posA, []))
                    )
                ).to.be.true;

                var lazyCErr = new LazyParser(function () {
                    return alwaysCErr(new ParseError(posA, []));
                });
                var resCErr = lazyCErr.parse(new State("def", posB, "some"));
                expect(
                    Result.equals(
                        resCErr,
                        new Result(true, false, undefined, undefined, new ParseError(posA, []))
                    )
                ).to.be.true;

                var lazyESuc = new LazyParser(function () {
                    return alwaysESuc("foo", new State("abc", posA, "none"), new ParseError(posA, []));
                });
                var resESuc = lazyESuc.parse(new State("def", posB, "some"));
                expect(
                    Result.equals(
                        resESuc,
                        new Result(false, true, "foo", new State("abc", posA, "none"), new ParseError(posA, []))
                    )
                ).to.be.true;

                var lazyEErr = new LazyParser(function () {
                    return alwaysEErr(new ParseError(posA, []));
                });
                var resEErr = lazyEErr.parse(new State("def", posB, "some"));
                expect(
                    Result.equals(
                        resEErr,
                        new Result(false, false, undefined, undefined, new ParseError(posA, []))
                    )
                ).to.be.true;
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
            expect(resSuc.succeeded).to.be.true;
            expect(resSuc.value).to.equal("foo");

            var err = new Parser(function (state, csuc, cerr, esuc, eerr) {
                State.equals(state, new State("abc", new SourcePos("test", 1, 1), "none"));
                return eerr(new ParseError(state.position, [new ErrorMessage(ErrorMessageType.UNEXPECT, "bar")]));
            });
            var resErr = lq.prim.parse(err, "test", "abc", "none");
            expect(resErr.succeeded).to.be.false;
            expect(
                ParseError.equals(
                    resErr.error,
                    new ParseError(new SourcePos("test", 1, 1), [new ErrorMessage(ErrorMessageType.UNEXPECT, "bar")])
                )
            ).to.be.true;
        });
    });

    describe("fmap(func)", function () {
        it("should map 'func' that take one argument to a function that take a parser", function () {
            function toUpperCase (str) { return str.toUpperCase(); }

            var pos = new SourcePos("test", 1, 2);
            var stateA = new State("abc", pos, "none");
            var stateB = new State("def", pos, "none");

            lq.prim.fmap(toUpperCase)(alwaysCSuc("foo", stateA, ParseError.unknown(pos))).run(
                stateB,
                function (value, newState, error) {
                    expect(value).to.equal("FOO");
                    expect(State.equals(stateA, newState)).to.be.true;
                    expect(ParseError.equals(error, ParseError.unknown(pos))).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.fmap(toUpperCase)(alwaysCErr(ParseError.unknown(pos))).run(
                stateB,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, ParseError.unknown(pos))).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.fmap(toUpperCase)(alwaysESuc("foo", stateA, ParseError.unknown(pos))).run(
                stateB,
                throwError,
                throwError,
                function (value, newState, error) {
                    expect(value).to.equal("FOO");
                    expect(State.equals(stateA, newState)).to.be.true;
                    expect(ParseError.equals(error, ParseError.unknown(pos))).to.be.true;
                },
                throwError
            );

            lq.prim.fmap(toUpperCase)(alwaysEErr(ParseError.unknown(pos))).run(
                stateB,
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, ParseError.unknown(pos))).to.be.true;
                }
            );
        });

        it("should satisfy the functor laws", function () {
            var acsuc = alwaysCSuc(
                "foo",
                new State("abc", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                )
            );
            var acerr = alwaysCErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                )
            );
            var aesuc = alwaysESuc(
                "foo",
                new State("abc", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                )
            );
            var aeerr = alwaysEErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                )
            );
            var initState = new State("abc", SourcePos.init("test"), "none");

            var id = function (x) { return x; };
            var fid = lq.prim.fmap(id);

            expect(
                Result.equals(
                    id(acsuc).parse(initState),
                    fid(acsuc).parse(initState)
                )
            ).to.be.true;

            expect(
                Result.equals(
                    id(acerr).parse(initState),
                    fid(acerr).parse(initState)
                )
            ).to.be.true;

            expect(
                Result.equals(
                    id(aesuc).parse(initState),
                    fid(aesuc).parse(initState)
                )
            ).to.be.true;

            expect(
                Result.equals(
                    id(aeerr).parse(initState),
                    fid(aeerr).parse(initState)
                )
            ).to.be.true;

            function f (str) {
                return str.toUpperCase();
            }

            function g (str) {
                return str + "bar";
            }

            function compose (f, g) {
                return function (x) {
                    return f(g(x));
                };
            }

            var f1 = lq.prim.fmap(compose(f, g));
            var f2 = compose(lq.prim.fmap(f), lq.prim.fmap(g));

            expect(
                Result.equals(
                    f1(acsuc).parse(initState),
                    f2(acsuc).parse(initState)
                )
            ).to.be.true;

            expect(
                Result.equals(
                    f1(acerr).parse(initState),
                    f2(acerr).parse(initState)
                )
            ).to.be.true;

            expect(
                Result.equals(
                    f1(aesuc).parse(initState),
                    f2(aesuc).parse(initState)
                )
            ).to.be.true;

            expect(
                Result.equals(
                    f1(aeerr).parse(initState),
                    f2(aeerr).parse(initState)
                )
            ).to.be.true;
        });
    });

    describe("pure(value)", function () {
        it("should return a parser that always succeeds without consumption, with 'value'", function () {
            lq.prim.pure("foo").run(
                new State("abc", new SourcePos("test", 1, 2), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal("foo");
                    expect(State.equals(state, new State("abc", new SourcePos("test", 1, 2), "none"))).to.be.true;
                    expect(ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2)))).to.be.true;
                },
                throwError
            );
        })
    });

    describe("ap(parserA, parserB)", function () {
        var valueA = function (str) { return str.toUpperCase(); };
        var posA = new SourcePos("test", 1, 2);
        var stateA = new State("abc", posA, "none");
        var errorA = new ParseError(
            posA,
            [new ErrorMessage(ErrorMessageType.MESSAGE, "FOO")]
        );
        var valueB = "bar"
        var posB = new SourcePos("test", 3, 4);
        var stateB = new State("def", posB, "some");
        var errorB = new ParseError(
            posB,
            [new ErrorMessage(ErrorMessageType.MESSAGE, "BAR")]
        );
        it("should return a parser that runs 'parserA', then runs 'parserB' and applies the value (function) of 'parserA' to the value of 'parserB' when 'parserA' succeeded", function () {
            lq.prim.ap(alwaysCSuc(valueA, stateA, errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueB.toUpperCase());
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.ap(alwaysCSuc(valueA, stateA, errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.ap(alwaysCSuc(valueA, stateA, errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueB.toUpperCase());
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.ap(alwaysCSuc(valueA, stateA, errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.ap(alwaysESuc(valueA, stateA, errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueB.toUpperCase());
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.ap(alwaysESuc(valueA, stateA, errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.ap(alwaysESuc(valueA, stateA, errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueB.toUpperCase());
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                },
                throwError
            );

            lq.prim.ap(alwaysESuc(valueA, stateA, errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                }
            );
        });

        it("should return a parser that fails when 'parserA' failed", function () {
            lq.prim.ap(alwaysCErr(errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.ap(alwaysCErr(errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.ap(alwaysCErr(errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.ap(alwaysCErr(errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.ap(alwaysEErr(errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );

            lq.prim.ap(alwaysEErr(errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );

            lq.prim.ap(alwaysEErr(errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );

            lq.prim.ap(alwaysEErr(errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );
        });

        it("should satisfy the applicative laws", function () {
            var acsucv = alwaysCSuc(
                "foo",
                new State("abc", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "csucv")]
                )
            );
            var acsucf = alwaysCSuc(
                function (str) { return str + "bar"; },
                new State("abc", new SourcePos("test", 3, 4), "none"),
                new ParseError(
                    new SourcePos("test", 3, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "csucf")]
                )
            );
            var acerr = alwaysCErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                )
            );
            var aesucv = alwaysESuc(
                "foo",
                new State("abc", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "esucv")]
                )
            );
            var aesucf = alwaysESuc(
                function (str) { return str + "baz"; },
                new State("abc", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "esucf")]
                )
            );
            var aeerr = alwaysEErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                )
            );
            var initState = new State("abc", SourcePos.init("test"), "none");

            var id = function (x) { return x; };

            [acsucv, acerr, aesucv, aeerr].forEach(function (v) {
                expect(
                    Result.equals(
                        lq.prim.ap(lq.prim.pure(id), v).parse(initState),
                        v.parse(initState)
                    )
                ).to.be.true;
            });

            var compose = function (f) {
                return function (g) {
                    return function (x) {
                        return f(g(x));
                    };
                };
            };

            [acsucf, acerr, aesucf, aeerr].forEach(function (u) {
                [acsucf, acerr, aesucf, aeerr].forEach(function (v) {
                    [acsucv, acerr, aesucv, aeerr].forEach(function (w) {
                        expect(
                            Result.equals(
                                lq.prim.ap(
                                    lq.prim.ap(
                                        lq.prim.ap(
                                            lq.prim.pure(compose),
                                            u
                                        ),
                                        v
                                    ),
                                    w
                                ).parse(initState),
                                lq.prim.ap(u, lq.prim.ap(v, w)).parse(initState)
                            )
                        ).to.be.true;
                    });
                });
            });

            var f = function (str) { str.toUpperCase(); };
            var x = "foo";

            expect(
                Result.equals(
                    lq.prim.ap(lq.prim.pure(f), lq.prim.pure(x)).parse(initState),
                    lq.prim.pure(f(x)).parse(initState)
                )
            ).to.be.true;

            var y = "bar";
            var fapply = function (x) {
                return function (f) {
                    return f(x);
                };
            };

            [acsucf, acerr, aesucf, aeerr].forEach(function (u) {
                expect(
                    Result.equals(
                        lq.prim.ap(u, lq.prim.pure(y)).parse(initState),
                        lq.prim.ap(lq.prim.pure(fapply(y)), u).parse(initState)
                    )
                ).to.be.true;
            });
        });
    });

    describe("left(parserA, parserB)", function () {
        var valueA = "foo"
        var posA = new SourcePos("test", 1, 2);
        var stateA = new State("abc", posA, "none");
        var errorA = new ParseError(
            posA,
            [new ErrorMessage(ErrorMessageType.MESSAGE, "FOO")]
        );
        var valueB = "bar"
        var posB = new SourcePos("test", 3, 4);
        var stateB = new State("def", posB, "some");
        var errorB = new ParseError(
            posB,
            [new ErrorMessage(ErrorMessageType.MESSAGE, "BAR")]
        );
        it("should return a parser that runs 'parserA', then runs 'parserB' and takes the value of 'parserA' when 'parserA' succeeded", function () {
            lq.prim.left(alwaysCSuc(valueA, stateA, errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.left(alwaysCSuc(valueA, stateA, errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.left(alwaysCSuc(valueA, stateA, errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.left(alwaysCSuc(valueA, stateA, errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.left(alwaysESuc(valueA, stateA, errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.left(alwaysESuc(valueA, stateA, errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.left(alwaysESuc(valueA, stateA, errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                },
                throwError
            );

            lq.prim.left(alwaysESuc(valueA, stateA, errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                }
            );
        });

        it("should return a parser that fails when 'parserA' failed", function () {
            lq.prim.left(alwaysCErr(errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.left(alwaysCErr(errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.left(alwaysCErr(errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.left(alwaysCErr(errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.left(alwaysEErr(errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );

            lq.prim.left(alwaysEErr(errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );

            lq.prim.left(alwaysEErr(errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );

            lq.prim.left(alwaysEErr(errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );
        });
    });

    describe("right(parserA, parserB)", function () {
        var valueA = "foo"
        var posA = new SourcePos("test", 1, 2);
        var stateA = new State("abc", posA, "none");
        var errorA = new ParseError(
            posA,
            [new ErrorMessage(ErrorMessageType.MESSAGE, "FOO")]
        );
        var valueB = "bar"
        var posB = new SourcePos("test", 3, 4);
        var stateB = new State("def", posB, "some");
        var errorB = new ParseError(
            posB,
            [new ErrorMessage(ErrorMessageType.MESSAGE, "BAR")]
        );
        it("should return a parser that runs 'parserA' then runs 'parserB' and takes the value of 'parserB' when 'parserA' succeeded", function () {
            lq.prim.right(alwaysCSuc(valueA, stateA, errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.right(alwaysCSuc(valueA, stateA, errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.right(alwaysCSuc(valueA, stateA, errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.right(alwaysCSuc(valueA, stateA, errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.right(alwaysESuc(valueA, stateA, errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.right(alwaysESuc(valueA, stateA, errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.right(alwaysESuc(valueA, stateA, errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                },
                throwError
            );

            lq.prim.right(alwaysESuc(valueA, stateA, errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                }
            );
        });

        it("should return a parser that fails when 'parserA' failed", function () {
            lq.prim.right(alwaysCErr(errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.right(alwaysCErr(errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.right(alwaysCErr(errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.right(alwaysCErr(errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.right(alwaysEErr(errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );

            lq.prim.right(alwaysEErr(errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );

            lq.prim.right(alwaysEErr(errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );

            lq.prim.right(alwaysEErr(errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );
        });
    });

    describe("bind(parserA, func)", function () {
        var valueA = "foo"
        var posA = new SourcePos("test", 1, 2);
        var stateA = new State("abc", posA, "none");
        var errorA = new ParseError(
            posA,
            [new ErrorMessage(ErrorMessageType.MESSAGE, "FOO")]
        );
        var valueB = "bar"
        var posB = new SourcePos("test", 3, 4);
        var stateB = new State("def", posB, "some");
        var errorB = new ParseError(
            posB,
            [new ErrorMessage(ErrorMessageType.MESSAGE, "BAR")]
        );
        it("should return a parser that runs 'parserA', then applies the value to 'func' and run the returned parser when 'parserA' succeeded", function () {
            lq.prim.bind(alwaysCSuc(valueA, stateA, errorA), function (value) {
                expect(value).to.equal(valueA);
                return alwaysCSuc(valueB, stateB, errorB);
            }).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.bind(alwaysCSuc(valueA, stateA, errorA), function (value) {
                expect(value).to.equal(valueA);
                return alwaysCErr(errorB);
            }).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.bind(alwaysCSuc(valueA, stateA, errorA), function (value) {
                expect(value).to.equal(valueA);
                return alwaysESuc(valueB, stateB, errorB);
            }).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.bind(alwaysCSuc(valueA, stateA, errorA), function (value) {
                expect(value).to.equal(valueA);
                return alwaysEErr(errorB);
            }).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.bind(alwaysESuc(valueA, stateA, errorA), function (value) {
                expect(value).to.equal(valueA);
                return alwaysCSuc(valueB, stateB, errorB);
            }).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.bind(alwaysESuc(valueA, stateA, errorA), function (value) {
                expect(value).to.equal(valueA);
                return alwaysCErr(errorB);
            }).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.bind(alwaysESuc(valueA, stateA, errorA), function (value) {
                expect(value).to.equal(valueA);
                return alwaysESuc(valueB, stateB, errorB);
            }).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                },
                throwError
            );

            lq.prim.bind(alwaysESuc(valueA, stateA, errorA), function (value) {
                expect(value).to.equal(valueA);
                return alwaysEErr(errorB);
            }).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                }
            );
        });

        it("should return a parser that fails when 'parserA' failed", function () {
            lq.prim.bind(alwaysCErr(errorA), function (value) {
                expect(value).to.equal(valueA);
                return alwaysCSuc(valueB, stateB, errorB);
            }).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.bind(alwaysCErr(errorA), function (value) {
                expect(value).to.equal(valueA);
                return alwaysCErr(errorB);
            }).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.bind(alwaysCErr(errorA), function (value) {
                expect(value).to.equal(valueA);
                return alwaysESuc(valueB, stateB, errorB);
            }).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.bind(alwaysCErr(errorA), function (value) {
                expect(value).to.equal(valueA);
                return alwaysEErr(errorB);
            }).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.bind(alwaysEErr(errorA), function (value) {
                expect(value).to.equal(valueA);
                return alwaysCSuc(valueB, stateB, errorB);
            }).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );

            lq.prim.bind(alwaysEErr(errorA), function (value) {
                expect(value).to.equal(valueA);
                return alwaysCErr(errorB);
            }).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );

            lq.prim.bind(alwaysEErr(errorA), function (value) {
                expect(value).to.equal(valueA);
                return alwaysESuc(valueB, stateB, errorB);
            }).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );

            lq.prim.bind(alwaysEErr(errorA), function (value) {
                expect(value).to.equal(valueA);
                return alwaysEErr(errorB);
            }).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );
        });

        it("should satisfy the monad laws", function () {
            var acsuc = alwaysCSuc(
                "foo",
                new State("abc", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                )
            );
            var acerr = alwaysCErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                )
            );
            var aesuc = alwaysESuc(
                "foo",
                new State("abc", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                )
            );
            var aeerr = alwaysEErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                )
            );
            var fcsuc = function (str) {
                return alwaysCSuc(
                    str + "bar",
                    new State("def", new SourcePos("test", 3, 4), "some"),
                    new ParseError(
                        new SourcePos("test", 3, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "csucf")]
                    )
                );
            };
            var fcerr = function (str) {
                return alwaysCErr(
                    new ParseError(
                        new SourcePos("test", 3, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "cerrf")]
                    )
                );
            };
            var fesuc = function (str) {
                return alwaysESuc(
                    str + "baz",
                    new State("def", new SourcePos("test", 3, 4), "some"),
                    new ParseError(
                        new SourcePos("test", 3, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "esucf")]
                    )
                );
            };
            var feerr = function (str) {
                return alwaysEErr(
                    new ParseError(
                        new SourcePos("test", 3, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "cerrf")]
                    )
                );
            };
            var initState = new State("abc", SourcePos.init("test"), "none");

            [fcsuc, fcerr, fesuc, feerr].forEach(function (f) {
                var x = "foo";
                expect(
                    Result.equals(
                        lq.prim.bind(lq.prim.pure(x), f).parse(initState),
                        f(x).parse(initState)
                    )
                ).to.be.true;
            });

            [acsuc, acerr, aesuc, aeerr].forEach(function (m) {
                expect(
                    Result.equals(
                        lq.prim.bind(m, lq.prim.pure).parse(initState),
                        m.parse(initState)
                    )
                ).to.be.true;
            });

            [acsuc, acerr, aesuc, aeerr].forEach(function (m) {
                [fcsuc, fcerr, fesuc, feerr].forEach(function (f) {
                     [fcsuc, fcerr, fesuc, feerr].forEach(function (g) {
                        expect(
                            Result.equals(
                                lq.prim.bind(lq.prim.bind(m, f), g).parse(initState),
                                lq.prim.bind(
                                    m,
                                    function (x) {
                                        return lq.prim.bind(f(x), g);
                                    }
                                ).parse(initState)
                            )
                        ).to.be.true;
                     });
                });
            });
        });
    });

    describe("then(parserA, parserB)", function () {
        var valueA = "foo"
        var posA = new SourcePos("test", 1, 2);
        var stateA = new State("abc", posA, "none");
        var errorA = new ParseError(
            posA,
            [new ErrorMessage(ErrorMessageType.MESSAGE, "FOO")]
        );
        var valueB = "bar"
        var posB = new SourcePos("test", 3, 4);
        var stateB = new State("def", posB, "some");
        var errorB = new ParseError(
            posB,
            [new ErrorMessage(ErrorMessageType.MESSAGE, "BAR")]
        );
        it("should return a parser that runs 'parserA', then runs 'parserB' when 'parserA' succeeded", function () {
            lq.prim.then(alwaysCSuc(valueA, stateA, errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.then(alwaysCSuc(valueA, stateA, errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.then(alwaysCSuc(valueA, stateA, errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.then(alwaysCSuc(valueA, stateA, errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.then(alwaysESuc(valueA, stateA, errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.then(alwaysESuc(valueA, stateA, errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.then(alwaysESuc(valueA, stateA, errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                },
                throwError
            );

            lq.prim.then(alwaysESuc(valueA, stateA, errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                }
            );
        });

        it("should return a parser that fails when 'parserA' failed", function () {
            lq.prim.then(alwaysCErr(errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.then(alwaysCErr(errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.then(alwaysCErr(errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.then(alwaysCErr(errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.then(alwaysEErr(errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );

            lq.prim.then(alwaysEErr(errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );

            lq.prim.then(alwaysEErr(errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );

            lq.prim.then(alwaysEErr(errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );
        });
    });

    describe("fail(message)", function () {
        it("should return a parser that always fails with specified message", function () {
            lq.prim.fail("foo").run(
                new State("abc", new SourcePos("test", 1, 2), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                            )
                        )
                    ).to.be.true;
                }
            );
        });
    });

    describe("mzero", function () {
        it("should always fail without consumption, with unknown error", function () {
            lq.prim.mzero.run(
                new State("foo", new SourcePos("test", 1, 2), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2)))).to.be.true;
                }
            );
        });
    });

    describe("mplus(parserA, parserB)", function () {
        var valueA = "foo"
        var posA = new SourcePos("test", 1, 2);
        var stateA = new State("abc", posA, "none");
        var errorA = new ParseError(
            posA,
            [new ErrorMessage(ErrorMessageType.MESSAGE, "FOO")]
        );
        var valueB = "bar"
        var posB = new SourcePos("test", 3, 4);
        var stateB = new State("def", posB, "some");
        var errorB = new ParseError(
            posB,
            [new ErrorMessage(ErrorMessageType.MESSAGE, "BAR")]
        );
        it("should return a parser that runs 'parserA' and takes the value of it when 'parserA' succeeded", function () {
            lq.prim.mplus(alwaysCSuc(valueA, stateA, errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateA)).to.be.true;
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.mplus(alwaysCSuc(valueA, stateA, errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateA)).to.be.true;
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.mplus(alwaysCSuc(valueA, stateA, errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateA)).to.be.true;
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.mplus(alwaysCSuc(valueA, stateA, errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateA)).to.be.true;
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.mplus(alwaysESuc(valueA, stateA, errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateA)).to.be.true;
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError
            );

            lq.prim.mplus(alwaysESuc(valueA, stateA, errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateA)).to.be.true;
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError
            );

            lq.prim.mplus(alwaysESuc(valueA, stateA, errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateA)).to.be.true;
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError
            );

            lq.prim.mplus(alwaysESuc(valueA, stateA, errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateA)).to.be.true;
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError
            );
        });

        it("should return a parser that runs 'parserA', then runs 'parserB' and takes the value of it when 'parserA' failed without consumption", function () {
            lq.prim.mplus(alwaysCErr(errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.mplus(alwaysCErr(errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.mplus(alwaysCErr(errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.mplus(alwaysCErr(errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                     expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.mplus(alwaysEErr(errorA), alwaysCSuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.mplus(alwaysEErr(errorA), alwaysCErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.mplus(alwaysEErr(errorA), alwaysESuc(valueB, stateB, errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                },
                throwError
            );

            lq.prim.mplus(alwaysEErr(errorA), alwaysEErr(errorB)).run(
                SourcePos.init("test"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, ParseError.merge(errorA, errorB))).to.be.true;
                }
            );
        });

        it("should satisfy the monoid laws", function () {
            var acsuc = alwaysCSuc(
                "foo",
                new State("abc", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "csuc")]
                )
            );
            var acerr = alwaysCErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "cerr")]
                )
            );
            var aesuc = alwaysESuc(
                "foo",
                new State("abc", new SourcePos("test", 1, 2), "none"),
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "esuc")]
                )
            );
            var aeerr = alwaysEErr(
                new ParseError(
                    new SourcePos("test", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "eerr")]
                )
            );
            var initState = new State("abc", SourcePos.init("test"), "none");

            [acsuc, acerr, aesuc, aeerr].forEach(function (x) {
                [acsuc, acerr, aesuc, aeerr].forEach(function (y) {
                    [acsuc, acerr, aesuc, aeerr].forEach(function (z) {
                        expect(
                            Result.equals(
                                lq.prim.mplus(lq.prim.mplus(x, y), z).parse(initState),
                                lq.prim.mplus(x, lq.prim.mplus(y, z)).parse(initState)
                            )
                        ).to.be.true;
                    });
                });
            });

            [acsuc, acerr, aesuc, aeerr].forEach(function (x) {
                expect(
                    Result.equals(
                        lq.prim.mplus(x, lq.prim.mzero).parse(initState),
                        x.parse(initState)
                    )
                ).to.be.true;

                expect(
                    Result.equals(
                        lq.prim.mplus(lq.prim.mzero, x).parse(initState),
                        x.parse(initState)
                    )
                ).to.be.true;
            });
        });
    });

    describe("label(parser, message)", function () {
        it("should return a parser labeled with 'message'", function () {
            var valueA = "foo"
            var posA = new SourcePos("test", 1, 2);
            var stateA = new State("abc", posA, "none");
            var errorA = new ParseError(
                posA,
                [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
            );
            lq.prim.label(alwaysCSuc(valueA, stateA, errorA), "baz").run(
                new State("def", new SourcePos("test", 3, 4), "some"),
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateA)).to.be.true;
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.label(alwaysCErr(errorA), "baz").run(
                new State("def", new SourcePos("test", 3, 4), "some"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.label(alwaysESuc(valueA, stateA, errorA), "baz").run(
                new State("def", new SourcePos("test", 3, 4), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateA)).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                posA,
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "bar"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "baz")
                                ]
                            )
                        )
                    ).to.be.true;
                },
                throwError
            );

            lq.prim.label(alwaysEErr(errorA), "baz").run(
                new State("def", new SourcePos("test", 3, 4), "some"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                posA,
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "bar"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "baz")
                                ]
                            )
                        )
                    ).to.be.true;
                }
            );

            var valueB = "foo"
            var posB = new SourcePos("test", 1, 2);
            var stateB = new State("abc", posB, "none");
            var errorB = ParseError.unknown(posB);
            lq.prim.label(alwaysCSuc(valueB, stateB, errorB), "baz").run(
                new State("def", new SourcePos("test", 3, 4), "some"),
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.label(alwaysCErr(errorB), "baz").run(
                new State("def", new SourcePos("test", 3, 4), "some"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.label(alwaysESuc(valueB, stateB, errorB), "baz").run(
                new State("def", new SourcePos("test", 3, 4), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError
            );

            lq.prim.label(alwaysEErr(errorB), "baz").run(
                new State("def", new SourcePos("test", 3, 4), "some"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                posB,
                                [new ErrorMessage(ErrorMessageType.EXPECT, "baz")]
                            )
                        )
                    ).to.be.true;
                }
            );
        });
    });

    describe("labels(parser, messages)", function () {
        it("should return a parser labeled with each message of 'messages'", function () {
            var valueA = "foo"
            var posA = new SourcePos("test", 1, 2);
            var stateA = new State("abc", posA, "none");
            var errorA = new ParseError(
                posA,
                [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
            );
            lq.prim.labels(alwaysCSuc(valueA, stateA, errorA), ["uno", "dos", "tres"]).run(
                new State("def", new SourcePos("test", 3, 4), "some"),
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateA)).to.be.true;
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.labels(alwaysCErr(errorA), ["uno", "dos", "tres"]).run(
                new State("def", new SourcePos("test", 3, 4), "some"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.labels(alwaysESuc(valueA, stateA, errorA), ["uno", "dos", "tres"]).run(
                new State("def", new SourcePos("test", 3, 4), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateA)).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                posA,
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "bar"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "uno"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "dos"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "tres")
                                ]
                            )
                        )
                    ).to.be.true;
                },
                throwError
            );

            lq.prim.labels(alwaysEErr(errorA), ["uno", "dos", "tres"]).run(
                new State("def", new SourcePos("test", 3, 4), "some"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                posA,
                                [
                                    new ErrorMessage(ErrorMessageType.MESSAGE, "bar"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "uno"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "dos"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "tres")
                                ]
                            )
                        )
                    ).to.be.true;
                }
            );

            var valueB = "foo"
            var posB = new SourcePos("test", 1, 2);
            var stateB = new State("abc", posB, "none");
            var errorB = ParseError.unknown(posB);
            lq.prim.labels(alwaysCSuc(valueB, stateB, errorB), ["uno", "dos", "tres"]).run(
                new State("def", new SourcePos("test", 3, 4), "some"),
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.labels(alwaysCErr(errorB), ["uno", "dos", "tres"]).run(
                new State("def", new SourcePos("test", 3, 4), "some"),
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.labels(alwaysESuc(valueB, stateB, errorB), ["uno", "dos", "tres"]).run(
                new State("def", new SourcePos("test", 3, 4), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueB);
                    expect(State.equals(state, stateB)).to.be.true;
                    expect(ParseError.equals(error, errorB)).to.be.true;
                },
                throwError
            );

            lq.prim.labels(alwaysEErr(errorB), ["uno", "dos", "tres"]).run(
                new State("def", new SourcePos("test", 3, 4), "some"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                posB,
                                [
                                    new ErrorMessage(ErrorMessageType.EXPECT, "uno"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "dos"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "tres")
                                ]
                            )
                        )
                    ).to.be.true;
                }
            );
        });
    });

    describe("unexpected(message)", function () {
        it("should return a parser that always fails with unexpect error", function () {
            lq.prim.unexpected("foo").run(
                new State("abc", new SourcePos("test", 1, 2), "none"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 2),
                                [new ErrorMessage(ErrorMessageType.UNEXPECT, "foo")]
                            )
                        )
                    ).to.be.true;
                }
            );
        });
    });

    describe("try(parser)", function () {
        it("should be a synonym for 'attempt'", function () {
            expect(lq.prim.try).to.equal(lq.prim.attempt);
        });
    });

    describe("attempt(parser)", function () {
        it("should return a parser that always treats any failure from 'parser' as the parser didn't consume", function () {
            var valueA = "foo"
            var posA = new SourcePos("test", 1, 2);
            var stateA = new State("abc", posA, "none");
            var errorA = new ParseError(
                posA,
                [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
            );

            lq.prim.attempt(alwaysCSuc(valueA, stateA, errorA)).run(
                new State("def", SourcePos.init("test"), "some"),
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateA)).to.be.true;
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.attempt(alwaysCErr(errorA)).run(
                new State("def", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );

            lq.prim.attempt(alwaysESuc(valueA, stateA, errorA)).run(
                new State("def", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, stateA)).to.be.true;
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError
            );

            lq.prim.attempt(alwaysEErr(errorA)).run(
                new State("def", SourcePos.init("test"), "some"),
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );
        });
    });

    describe("lookAhead(parser)", function () {
        it("should return a parser that runs 'parser' but doesn't consume the input and reports no error, the state remains intact", function () {
            var valueA = "foo"
            var posA = new SourcePos("test", 1, 2);
            var stateA = new State("abc", posA, "none");
            var errorA = new ParseError(
                posA,
                [new ErrorMessage(ErrorMessageType.MESSAGE, "bar")]
            );
            var origState = new State("def", SourcePos.init("test"), "some");

            lq.prim.lookAhead(alwaysCSuc(valueA, stateA, errorA)).run(
                origState,
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, origState)).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            ParseError.unknown(SourcePos.init("test"))
                        )
                    ).to.be.true;
                },
                throwError
            );

            lq.prim.lookAhead(alwaysCErr(errorA)).run(
                origState,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.lookAhead(alwaysESuc(valueA, stateA, errorA)).run(
                origState,
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal(valueA);
                    expect(State.equals(state, origState)).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            ParseError.unknown(SourcePos.init("test"))
                        )
                    ).to.be.true;
                },
                throwError
            );

            lq.prim.lookAhead(alwaysEErr(errorA)).run(
                origState,
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(ParseError.equals(error, errorA)).to.be.true;
                }
            );
        });
    });

    describe("manyAccum(accumulate, parser)", function () {
        it("should return a parser that runs 'parser' repeatedly and accumulates the results of them by 'accumulate'", function () {
            lq.prim.manyAccum(
                function (value, accum) {
                    return accum.concat(value);
                },
                new Parser(function (state, csuc, cerr, esuc, eerr) {
                    if (state.input[0] === "a") {
                        var newPosition = new SourcePos(state.position.name, state.position.line, state.position.column + 1);
                        return csuc(
                            "a",
                            new State(state.input.substr(1), newPosition, state.userState),
                            ParseError.unknown(newPosition)
                        );
                    }
                    else {
                        return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.UNEXPECT, state.input[0])]
                            )
                        );
                    }
                })
            ).run(
                new State("aaab", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    expect(value).to.deep.equal(["a", "a", "a"]);
                    expect(State.equals(state, new State("b", new SourcePos("test", 1, 4), "none"))).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                             new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.UNEXPECT, "b")]
                            )
                        )
                    ).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.manyAccum(
                function (value, accum) {
                    return accum.concat(value);
                },
                new Parser(function (state, csuc, cerr, esuc, eerr) {
                    if (state.input[0] === "a") {
                        var newPosition = new SourcePos(state.position.name, state.position.line, state.position.column + 1);
                        return csuc(
                            "a",
                            new State(state.input.substr(1), newPosition, state.userState),
                            ParseError.unknown(newPosition)
                        );
                    }
                    else {
                        return cerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.UNEXPECT, state.input[0])]
                            )
                        );
                    }
                })
            ).run(
                new State("aaab", SourcePos.init("test"), "none"),
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.UNEXPECT, "b")]
                            )
                        )
                    ).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.manyAccum(
                function (value, accum) {
                    return accum.concat(value);
                },
                alwaysCErr(
                    new ParseError(
                        new SourcePos("test", 100, 200),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                    )
                )
            ).run(
                new State("aaab", SourcePos.init("test"), "none"),
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 100, 200),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                            )
                        )
                    ).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.manyAccum(
                function (value, accum) {
                    return accum.concat(value);
                },
                alwaysEErr(
                    new ParseError(
                        new SourcePos("test", 100, 200),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                    )
                )
            ).run(
                new State("aaab", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.deep.equal([]);
                    expect(State.equals(state, new State("aaab", SourcePos.init("test"), "none"))).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 100, 200),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                            )
                        )
                    ).to.be.true;
                },
                throwError
            );

            expect(function () {
                lq.prim.manyAccum(
                    function (value, accum) {
                        return accum.concat(value);
                    },
                    new Parser(function (state, csuc, cerr, esuc, eerr) {
                        if (state.input[0] === "a") {
                            var newPosition = new SourcePos(state.position.name, state.position.line, state.position.column + 1);
                            return csuc(
                                "a",
                                new State(state.input.substr(1), newPosition, state.userState),
                                ParseError.unknown(newPosition)
                            );
                        }
                        else {
                            return esuc(
                                state.input[0],
                                state,
                                ParseError.unknown(state.position)
                            );
                        }
                    })
                ).run(
                    new State("aaab", SourcePos.init("test"), "none"),
                    function () {},
                    function () {},
                    function () {},
                    function () {}
                );
            }).to.throw(Error);

            expect(function () {
                lq.prim.manyAccum(
                    function (value, accum) {
                        return accum.concat(value);
                    },
                    alwaysESuc(
                        "foo",
                        new State("def", new SourcePos("test", 100, 200), "some"),
                        new ParseError(
                            new SourcePos("test", 100, 200),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                        )
                    )
                ).run(
                    new State("aaab", SourcePos.init("test"), "none"),
                    function () {},
                    function () {},
                    function () {},
                    function () {}
                );
            }).to.throw(Error);
        });
    });

    describe("many(parser)", function () {
        it("should return a parser that runs 'parser' repeatedly and accumulates the results of them in an array", function () {
            lq.prim.many(
                new Parser(function (state, csuc, cerr, esuc, eerr) {
                    if (state.input[0] === "a") {
                        var newPosition = new SourcePos(state.position.name, state.position.line, state.position.column + 1);
                        return csuc(
                            "a",
                            new State(state.input.substr(1), newPosition, state.userState),
                            ParseError.unknown(newPosition)
                        );
                    }
                    else {
                        return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.UNEXPECT, state.input[0])]
                            )
                        );
                    }
                })
            ).run(
                new State("aaab", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    expect(value).to.deep.equal(["a", "a", "a"]);
                    expect(State.equals(state, new State("b", new SourcePos("test", 1, 4), "none"))).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                             new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.UNEXPECT, "b")]
                            )
                        )
                    ).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.many(
                new Parser(function (state, csuc, cerr, esuc, eerr) {
                    if (state.input[0] === "a") {
                        var newPosition = new SourcePos(state.position.name, state.position.line, state.position.column + 1);
                        return csuc(
                            "a",
                            new State(state.input.substr(1), newPosition, state.userState),
                            ParseError.unknown(newPosition)
                        );
                    }
                    else {
                        return cerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.UNEXPECT, state.input[0])]
                            )
                        );
                    }
                })
            ).run(
                new State("aaab", SourcePos.init("test"), "none"),
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.UNEXPECT, "b")]
                            )
                        )
                    ).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.many(
                alwaysCErr(
                    new ParseError(
                        new SourcePos("test", 100, 200),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                    )
                )
            ).run(
                new State("aaab", SourcePos.init("test"), "none"),
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 100, 200),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                            )
                        )
                    ).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.many(
                alwaysEErr(
                    new ParseError(
                        new SourcePos("test", 100, 200),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                    )
                )
            ).run(
                new State("aaab", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.deep.equal([]);
                    expect(State.equals(state, new State("aaab", SourcePos.init("test"), "none"))).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 100, 200),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                            )
                        )
                    ).to.be.true;
                },
                throwError
            );

            expect(function () {
                lq.prim.many(
                    new Parser(function (state, csuc, cerr, esuc, eerr) {
                        if (state.input[0] === "a") {
                            var newPosition = new SourcePos(state.position.name, state.position.line, state.position.column + 1);
                            return csuc(
                                "a",
                                new State(state.input.substr(1), newPosition, state.userState),
                                ParseError.unknown(newPosition)
                            );
                        }
                        else {
                            return esuc(
                                state.input[0],
                                state,
                                ParseError.unknown(state.position)
                            );
                        }
                    })
                ).run(
                    new State("aaab", SourcePos.init("test"), "none"),
                    function () {},
                    function () {},
                    function () {},
                    function () {}
                );
            }).to.throw(Error);

            expect(function () {
                lq.prim.many(
                    alwaysESuc(
                        "foo",
                        new State("def", new SourcePos("test", 100, 200), "some"),
                        new ParseError(
                            new SourcePos("test", 100, 200),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                        )
                    )
                ).run(
                    new State("aaab", SourcePos.init("test"), "none"),
                    function () {},
                    function () {},
                    function () {},
                    function () {}
                );
            }).to.throw(Error);
        });
    });

    describe("skipMany(parser)", function () {
        it("should return a parser that runs 'parser' repeatedly and ignores all the results of them", function () {
            lq.prim.skipMany(
                new Parser(function (state, csuc, cerr, esuc, eerr) {
                    if (state.input[0] === "a") {
                        var newPosition = new SourcePos(state.position.name, state.position.line, state.position.column + 1);
                        return csuc(
                            "a",
                            new State(state.input.substr(1), newPosition, state.userState),
                            ParseError.unknown(newPosition)
                        );
                    }
                    else {
                        return eerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.UNEXPECT, state.input[0])]
                            )
                        );
                    }
                })
            ).run(
                new State("aaab", SourcePos.init("test"), "none"),
                function (value, state, error) {
                    expect(value).to.be.undefined;
                    expect(State.equals(state, new State("b", new SourcePos("test", 1, 4), "none"))).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                             new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.UNEXPECT, "b")]
                            )
                        )
                    ).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            lq.prim.skipMany(
                new Parser(function (state, csuc, cerr, esuc, eerr) {
                    if (state.input[0] === "a") {
                        var newPosition = new SourcePos(state.position.name, state.position.line, state.position.column + 1);
                        return csuc(
                            "a",
                            new State(state.input.substr(1), newPosition, state.userState),
                            ParseError.unknown(newPosition)
                        );
                    }
                    else {
                        return cerr(
                            new ParseError(
                                state.position,
                                [new ErrorMessage(ErrorMessageType.UNEXPECT, state.input[0])]
                            )
                        );
                    }
                })
            ).run(
                new State("aaab", SourcePos.init("test"), "none"),
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 1, 4),
                                [new ErrorMessage(ErrorMessageType.UNEXPECT, "b")]
                            )
                        )
                    ).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.skipMany(
                alwaysCErr(
                    new ParseError(
                        new SourcePos("test", 100, 200),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                    )
                )
            ).run(
                new State("aaab", SourcePos.init("test"), "none"),
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 100, 200),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                            )
                        )
                    ).to.be.true;
                },
                throwError,
                throwError
            );

            lq.prim.skipMany(
                alwaysEErr(
                    new ParseError(
                        new SourcePos("test", 100, 200),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                    )
                )
            ).run(
                new State("aaab", SourcePos.init("test"), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.be.undefined;
                    expect(State.equals(state, new State("aaab", SourcePos.init("test"), "none"))).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                new SourcePos("test", 100, 200),
                                [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                            )
                        )
                    ).to.be.true;
                },
                throwError
            );

            expect(function () {
                lq.prim.skipMany(
                    new Parser(function (state, csuc, cerr, esuc, eerr) {
                        if (state.input[0] === "a") {
                            var newPosition = new SourcePos(state.position.name, state.position.line, state.position.column + 1);
                            return csuc(
                                "a",
                                new State(state.input.substr(1), newPosition, state.userState),
                                ParseError.unknown(newPosition)
                            );
                        }
                        else {
                            return esuc(
                                state.input[0],
                                state,
                                ParseError.unknown(state.position)
                            );
                        }
                    })
                ).run(
                    new State("aaab", SourcePos.init("test"), "none"),
                    function () {},
                    function () {},
                    function () {},
                    function () {}
                );
            }).to.throw(Error);

            expect(function () {
                lq.prim.skipMany(
                    alwaysESuc(
                        "foo",
                        new State("def", new SourcePos("test", 100, 200), "some"),
                        new ParseError(
                            new SourcePos("test", 100, 200),
                            [new ErrorMessage(ErrorMessageType.MESSAGE, "foo")]
                        )
                    )
                ).run(
                    new State("aaab", SourcePos.init("test"), "none"),
                    function () {},
                    function () {},
                    function () {},
                    function () {}
                );
            }).to.throw(Error);
        });
    });

    describe("tokens(tokensToString, calcNextPos, expectedTokens, tokenEquals)", function () {
        it("should return a parser that parses token sequence", function () {
            var tokensA = [[1, 2, "foo"], [3, 4, "bar"]];
            var streamA = [[1, 2, "foo"], [3, 4, "bar"], [5, 6, "baz"]];
            var stateA = new State(streamA, SourcePos.init("test"), "none");
            lq.prim.tokens(
                function (tokens) {
                    return tokens.map(function (token) {
                        return "line " + token[0].toString()
                            + ", column " + token[1].toString()
                            + ": " + token[2];
                    }).join("; ");
                },
                function (position, expectedTokens) {
                    var last = expectedTokens[expectedTokens.length - 1];
                    return new SourcePos("test", last[0], last[1]);
                },
                tokensA,
                lq.util.ArrayUtil.equals
            ).run(
                stateA,
                function (value, state, error) {
                    expect(value).to.deep.equal(tokensA);
                    expect(
                        State.equals(
                            state,
                            new State([[5, 6, "baz"]], new SourcePos("test", 3, 4), "none"),
                            function (inputA, inputB) {
                                return lq.util.ArrayUtil.equals(inputA, inputB, lq.util.ArrayUtil.equals);
                            }
                        )
                    ).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 3, 4))
                        )
                    ).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            var tokensB = [[1, 2, "foo"], [3, 4, "bar"]];
            var streamB = [[1, 2, "foo"]];
            var stateB = new State(streamB, SourcePos.init("test"), "none");
            lq.prim.tokens(
                function (tokens) {
                    return tokens.map(function (token) {
                        return "line " + token[0].toString()
                            + ", column " + token[1].toString()
                            + ": " + token[2];
                    }).join("; ");
                },
                function (position, expectedTokens) {
                    var last = expectedTokens[expectedTokens.length - 1];
                    return new SourcePos("test", last[0], last[1]);
                },
                tokensB,
                lq.util.ArrayUtil.equals
            ).run(
                stateB,
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                SourcePos.init("test"),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "line 1, column 2: foo; line 3, column 4: bar")
                                ]
                            )
                        )
                    ).to.be.true;
                },
                throwError,
                throwError
            );

            var tokensC = [[1, 2, "foo"], [3, 4, "bar"]];
            var streamC = [[1, 2, "foo"], [5, 6, "baz"]];
            var stateC = new State(streamC, SourcePos.init("test"), "none");
            lq.prim.tokens(
                function (tokens) {
                    return tokens.map(function (token) {
                        return "line " + token[0].toString()
                            + ", column " + token[1].toString()
                            + ": " + token[2];
                    }).join("; ");
                },
                function (position, expectedTokens) {
                    var last = expectedTokens[expectedTokens.length - 1];
                    return new SourcePos("test", last[0], last[1]);
                },
                tokensC,
                lq.util.ArrayUtil.equals
            ).run(
                stateC,
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                SourcePos.init("test"),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "line 5, column 6: baz"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "line 1, column 2: foo; line 3, column 4: bar")
                                ]
                            )
                        )
                    ).to.be.true;
                },
                throwError,
                throwError
            );

            var tokensD = [[1, 2, "foo"], [3, 4, "bar"]];
            var streamD = [];
            var stateD = new State(streamD, SourcePos.init("test"), "none");
            lq.prim.tokens(
                function (tokens) {
                    return tokens.map(function (token) {
                        return "line " + token[0].toString()
                            + ", column " + token[1].toString()
                            + ": " + token[2];
                    }).join("; ");
                },
                function (position, expectedTokens) {
                    var last = expectedTokens[expectedTokens.length - 1];
                    return new SourcePos("test", last[0], last[1]);
                },
                tokensD,
                lq.util.ArrayUtil.equals
            ).run(
                stateD,
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                SourcePos.init("test"),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, ""),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "line 1, column 2: foo; line 3, column 4: bar")
                                ]
                            )
                        )
                    ).to.be.true;
                }
            );

            var tokensE = [[1, 2, "foo"], [3, 4, "bar"]];
            var streamE = [[5, 6, "baz"]];
            var stateE = new State(streamE, SourcePos.init("test"), "none");
            lq.prim.tokens(
                function (tokens) {
                    return tokens.map(function (token) {
                        return "line " + token[0].toString()
                            + ", column " + token[1].toString()
                            + ": " + token[2];
                    }).join("; ");
                },
                function (position, expectedTokens) {
                    var last = expectedTokens[expectedTokens.length - 1];
                    return new SourcePos("test", last[0], last[1]);
                },
                tokensE,
                lq.util.ArrayUtil.equals
            ).run(
                stateE,
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                SourcePos.init("test"),
                                [
                                    new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "line 5, column 6: baz"),
                                    new ErrorMessage(ErrorMessageType.EXPECT, "line 1, column 2: foo; line 3, column 4: bar")
                                ]
                            )
                        )
                    ).to.be.true;
                }
            );

            var tokensF = [];
            var streamF = [[1, 2, "foo"], [3, 4, "bar"], [5, 6, "baz"]];
            var stateF = new State(streamF, SourcePos.init("test"), "none");
            lq.prim.tokens(
                function (tokens) {
                    return tokens.map(function (token) {
                        return "line " + token[0].toString()
                            + ", column " + token[1].toString()
                            + ": " + token[2];
                    }).join("; ");
                },
                function (position, expectedTokens) {
                    var last = expectedTokens[expectedTokens.length - 1];
                    return new SourcePos("test", last[0], last[1]);
                },
                tokensF,
                lq.util.ArrayUtil.equals
            ).run(
                stateF,
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.deep.equal([]);
                    expect(
                        State.equals(
                            state,
                            new State(
                                [[1, 2, "foo"], [3, 4, "bar"], [5, 6, "baz"]],
                                SourcePos.init("test"),
                                "none"
                            ),
                            function (inputA, inputB) {
                                return lq.util.ArrayUtil.equals(inputA, inputB, lq.util.ArrayUtil.equals);
                            }
                        )
                    ).to.be.true;
                    expect(ParseError.equals(error, ParseError.unknown(SourcePos.init("test")))).to.be.true;
                },
                throwError
            );
        });
    });

    describe("token(tokenToString, calcValue, calcPos)", function () {
        it("should return a parser that consumes token containing position information from input stream", function () {
            var streamA = [[1, 2, "foo"], [3, 4, "bar"], [5, 6, "baz"]];
            var stateA = new State(streamA, SourcePos.init("test"), "none");
            lq.prim.token(
                function (token) {
                    return "line " + token[0].toString()
                        + ", column " + token[1].toString()
                        + ": " + token[2];
                },
                function (token) {
                    return [token[2]];
                },
                function (token) {
                    return new SourcePos("test", token[0], token[1]);
                }
            ).run(
                stateA,
                function (value, state, error) {
                    expect(value).to.equal("foo");
                    expect(
                        State.equals(
                            state,
                            new State(
                                [[3, 4, "bar"], [5, 6, "baz"]],
                                new SourcePos("test", 3, 4),
                                "none"
                            ),
                            function (inputA, inputB) {
                                return lq.util.ArrayUtil.equals(inputA, inputB, lq.util.ArrayUtil.equals);
                            }
                        )
                    ).to.be.true;
                    expect(ParseError.equals(error, ParseError.unknown(new SourcePos("test", 3, 4)))).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            var streamB = [[1, 2, "foo"]];
            var stateB = new State(streamB, SourcePos.init("test"), "none");
            lq.prim.token(
                function (token) {
                    return "line " + token[0].toString()
                        + ", column " + token[1].toString()
                        + ": " + token[2];
                },
                function (token) {
                    return [token[2]];
                },
                function (token) {
                    return new SourcePos("test", token[0], token[1]);
                }
            ).run(
                stateB,
                function (value, state, error) {
                    expect(value).to.equal("foo");
                    expect(
                        State.equals(
                            state,
                            new State(
                                [],
                                new SourcePos("test", 1, 2),
                                "none"
                            ),
                            function (inputA, inputB) {
                                return lq.util.ArrayUtil.equals(inputA, inputB, lq.util.ArrayUtil.equals);
                            }
                        )
                    ).to.be.true;
                    expect(ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2)))).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            var streamC = [[1, 2, "foo"], [3, 4, "bar"], [5, 6, "baz"]];
            var stateC = new State(streamC, SourcePos.init("test"), "none");
            lq.prim.token(
                function (token) {
                    return "line " + token[0].toString()
                        + ", column " + token[1].toString()
                        + ": " + token[2];
                },
                function (token) {
                    return [];
                },
                function (token) {
                    return new SourcePos("test", token[0], token[1]);
                }
            ).run(
                stateC,
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                SourcePos.init("test"),
                                [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "line 1, column 2: foo")]
                            )
                        )
                    ).to.be.true;
                }
            );

            var streamD = [];
            var stateD = new State(streamD, SourcePos.init("test"), "none");
            lq.prim.token(
                function (token) {
                    return "line " + token[0].toString()
                        + ", column " + token[1].toString()
                        + ": " + token[2];
                },
                function (token) {
                    return [token[2]];
                },
                function (token) {
                    return new SourcePos("test", token[0], token[1]);
                }
            ).run(
                stateD,
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                SourcePos.init("test"),
                                [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "")]
                            )
                        )
                    ).to.be.true;
                }
            );
        });
    });

    describe("tokenPrim(tokenToString, calcValue, calcNextPos, calcNextUserState)", function () {
        it("should return a parser that consumes token from input stream", function () {
            var streamA = ["10", "20", "30"];
            var stateA = new State(streamA, SourcePos.init("test"), []);
            lq.prim.tokenPrim(
                lq.util.show,
                function (numStr) {
                    var n = parseInt(numStr);
                    if (isNaN(n)) {
                        return [];
                    }
                    else {
                        return [n];
                    }
                },
                function (position, token, rest) {
                    return position.setColumn(position.column + 1);
                },
                function (userState, position, token, rest) {
                    return userState.concat(token);
                }
            ).run(
                stateA,
                function (value, state, error) {
                    expect(value).to.equal(10);
                    expect(
                        State.equals(
                            state,
                            new State(["20", "30"], new SourcePos("test", 1, 2), ["10"]),
                            lq.util.ArrayUtil.equals,
                            lq.util.ArrayUtil.equals
                        )
                    ).to.be.true;
                    expect(ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2)))).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );

            var streamB = ["abc", "20", "30"];
            var stateB = new State(streamB, SourcePos.init("test"), []);
            lq.prim.tokenPrim(
                lq.util.show,
                function (numStr) {
                    var n = parseInt(numStr);
                    if (isNaN(n)) {
                        return [];
                    }
                    else {
                        return [n];
                    }
                },
                function (position, token, rest) {
                    return position.setColumn(position.column + 1);
                },
                function (userState, position, token, rest) {
                    return userState.concat(token);
                }
            ).run(
                stateB,
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                SourcePos.init("test"),
                                [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, lq.util.show("abc"))]
                            )
                        )
                    ).to.be.true;
                }
            );

            var streamC = [];
            var stateC = new State(streamC, SourcePos.init("test"), []);
            lq.prim.tokenPrim(
                lq.util.show,
                function (numStr) {
                    var n = parseInt(numStr);
                    if (isNaN(n)) {
                        return [];
                    }
                    else {
                        return [n];
                    }
                },
                function (position, token, rest) {
                    return position.setColumn(position.column + 1);
                },
                function (userState, position, token, rest) {
                    return userState.concat(token);
                }
            ).run(
                stateC,
                throwError,
                throwError,
                throwError,
                function (error) {
                    expect(
                        ParseError.equals(
                            error,
                            new ParseError(
                                SourcePos.init("test"),
                                [new ErrorMessage(ErrorMessageType.SYSTEM_UNEXPECT, "")]
                            )
                        )
                    ).to.be.true;
                }
            );

            var streamD = ["10", "20", "30"];
            var stateD = new State(streamD, SourcePos.init("test"), []);
            lq.prim.tokenPrim(
                lq.util.show,
                function (numStr) {
                    var n = parseInt(numStr);
                    if (isNaN(n)) {
                        return [];
                    }
                    else {
                        return [n];
                    }
                },
                function (position, token, rest) {
                    return position.setColumn(position.column + 1);
                }
            ).run(
                stateD,
                function (value, state, error) {
                    expect(value).to.equal(10);
                    expect(
                        State.equals(
                            state,
                            new State(["20", "30"], new SourcePos("test", 1, 2), []),
                            lq.util.ArrayUtil.equals,
                            lq.util.ArrayUtil.equals
                        )
                    ).to.be.true;
                    expect(ParseError.equals(error, ParseError.unknown(new SourcePos("test", 1, 2)))).to.be.true;
                },
                throwError,
                throwError,
                throwError
            );
        });
    });

    describe("getState", function () {
        it("should take the current state as its value", function () {
            lq.prim.getState.run(
                new State("abc", new SourcePos("test", 1, 2), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(
                        State.equals(
                            value,
                            new State("abc", new SourcePos("test", 1, 2), "none")
                        )
                    ).to.be.true;
                    expect(
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 2), "none")
                        )
                    ).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 1, 2))
                        )
                    ).to.be.true;
                },
                throwError
            );
        });
    });

    describe("setState(state)", function () {
        it("should set specified 'state' as the state and take the new state as its value", function () {
            lq.prim.setState(new State("def", new SourcePos("test", 3, 4), "some")).run(
                new State("abc", new SourcePos("test", 1, 2), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(
                        State.equals(
                            value,
                            new State("def", new SourcePos("test", 3, 4), "some")
                        )
                    ).to.be.true;
                    expect(
                        State.equals(
                            state,
                            new State("def", new SourcePos("test", 3, 4), "some")
                        )
                    ).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 3, 4))
                        )
                    ).to.be.true;
                },
                throwError
            );
        });
    });

    describe("updateState(func)", function () {
        it("should apply 'func' to the state, set it as the state and take the new state as its value", function () {
            lq.prim.updateState(function (state){
                return state.setInput("def")
                    .setPosition(new SourcePos("test", 3, 4))
                    .setUserState("some");
            }).run(
                new State("abc", new SourcePos("test", 1, 2), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(
                        State.equals(
                            value,
                            new State("def", new SourcePos("test", 3, 4), "some")
                        )
                    ).to.be.true;
                    expect(
                        State.equals(
                            state,
                            new State("def", new SourcePos("test", 3, 4), "some")
                        )
                    ).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 3, 4))
                        )
                    ).to.be.true;
                },
                throwError
            );
        });
    });

    describe("getInput", function () {
        it("should take the current input as its value", function () {
            lq.prim.getInput.run(
                new State("abc", new SourcePos("test", 1, 2), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal("abc");
                    expect(
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 2), "none")
                        )
                    ).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 1, 2))
                        )
                    ).to.be.true;
                },
                throwError
            );
        });
    });

    describe("setInput(input)", function () {
        it("should set specified 'input' as the input", function () {
            lq.prim.setInput("def").run(
                new State("abc", new SourcePos("test", 1, 2), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.be.undefined;
                    expect(
                        State.equals(
                            state,
                            new State("def", new SourcePos("test", 1, 2), "none")
                        )
                    ).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 1, 2))
                        )
                    ).to.be.true;
                },
                throwError
            );
        });
    });

    describe("getPosition", function () {
        it("should take the current position as its value", function () {
            lq.prim.getPosition.run(
                new State("abc", new SourcePos("test", 1, 2), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(SourcePos.equals(value, new SourcePos("test", 1, 2))).to.be.true;
                    expect(
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 2), "none")
                        )
                    ).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 1, 2))
                        )
                    ).to.be.true;
                },
                throwError
            );
        });
    });

    describe("setPosition(position)", function () {
        it("should set specified 'position' as the position", function () {
            lq.prim.setPosition(new SourcePos("test", 3, 4)).run(
                new State("abc", new SourcePos("test", 1, 2), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.be.undefined;
                    expect(
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 3, 4), "none")
                        )
                    ).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 3, 4))
                        )
                    ).to.be.true;
                },
                throwError
            );
        });
    });

    describe("getUserState", function () {
        it("should take the current user state as its value", function () {
            lq.prim.getUserState.run(
                new State("abc", new SourcePos("test", 1, 2), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.equal("none");
                    expect(
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 2), "none")
                        )
                    ).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 1, 2))
                        )
                    ).to.be.true;
                },
                throwError
            );
        });
    });

    describe("setUserState(userState)", function () {
        it("should set specified 'userState' as the user state", function () {
            lq.prim.setUserState("some").run(
                new State("abc", new SourcePos("test", 1, 2), "none"),
                throwError,
                throwError,
                function (value, state, error) {
                    expect(value).to.be.undefined;
                    expect(
                        State.equals(
                            state,
                            new State("abc", new SourcePos("test", 1, 2), "some")
                        )
                    ).to.be.true;
                    expect(
                        ParseError.equals(
                            error,
                            ParseError.unknown(new SourcePos("test", 1, 2))
                        )
                    ).to.be.true;
                },
                throwError
            );
        });
    });
});
