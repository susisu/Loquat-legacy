/*
 * Loquat / monad.js
 * copyright (c) 2014 Susisu
 *
 * monadic functions
 */

"use strict";

function end () {
    module.exports = Object.freeze({
        "forever"    : forever,
        "void"       : nullify,
        "nullify"    : nullify,
        "join"       : join,
        "when"       : when,
        "unless"     : unless,
        "liftM"      : liftM,
        "liftM2"     : liftM2,
        "liftM3"     : liftM3,
        "liftM4"     : liftM4,
        "liftM5"     : liftM5,
        "ltor"       : ltor,
        "rtol"       : rtol,
        "sequence"   : sequence,
        "sequence_"  : sequence_,
        "mapM"       : mapM,
        "mapM_"      : mapM_,
        "forM"       : forM,
        "forM_"      : forM_,
        "filterM"    : filterM,
        "zipWithM"   : zipWithM,
        "zipWithM_"  : zipWithM_,
        "foldM"      : foldM,
        "foldM_"     : foldM_,
        "replicateM" : replicateM,
        "replicateM_": replicateM_,
        "guard"      : guard,
        "msum"       : msum,
        "mfilter"    : mfilter
    });
}

var lq = Object.freeze({
    "error": require("./error"),
    "prim" : require("./prim"),
    "util" : require("./util")
});


function forever (parser) {
    var loop = new lq.prim.LazyParser(function () {
        return lq.prim.then(parser, loop);
    });
    return loop;
}

var nullify = lq.prim.fmap(function (any) { return undefined; });

function join (parser) {
    return lq.prim.bind(
        parser,
        function (value) {
            return value;
        }
    );
}

function when (flag, parser) {
    if (flag) {
        return parser;
    }
    else {
        return lq.prim.pure(undefined);
    }
}

function unless (flag, parser) {
    if (flag) {
        return lq.prim.pure(undefined);
    }
    else {
        return parser;
    }
}

function liftM (func) {
    return function (parser) {
        return lq.prim.bind(
            parser,
            function (value) {
                return lq.prim.pure(func(value));
            }
        );
    };
}

function liftM2 (func) {
    return function (parserA, parserB) {
        return lq.prim.bind(
            parserA,
            function (valueA) {
                return lq.prim.bind(
                    parserB,
                    function (valueB) {
                        return lq.prim.pure(func(valueA, valueB));
                    }
                );
            }
        );
    };
}

function liftM3 (func) {
    return function (parserA, parserB, parserC) {
        return lq.prim.bind(
            parserA,
            function (valueA) {
                return lq.prim.bind(
                    parserB,
                    function (valueB) {
                        return lq.prim.bind(
                            parserC,
                            function (valueC) {
                                return lq.prim.pure(func(valueA, valueB, valueC));
                            }
                        );
                    }
                );
            }
        );
    };
}

