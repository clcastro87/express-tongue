/**
 * Small utility functions to replace minimal lodash usage.
 */
"use strict";

/**
 * Map over a collection
 *
 * @param {Object|Array} collection
 * @param {Function} iteratee
 * @returns
 */
function map(collection, iteratee) {
    if (collection == null) {
        return [];
    }
    if (Array.isArray(collection)) {
        return collection.map(iteratee);
    }
    return Object.keys(collection).map((k) => iteratee(collection[k], k));
}

/**
 * Extends an object with properties from sources.
 *
 * @returns {Object} Extended object.
 */
function extend(/*, ...sources */) {
    let target = {};
    for (let i = 0; i < arguments.length; i++) {
        const src = arguments[i];
        if (src == null) continue;
        target = Object.assign(target, src);
    }
    return target;
}

/**
 * Check if value is a string
 *
 * @param {*} value
 * @returns
 */
function isString(value) {
    return typeof value === "string";
}

/**
 * Check if object has property
 *
 * @param {Object} obj
 * @param {String} prop
 * @returns
 */
function has(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = {
    map,
    extend,
    isString,
    has,
};
