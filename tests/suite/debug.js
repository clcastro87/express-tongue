const { describe, it } = require("node:test");
const Module = require("node:module");
const expect = require("chai").expect;
const createDebug = require("../../src/debug");

function failDebugWith(t, code) {
    const load = Module._load;
    t.mock.method(Module, "_load", function (request) {
        if (request === "debug") {
            throw Object.assign(new Error("debug failed to load"), { code });
        }
        return load.apply(this, arguments);
    });
}

describe("Debug", function () {
    it("should use the debug package when available", function () {
        expect(createDebug("i18n").namespace).to.equal("i18n");
    });

    it("should return a no-op when debug is not installed", function (t) {
        failDebugWith(t, "MODULE_NOT_FOUND");
        const debug = createDebug("i18n");
        expect(debug.namespace).to.equal(undefined);
        expect(debug("message", {})).to.equal(undefined);
    });

    it("should rethrow other load errors", function (t) {
        failDebugWith(t, "EACCES");
        expect(() => createDebug("i18n")).to.throw("debug failed to load");
    });
});