function liftM4 (func) {
    return function (parserA, parserB, parserC, parserD) {
        return lq.prim.bind(
            parserA,
            function (valueA) {
                return lq.prim.bind(
                    parserB,
                    function (valueB) {
                        return lq.prim.bind(
                            parserC,
                            function (valueC) {
                                return lq.prim.bind(
                                    parserD,
                                    function (valueD) {
                                        return lq.prim.pure(func(valueA, valueB, valueC, valueD));
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    };
}

function liftM5 (func) {
    return function (parserA, parserB, parserC, parserD, parserE) {
        return lq.prim.bind(
            parserA,
            function (valueA) {
                return lq.prim.bind(
                    parserB,
                    function (valueB) {
                        return lq.prim.bind(
                            parserC,
                            function (valueC) {
                                return lq.prim.bind(
                                    parserD,
                                    function (valueD) {
                                        return lq.prim.bind(
                                            parserE,
                                            function (valueE) {
                                                return lq.prim.pure(func(valueA, valueB, valueC, valueD, valueE));
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    };
}

function ltor (funcA, funcB) {
    return function (value) { return lq.prim.bind(funcA(value), funcB); };
}

function rtol (funcA, funcB) {
    return ltor(funcB, funcA);
}

function sequence (parsers) {
    return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
        var accum = [];
        var currentState = state;
        var currentError = lq.error.ParseError.unknown(state.position);
        var consumed = false;
        var stop = false;
        for (var i = 0; i < parsers.length; i ++) {
            parsers[i].run(currentState, csuc_, cerr_, esuc_, eerr_);
            if (stop) {
                if (consumed) {
                    return cerr(currentError);
                }
                else {
                    return eerr(currentError);
                } 
            }
        }
        if (consumed) {
            return csuc(accum, currentState, currentError);
        }
        else {
            return esuc(accum, currentState, currentError);
        }

        function csuc_ (value, state, error) {
            consumed = true;
            accum.push(value);
            currentState = state;
            currentError = error;
        }

        function cerr_ (error) {
            consumed = true;
            stop = true;
            currentError = error;
        }

        function esuc_ (value, state, error) {
            accum.push(value);
            currentState = state;
            currentError = lq.error.ParseError.merge(currentError, error);
        }

        function eerr_ (error) {
            stop = true;
            currentError = lq.error.ParseError.merge(currentError, error);
        }
    });
}

function sequence_ (parsers) {
    return parsers.reduceRight(
        function (accum, parser) { return lq.prim.then(parser, accum); },
        lq.prim.pure(undefined)
    );
}

function mapM (func, array) {
    return sequence(array.map(func));
}

function mapM_ (func, array) {
    return sequence_(array.map(func));
}

function forM (array, func) {
    return mapM(func, array);
}

function forM_ (array, func) {
    return mapM_(func, array);
}

function filterM (test, array) {
    return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
        var accum = [];
        var currentState = state;
        var currentError = lq.error.ParseError.unknown(state.position);
        var consumed = false;
        var stop = false;
        var flag = false;
        for (var i = 0; i < array.length; i ++) {
            test(array[i]).run(currentState, csuc_, cerr_, esuc_, eerr_);
            if (stop) {
                if (consumed) {
                    return cerr(currentError);
                }
                else {
                    return eerr(currentError);
                }
            }
            if (flag) {
                accum.push(array[i]);
            }
        }
        if (consumed) {
            return csuc(accum, currentState, currentError);
        }
        else {
            return esuc(accum, currentState, currentError);
        }

        function csuc_ (value, state, error) {
            consumed = true;
            flag = value;
            currentState = state;
            currentError = error;
        }

        function cerr_ (error) {
            consumed = true;
            stop = true;
            currentError = error;
        }

        function esuc_ (value, state, error) {
            flag = value;
            currentState = state;
            currentError = lq.error.ParseError.merge(currentError, error);
        }

        function eerr_ (error) {
            stop = true;
            currentError = lq.error.ParseError.merge(currentError, error);
        }
    });
}

function zipWithM (func, arrayA, arrayB) {
    return sequence(lq.util.ArrayUtil.zipWith(func, arrayA, arrayB));
}

function zipWithM_ (func, arrayA, arrayB) {
    return sequence_(lq.util.ArrayUtil.zipWith(func, arrayA, arrayB));
}

function foldM (func, initialValue, array) {
    return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
        var accum = initialValue;
        var currentState = state;
        var currentError = lq.error.ParseError.unknown(state.position);
        var consumed = false;
        var stop = false;
        for (var i = 0; i < array.length; i ++) {
            func(accum, array[i]).run(currentState, csuc_, cerr_, esuc_, eerr_);
            if (stop) {
                if (consumed) {
                    return cerr(currentError);
                }
                else {
                    return eerr(currentError);
                }
            }
        }
        if (consumed) {
            return csuc(accum, currentState, currentError);
        }
        else {
            return esuc(accum, currentState, currentError);
        }

        function csuc_ (value, state, error) {
            consumed = true;
            accum = value;
            currentState = state;
            currentError = error;
        }

        function cerr_ (error) {
            consumed = true;
            stop = true;
            currentError = error;
        }

        function esuc_ (value, state, error) {
            accum = value;
            currentState = state;
            currentError = lq.error.ParseError.merge(currentError, error);
        }

        function eerr_ (error) {
            stop = true;
            currentError = lq.error.ParseError.merge(currentError, error);
        }
    });
}

function foldM_ (func, initialValue, array) {
    return lq.prim.then(foldM(func, initialValue, array), lq.prim.pure(undefined));
}

function replicateM (n, parser) {
    return sequence(lq.util.ArrayUtil.replicate(n, parser));
}

function replicateM_ (n, parser) {
    return sequence_(lq.util.ArrayUtil.replicate(n, parser));
}

function guard (flag) {
    if (flag) {
        return lq.prim.pure(undefined);
    }
    else {
        return lq.prim.mzero;
    }
}

function msum (parsers) {
    return parsers.reduceRight(
        function (accum, parser) { return lq.prim.mplus(parser, accum); },
        lq.prim.mzero
    );
}

function mfilter (test, parser) {
    return lq.prim.bind(
        parser,
        function (value) {
            if (test(value)) {
                return lq.prim.pure(value);
            }
            else {
                return lq.prim.mzero;
            }
        }
    );
}


end();
