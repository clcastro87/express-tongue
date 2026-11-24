/**
 * Optional wrapper around the "debug" package.
 */
"use strict";

/**
 * Creates a debug logger, or a no-op when "debug" is not installed.
 *
 * @param {String} namespace
 * @returns {Function}
 */
function createDebug(namespace) {
    try {
        return require("debug")(namespace);
    } catch (err) {
        if (err.code !== "MODULE_NOT_FOUND") {
            throw err;
        }
        return function () {};
    }
}

module.exports = createDebug;
