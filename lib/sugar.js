/*
 * Loquat / sugar.js
 * copyright (c) 2014 Susisu
 *
 * method declaration of parsers
 */

"use strict";

function end () {
    module.exports = Object.freeze({
        "gen": gen
    });
}

var lq = Object.freeze({
    "char"      : require("./char"),
    "combinator": require("./combinator"),
    "error"     : require("./error"),
    "monad"     : require("./monad"),
    "prim"      : require("./prim")
});


[lq.prim.Parser, lq.prim.LazyParser].forEach(function (P) {
    Object.defineProperties(P.prototype, {
        /* prim */

        "map": { "value": function (func) {
            return lq.prim.fmap(func)(this);
        }},

        "ap": { "value": function (parser) {
            return lq.prim.ap(this, parser);
        }},

        "left": { "value": function (parser) {
            return lq.prim.left(this, parser);
        }},

        "right": { "value": function (parser) {
            return lq.prim.right(this, parser);
        }},

        "bind": { "value": function (func) {
            return lq.prim.bind(this, func);
        }},

        "then": { "value": function (parser) {
            return lq.prim.then(this, parser);
        }},

        "or": { "value": function (parser) {
            return lq.prim.mplus(this, parser);
        }},

        "label": { "value": function (message) {
            return lq.prim.label(this, message);
        }},

        "labels": { "value": function (messages) {
            return lq.prim.labels(this, messages);
        }},

        "try": { "value": function () {
            return lq.prim.try(this);
        }},

        "lookAhead": { "value": function () {
            return lq.prim.lookAhead(this);
        }},

        "manyAccum": { "value": function (accumulate) {
            return lq.prim.manyAccum(accumulate, this);
        }},

        "many": { "value": function () {
            return lq.prim.many(this);
        }},

        "skipMany": { "value": function () {
            return lq.prim.skipMany(this);
        }},

        /* char */

        "manyChar": { "value": function () {
            return lq.char.manyChar(this);
        }},

        "manyChar1": { "value": function () {
            return lq.char.manyChar1(this);
        }},

        /* monad */

        "forever": { "value": function () {
            return lq.monad.forever(this);
        }},

        "void": { "value": function () {
            return lq.monad.void(this);
        }},

        "join": { "value": function () {
            return lq.monad.join(this);
        }},

        "when": { "value": function (flag) {
            return lq.monad.when(flag, this);
        }},

        "unless": { "value": function (flag) {
            return lq.monad.unless(flag, this);
        }},

        "replicateM": { "value": function (n) {
            return lq.monad.replicateM(n, this);
        }},

        "replicateM_": { "value": function (n) {
            return lq.monad.replicateM_(n, this);
        }},

        "mfilter": { "value": function (test) {
            return lq.monad.mfilter(test, this);
        }},

        /* combinator */

        "between": { "value": function (open, close) {
            return lq.combinator.between(open, close, this);
        }},

        "many1": { "value": function () {
            return lq.combinator.many1(this);
        }},

        "skipMany1": { "value": function () {
            return lq.combinator.skipMany1(this);
        }},

        "sepBy": { "value": function (separator) {
            return lq.combinator.sepBy(this, separator);
        }},

        "sepBy1": { "value": function (separator) {
            return lq.combinator.sepBy1(this, separator);
        }},

        "sepEndBy": { "value": function (separator) {
            return lq.combinator.sepEndBy(this, separator);
        }},

        "sepEndBy1": { "value": function (separator) {
            return lq.combinator.sepEndBy1(this, separator);
        }},

        "endBy": { "value": function (separator) {
            return lq.combinator.endBy(this, separator);
        }},

        "endBy1": { "value": function (separator) {
            return lq.combinator.endBy1(this, separator);
        }},

        "count": { "value": function (n) {
            return lq.combinator.count(n, this);
        }},

        "notFollowedBy": { "value": function (parser) {
            return lq.prim.try(
                lq.prim.left(this, lq.combinator.notFollowedBy(parser))
            );
        }},

        "manyTill": { "value": function (end) {
            return lq.combinator.manyTill(this, end);
        }}
    });
});

function gen(generator) {
    return new lq.prim.Parser(function (state, csuc, cerr, esuc, eerr) {
        var it = generator();
        var currentState = state;
        var currentError = lq.error.ParseError.unknown(state.position);
        var yieldValue;
        var consumed = false;
        var stop = false;
        var result;
        try {
            result = it.next();
        }
        catch (error) {
            return eerr(
                new lq.error.ParseError(
                    state.position,
                    [new lq.error.ErrorMessage(lq.error.ErrorMessageType.MESSAGE, String(error))]
                )
            );
        }
        while (!result.done) {
            result.value.run(currentState, csuc_, cerr_, esuc_, eerr_);
            if (stop) {
                if (consumed) {
                    return cerr(currentError);
                }
                else {
                    return eerr(currentError);
                }
            }
            try {
                result = it.next(yieldValue);
            }
            catch (error) {
                if (consumed) {
                    return cerr(lq.error.ParseError.merge(
                        currentError,
                        new lq.error.ParseError(
                            currentState.position,
                            [new lq.error.ErrorMessage(lq.error.ErrorMessageType.MESSAGE, String(error))]
                        )
                    ));
                }
                else {
                    return eerr(lq.error.ParseError.merge(
                        currentError,
                        new lq.error.ParseError(
                            currentState.position,
                            [new lq.error.ErrorMessage(lq.error.ErrorMessageType.MESSAGE, String(error))]
                        )
                    ));
                }
            }
        }
        if (consumed) {
            return csuc(result.value, currentState, currentError);
        }
        else {
            return esuc(result.value, currentState, currentError);
        }

        function csuc_ (value, state, error) {
            consumed = true;
            yieldValue = value;
            currentState = state;
            currentError = error;
        }

        function cerr_ (error) {
            consumed = true;
            stop = true;
            currentError = error;
        }

        function esuc_ (value, state, error) {
            yieldValue = value;
            currentState = state;
            currentError = lq.error.ParseError.merge(currentError, error);
        }

        function eerr_ (error) {
            stop = true;
            currentError = lq.error.ParseError.merge(currentError, error);
        }
    });
}


end();
