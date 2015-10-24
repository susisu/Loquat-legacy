/*
 * Loquat / pos.js
 * copyright (c) 2014 Susisu
 *
 * source positions
 */

"use strict";

function end () {
    module.exports = Object.freeze({
        "SourcePos": SourcePos
    });
}


function SourcePos (name, line, column) {
    this.name   = name;
    this.line   = line;
    this.column = column;
}

Object.defineProperties(SourcePos, {
    "init": { "value": function (name) {
        return new SourcePos(name, 1, 1);
    }},

    "equals": { "value": function (positionA, positionB) {
        return positionA.name   === positionB.name
            && positionA.line   === positionB.line
            && positionA.column === positionB.column;
    }},

    "compare": { "value": function (positionA, positionB) {
        return positionA.name   < positionB.name   ? -1
             : positionA.name   > positionB.name   ? 1
             : positionA.line   < positionB.line   ? -1
             : positionA.line   > positionB.line   ? 1
             : positionA.column < positionB.column ? -1
             : positionA.column > positionB.column ? 1
                                                   : 0;
    }}
});

Object.defineProperties(SourcePos.prototype, {
    "toString": { "value": function () {
        return (this.name === "" ? "" : "\"" + this.name + "\" ")
            + "(line " + this.line.toString() + ", column " + this.column.toString() + ")";
    }},

    "clone": { "value": function () {
        return new SourcePos(this.name, this.line, this.column);
    }},

    "setName": { "value": function (name) {
        return new SourcePos(name, this.line, this.column);
    }},

    "setLine": { "value": function (line) {
        return new SourcePos(this.name, line, this.column);
    }},

    "setColumn": { "value": function (column) {
        return new SourcePos(this.name, this.line, column);
    }},

    "addChar": { "value": function (char, tabWidth) {
        tabWidth = tabWidth | 0;
        if (tabWidth <= 0) {
            tabWidth = 8;
        }
        var copy = this.clone();
        switch (char) {
            case "\n":
                copy.line ++;
                copy.column = 1;
                break;
            case "\t":
                copy.column += tabWidth - (copy.column - 1) % tabWidth;
                break;
            default:
                copy.column ++;
        }
        return copy;
    }},

    "addString": { "value": function (str, tabWidth) {
        tabWidth = tabWidth | 0;
        if (tabWidth <= 0) {
            tabWidth = 8;
        }
        var copy = this.clone();
        for (var i = 0; i < str.length; i ++) {
            switch (str[i]) {
                case "\n":
                    copy.line ++;
                    copy.column = 1;
                    break;
                case "\t":
                    copy.column += tabWidth - (copy.column - 1) % tabWidth;
                    break;
                default:
                    copy.column ++;
            }
        }
        return copy;
    }}
});


end();
