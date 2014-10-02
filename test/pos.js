/*
 * Loquat.test / pos.js
 * copyright (c) 2014 Susisu
 */

var should = require("should");

var lq = Object.freeze({
    "pos": require("../src/pos")
});


describe("SourcePos", function () {
    var SourcePos = lq.pos.SourcePos;

    describe(".init(name)", function () {
        it("should return initial position in source", function () {
            var init = SourcePos.init("foo");
            init.name.should.equal("foo");
            init.line.should.equal(1);
            init.column.should.equal(1);
        });
    });

    describe(".equals(positionA, positionB)", function () {
        it("shoud return true when two positions represent the same position", function () {
            var pos = new SourcePos("foo", 1, 2);
            SourcePos.equals(pos, pos).should.be.ok;
            SourcePos.equals(new SourcePos("bar", 3, 4), new SourcePos("bar", 3, 4)).should.be.ok;
        });

        it("should return false when two positions represent different positions", function () {
            SourcePos.equals(new SourcePos("foo", 3, 4), new SourcePos("bar", 3, 4)).should.not.be.ok;
            SourcePos.equals(new SourcePos("foo", 5, 6), new SourcePos("foo", 7, 6)).should.not.be.ok;
            SourcePos.equals(new SourcePos("foo", 7, 8), new SourcePos("foo", 7, 9)).should.not.be.ok;
            SourcePos.equals(new SourcePos("foo", 1, 2), new SourcePos("bar", 3, 4)).should.not.be.ok;
        });
    });

    describe(".compare(positionA, positionB)", function () {
        it("should return -1 when 'positionA' is former than 'positionB'", function () {
            SourcePos.compare(new SourcePos("abc", 3, 4), new SourcePos("bcd", 1, 2)).should.equal(-1);
            SourcePos.compare(new SourcePos("foo", 1, 2), new SourcePos("foo", 1, 3)).should.equal(-1);
            SourcePos.compare(new SourcePos("foo", 1, 2), new SourcePos("foo", 2, 1)).should.equal(-1);
        });

        it("should return 1 when 'positionA is latter than 'positionB'", function () {
            SourcePos.compare(new SourcePos("bcd", 1, 2), new SourcePos("abc", 3, 4)).should.equal(1);
            SourcePos.compare(new SourcePos("foo", 1, 3), new SourcePos("foo", 1, 2)).should.equal(1);
            SourcePos.compare(new SourcePos("foo", 2, 1), new SourcePos("foo", 1, 2)).should.equal(1);
        });

        it("should return 0 when two positions represent the same position", function () {
            var pos = new SourcePos("foo", 1, 2);
            SourcePos.compare(pos, pos).should.equal(0);
            SourcePos.compare(new SourcePos("bar", 3, 4), new SourcePos("bar", 3, 4)).should.equal(0);
        });
    });

    describe("#toString()", function () {
        it("should return the string representation of the position", function () {
            new SourcePos("foo", 1, 2).toString().should.equal("\"foo\" (line 1, column 2)");
            new SourcePos("", 3, 4).toString().should.equal("(line 3, column 4)");
        });
    });

    describe("#clone()", function () {
        it("should return a copy of the position", function () {
            var pos = new SourcePos("foo", 1, 2);
            var copy = pos.clone();
            (copy === pos).should.not.be.ok;
            SourcePos.equals(copy, pos).should.be.ok;
        });
    });

    describe("#setName(name)", function () {
        it("should return a copy of the position the name is set to the specified value", function () {
            var pos = new SourcePos("foo", 1, 2);
            var copy = pos.setName("bar");
            copy.name.should.equal("bar");
            copy.line.should.equal(1);
            copy.column.should.equal(2);

            pos.name.should.not.equal("bar");
            (copy === pos).should.not.be.ok;
        });
    });

    describe("#setLine(line)", function () {
        it("should return a copy of the position the line is set to the specified value", function () {
            var pos = new SourcePos("foo", 1, 2);
            var copy = pos.setLine(3);
            copy.name.should.equal("foo");
            copy.line.should.equal(3);
            copy.column.should.equal(2);

            pos.line.should.not.equal(3);
            (copy === pos).should.not.be.ok;
        });
    });

    describe("#setColumn(column)", function () {
        it("should return a copy of the position the column is set to the specified value", function () {
            var pos = new SourcePos("foo", 1, 2);
            var copy = pos.setColumn(3);
            copy.name.should.equal("foo");
            copy.line.should.equal(1);
            copy.column.should.equal(3);

            pos.column.should.not.equal(3);
            (copy === pos).should.not.be.ok;
        });
    });

    describe("#addChar(char)", function () {
        it("should return a copy of the position, the line and the column of which are incremented by the specified character", function () {
            var posA = new SourcePos("abc", 1, 2);
            var copyA = posA.addChar("a");
            copyA.name.should.equal("abc");
            copyA.line.should.equal(1);
            copyA.column.should.equal(3);

            var posB = new SourcePos("def", 1, 2);
            var copyB = posB.addChar("\n");
            copyB.name.should.equal("def");
            copyB.line.should.equal(2);
            copyB.column.should.equal(1);

            var posC = new SourcePos("ghi", 1, 1);
            var copyC = posC.addChar("\t");
            copyC.name.should.equal("ghi");
            copyC.line.should.equal(1);
            copyC.column.should.equal(9);

            var posD = new SourcePos("jkl", 1, 5);
            var copyD = posD.addChar("\t");
            copyD.name.should.equal("jkl");
            copyD.line.should.equal(1);
            copyD.column.should.equal(9);

            var posE = new SourcePos("mno", 1, 9);
            var copyE = posE.addChar("\t");
            copyE.name.should.equal("mno");
            copyE.line.should.equal(1);
            copyE.column.should.equal(17);
        });
    });

    describe("#addString(str)", function () {
        it("should return a copy of the position, the line and the column of which are incremented by the specified string", function () {
            var posA = new SourcePos("abc", 1, 2);
            var copyA = posA.addString("foo");
            copyA.name.should.equal("abc");
            copyA.line.should.equal(1);
            copyA.column.should.equal(5);

            var posB = new SourcePos("def", 1, 2);
            var copyB = posB.addString("bar\nbaz");
            copyB.name.should.equal("def");
            copyB.line.should.equal(2);
            copyB.column.should.equal(4);

            var posC = new SourcePos("def", 1, 2);
            var copyC = posC.addString("hoge\nfuga\tpiyo");
            copyC.name.should.equal("def");
            copyC.line.should.equal(2);
            copyC.column.should.equal(13);
        });
    });
});
