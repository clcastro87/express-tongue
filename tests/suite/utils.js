
const expect = require("chai").expect;
const utils = require("../../src/utils");

describe("Utils", function () {
    describe("map", function () {
        it("should map over an array", function () {
            const result = utils.map([1, 2, 3], (x) => x * 2);
            expect(result).to.deep.equal([2, 4, 6]);
        });

        it("should map over an object", function () {
            const result = utils.map({ a: 1, b: 2 }, (value, key) => key + value);
            expect(result).to.have.members(["a1", "b2"]);
        });

        it("should return an empty array for null or undefined", function () {
            expect(utils.map(null)).to.deep.equal([]);
            expect(utils.map(undefined)).to.deep.equal([]);
        });
    });

    describe("extend", function () {
        it("should extend an object with properties from other objects", function () {
            const result = utils.extend({ a: 1 }, { b: 2 }, { c: 3 });
            expect(result).to.deep.equal({ a: 1, b: 2, c: 3 });
        });

        it("should overwrite properties from left to right", function () {
            const result = utils.extend({ a: 1, b: 2 }, { b: 3, c: 4 });
            expect(result).to.deep.equal({ a: 1, b: 3, c: 4 });
        });

        it("should handle null or undefined sources", function () {
            const result = utils.extend({ a: 1 }, null, { b: 2 }, undefined);
            expect(result).to.deep.equal({ a: 1, b: 2 });
        });
    });

    describe("isString", function () {
        it("should return true for strings", function () {
            expect(utils.isString("hello")).to.be.true;
            expect(utils.isString("")).to.be.true;
        });

        it("should return false for non-strings", function () {
            expect(utils.isString(123)).to.be.false;
            expect(utils.isString({})).to.be.false;
            expect(utils.isString([])).to.be.false;
            expect(utils.isString(null)).to.be.false;
            expect(utils.isString(undefined)).to.be.false;
        });
    });

    describe("has", function () {
        it("should return true if object has property", function () {
            expect(utils.has({ a: 1 }, "a")).to.be.true;
        });

        it("should return false if object does not have property", function () {
            expect(utils.has({ a: 1 }, "b")).to.be.false;
        });

        it("should return false for inherited properties", function () {
            function Test() {
                this.a = 1;
            }
            Test.prototype.b = 2;
            const obj = new Test();
            expect(utils.has(obj, "a")).to.be.true;
            expect(utils.has(obj, "b")).to.be.false;
        });
    });
});
