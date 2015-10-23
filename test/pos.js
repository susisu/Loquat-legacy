/*
 * Loquat.test / pos.js
 * copyright (c) 2014 Susisu
 */

var chai   = require("chai"),
    expect = chai.expect;

var lq = Object.freeze({
    "pos": require("../lib/pos")
});


describe("pos", function () {
    describe("SourcePos", function () {
        var SourcePos = lq.pos.SourcePos;

        it("should have fields 'name', 'line' and 'column'", function () {
            var pos = new SourcePos("foo", 1, 2);
            expect(pos).to.have.property("name").that.is.a("string");
            expect(pos).to.have.property("line").that.is.a("number");
            expect(pos).to.have.property("column").that.is.a("number");
        });

        describe("constructor(name, line, column)", function () {
            it("should create a new SourcePos object that represents a position in source", function () {
                var pos = new SourcePos("foo", 1, 2);
                expect(pos).to.have.property("name", "foo");
                expect(pos).to.have.property("line", 1);
                expect(pos).to.have.property("column", 2);
            });
        });

        describe(".init(name)", function () {
            it("should return initial position in source", function () {
                var init = SourcePos.init("foo");
                expect(init).to.have.property("name", "foo");
                expect(init).to.have.property("line", 1);
                expect(init).to.have.property("column", 1);
            });
        });

        describe(".equals(positionA, positionB)", function () {
            it("shoud return true when two positions represent the same position", function () {
                var pos = new SourcePos("foo", 1, 2);
                expect(SourcePos.equals(pos, pos)).to.be.true;
                expect(
                    SourcePos.equals(new SourcePos("bar", 3, 4), new SourcePos("bar", 3, 4))
                ).to.be.true;
            });

            it("should return false when two positions represent different positions", function () {
                expect(
                    SourcePos.equals(new SourcePos("foo", 3, 4), new SourcePos("bar", 3, 4))
                ).to.be.false;
                expect(
                    SourcePos.equals(new SourcePos("foo", 5, 6), new SourcePos("foo", 7, 6))
                ).to.be.false;
                expect(
                    SourcePos.equals(new SourcePos("foo", 7, 8), new SourcePos("foo", 7, 9))
                ).to.be.false;
                expect(
                    SourcePos.equals(new SourcePos("foo", 1, 2), new SourcePos("bar", 3, 4))
                ).to.be.false;
            });
        });

        describe(".compare(positionA, positionB)", function () {
            it("should return -1 when 'positionA' is former than 'positionB'", function () {
                expect(
                    SourcePos.compare(new SourcePos("abc", 3, 4), new SourcePos("bcd", 1, 2))
                ).to.equal(-1);
                expect(
                    SourcePos.compare(new SourcePos("foo", 1, 2), new SourcePos("foo", 1, 3))
                ).to.equal(-1);
                expect(
                    SourcePos.compare(new SourcePos("foo", 1, 2), new SourcePos("foo", 2, 1))
                ).to.equal(-1);
            });

            it("should return 1 when 'positionA is latter than 'positionB'", function () {
                expect(
                    SourcePos.compare(new SourcePos("bcd", 1, 2), new SourcePos("abc", 3, 4))
                ).to.equal(1);
                expect(
                    SourcePos.compare(new SourcePos("foo", 1, 3), new SourcePos("foo", 1, 2))
                ).to.equal(1);
                expect(
                    SourcePos.compare(new SourcePos("foo", 2, 1), new SourcePos("foo", 1, 2))
                ).to.equal(1);
            });

            it("should return 0 when two positions represent the same position", function () {
                var pos = new SourcePos("foo", 1, 2);
                expect(SourcePos.compare(pos, pos)).to.equal(0);
                expect(
                    SourcePos.compare(new SourcePos("bar", 3, 4), new SourcePos("bar", 3, 4))
                ).to.equal(0);
            });
        });

        describe("#toString()", function () {
            it("should return the string representation of the position", function () {
                expect(new SourcePos("foo", 1, 2).toString()).to.equal("\"foo\" (line 1, column 2)");
                expect(new SourcePos("", 3, 4).toString()).to.equal("(line 3, column 4)");
            });
        });

        describe("#clone()", function () {
            it("should return a copy of the position", function () {
                var pos = new SourcePos("foo", 1, 2);
                var copy = pos.clone();
                expect(copy).not.to.equal(pos);
                expect(SourcePos.equals(copy, pos)).to.be.true;
            });
        });

        describe("#setName(name)", function () {
            it("should return a copy of the position the name is set to the specified value", function () {
                var pos = new SourcePos("foo", 1, 2);
                var copy = pos.setName("bar");
                expect(copy).to.have.property("name", "bar");
                expect(copy).to.have.property("line", 1);
                expect(copy).to.have.property("column", 2);

                expect(pos).to.have.property("name").that.not.equals("bar");
                expect(copy).not.to.equal(pos);
            });
        });

        describe("#setLine(line)", function () {
            it("should return a copy of the position the line is set to the specified value", function () {
                var pos = new SourcePos("foo", 1, 2);
                var copy = pos.setLine(3);
                expect(copy).to.have.property("name", "foo");
                expect(copy).to.have.property("line", 3);
                expect(copy).to.have.property("column", 2);

                expect(pos).to.have.property("line").that.not.equals(3);
                expect(copy).not.to.equal(pos);
            });
        });

        describe("#setColumn(column)", function () {
            it("should return a copy of the position the column is set to the specified value", function () {
                var pos = new SourcePos("foo", 1, 2);
                var copy = pos.setColumn(3);
                expect(copy).to.have.property("name", "foo");
                expect(copy).to.have.property("line", 1);
                expect(copy).to.have.property("column", 3);

                expect(pos).to.have.property("column").that.not.equals(3);
                expect(copy).not.to.equal(pos);
            });
        });

        describe("#addChar(char, tabWidth)", function () {
            it("should return a copy of the position, the line and the column of which are incremented by the specified character", function () {
                var posA = new SourcePos("abc", 1, 2);
                var copyA = posA.addChar("a", 8);
                expect(copyA).to.have.property("name", "abc");
                expect(copyA).to.have.property("line", 1);
                expect(copyA).to.have.property("column", 3);

                var posB = new SourcePos("def", 1, 2);
                var copyB = posB.addChar("\n", 8);
                expect(copyB).to.have.property("name", "def");
                expect(copyB).to.have.property("line", 2);
                expect(copyB).to.have.property("column", 1);

                var posC = new SourcePos("ghi", 1, 1);
                var copyC = posC.addChar("\t", 8);
                expect(copyC).to.have.property("name", "ghi");
                expect(copyC).to.have.property("line", 1);
                expect(copyC).to.have.property("column", 9);

                var posD = new SourcePos("jkl", 1, 5);
                var copyD = posD.addChar("\t", 8);
                expect(copyD).to.have.property("name", "jkl");
                expect(copyD).to.have.property("line", 1);
                expect(copyD).to.have.property("column", 9);

                var posE = new SourcePos("mno", 1, 9);
                var copyE = posE.addChar("\t", 8);
                expect(copyE).to.have.property("name", "mno");
                expect(copyE).to.have.property("line", 1);
                expect(copyE).to.have.property("column", 17);

                var posF = new SourcePos("pqr", 1, 1);
                var copyF = posF.addChar("\t", 7);
                expect(copyF).to.have.property("name", "pqr");
                expect(copyF).to.have.property("line", 1);
                expect(copyF).to.have.property("column", 8);
            });
        });

        describe("#addString(str, tabWidth)", function () {
            it("should return a copy of the position, the line and the column of which are incremented by the specified string", function () {
                var posA = new SourcePos("abc", 1, 2);
                var copyA = posA.addString("foo", 8);
                expect(copyA).to.have.property("name", "abc");
                expect(copyA).to.have.property("line", 1);
                expect(copyA).to.have.property("column", 5);

                var posB = new SourcePos("def", 1, 2);
                var copyB = posB.addString("bar\nbaz", 8);
                expect(copyB).to.have.property("name", "def");
                expect(copyB).to.have.property("line", 2);
                expect(copyB).to.have.property("column", 4);

                var posC = new SourcePos("ghi", 1, 2);
                var copyC = posC.addString("hoge\nfuga\tpiyo", 8);
                expect(copyC).to.have.property("name", "ghi");
                expect(copyC).to.have.property("line", 2);
                expect(copyC).to.have.property("column", 13);

                var posD = new SourcePos("jkl", 1, 2);
                var copyD = posD.addString("hoge\nfuga\tpiyo", 7);
                expect(copyD).to.have.property("name", "jkl");
                expect(copyD).to.have.property("line", 2);
                expect(copyD).to.have.property("column", 12);
            });
        });
    });
});
