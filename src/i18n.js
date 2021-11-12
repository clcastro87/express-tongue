/**
 * Express middleware to handle automatic localization.
 *
 * @author: Carlos Luis Castro Márquez
 * @copyright: Spissa Software Solutions
 * @date: 05/02/2015
 */
(function (i18n) {
    "use strict";

    // Module requires
    var _ = require("lodash");
    var fs = require("fs");
    var path = require("path");
    var config = require("./config");
    var express = require("express");

    // Module exports
    i18n.localize = localizeMiddleware;

    function localizeMiddleware(options) {
        // Set default options if not present
        options = options || {};
        var defaultLangAbbr = options.defaultLangAbbr || "es";
        var languagesPath = options.path || "src/server/i18n";

        // Private fields
        var resources = {};
        var defaultLang = {};
        var languages = [];

        /**
         * Initializes localization engine.
         * */
        function initialize() {
            // Build default lang
            defaultLang = buildLang(defaultLangAbbr);
            // Get languages specified in configuration file
            var configLanguages = config.get("languages") || [];
            // Build all these languages
            for (var i = 0; i < configLanguages.length; i++) {
                buildLang(configLanguages[i]);
            }
            languages = _.map(resources, "lang");
        }

        /**
         * Builds path for a language.
         *
         * @param: lang Language abbreviation.
         * */
        function buildLangPath(lang) {
            // Secure with realpath to avoid wrong absolute uri
            return fs.realpathSync(languagesPath + path.sep + lang + ".json");
        }

        /**
         * Builds localization data for language.
         *
         * @param: lang Language abbreviation.
         * */
        function buildLang(lang) {
            // Checks if lang is already build
            if (resources[lang] !== undefined) {
                return false;
            }
            // Get lang path
            var langPath = buildLangPath(lang);
            // Get key values from file, and overrides an empty object for security
            var keyValues = _.extend({}, require(langPath));
            // Set strings from default language if does not exists this key in language selected.
            keyValues.strings = _.defaults(
                keyValues.strings,
                defaultLang.strings
            );
            // Set language data in cache.
            resources[lang] = keyValues;
            // Return lang dictionary
            return keyValues;
        }

        /**
         * Wraps different kind of requests to obtain a valid language
         *
         * @param: langString Language abbreviation, or request languages.
         * */
        function getLocaleData(langString) {
            if (_.isString(langString)) {
                // If string get language data
                return getLang(langString);
            } else if (_.isArray(langString)) {
                // If array validate because sometimes express return null as string and causes a bug.
                if (langString.length === 1 && langString[0] === "null") {
                    langString = [defaultLangAbbr];
                }
                // Then get first available language by priority
                return getLangs(langString);
            } else {
                // Otherwise throw an error
                throw new Error("Wrong method input!");
            }
        }

        /**
         * Get resources for a given language
         *
         * @param: lang Language abbreviation.
         * */
        function getLang(lang) {
            // If there are available resources for the language given returns it
            if (_.has(resources, lang)) {
                return resources[lang];
            }
            // Otherwise return default resources
            return defaultLang;
        }

        /**
         * Get the most accurate language according by accepted languages given by express
         *
         * @param: lang Language abbreviation.
         * */
        function getLangs(langString) {
            // Parse languages
            var langArray = parseLangs(langString);
            // Get the first available language
            for (var i = 0; i < langArray.length; i++) {
                var lang = langArray[i];
                if (_.has(resources, lang)) {
                    return resources[lang];
                }
            }
            // Otherwise return default language
            return defaultLang;
        }

        /**
         * Parse languages given by express
         *
         * @param: lang Language abbreviation.
         * */
        function parseLangs(langArray) {
            var detectedLangs = [];
            for (var i = 0; i < langArray.length; i++) {
                var item = langArray[i];
                // Get only language not locale
                var pos = item.indexOf("-");
                if (pos !== -1) {
                    detectedLangs.push(item.substr(0, pos));
                } else {
                    detectedLangs.push(item);
                }
            }
            // Avoid repetitions and wrong values
            detectedLangs = _.compact(detectedLangs);
            detectedLangs = _.uniq(detectedLangs);
            return detectedLangs;
        }

        /**
         * Get languages available from strings.
         * */
        function getLanguages() {
            return _.map(resources, function (item) {
                return { name: item.language, value: item.lang };
            });
        }

        /**
         * Serves locale data in res.locals.i18n.
         *
         * @param: req Express request.
         * @param: res Express response.
         * @param: next Next call in express pipeline.
         * */
        function serveLocaleData(req, res, next) {
            res.locals.i18n = {};

            if (req.user && req.user.language) {
                res.locals.i18n = getLocaleData(req.user.language);
            } else if (req.cookies && req.cookies.language) {
                res.locals.i18n = getLocaleData(req.cookies.language);
            } else {
                // Ask express for language accepted according to request
                var accepted = req.acceptsLanguages(languages);
                // If there is no one accepted then select default
                if (!accepted) {
                    accepted = defaultLangAbbr;
                }
                res.locals.i18n = getLocaleData(accepted);
            }
            next();
        }

        /**
         * Serves all i18n resources.
         *
         * @param: req Express request.
         * @param: res Express response.
         * @param: next Next call in express pipeline.
         * */
        function serveResources(req, res, next) {
            return res.json(res.locals.i18n);
        }

        /**
         * Serves i18n string resources.
         *
         * @param: req Express request.
         * @param: res Express response.
         * @param: next Next call in express pipeline.
         * */
        function serveStrings(req, res, next) {
            return res.json(res.locals.i18n.strings);
        }

        /**
         * Serves i18n available languages.
         *
         * @param: req Express request.
         * @param: res Express response.
         * @param: next Next call in express pipeline.
         * */
        function serveLanguages(req, res, next) {
            return res.json(getLanguages());
        }

        // Initialize engine
        initialize();

        // Build sub router and return as middleware
        var router = express.Router();
        router.all("*", serveLocaleData);
        router.get("/i18n", serveResources);
        router.get("/i18n/strings", serveStrings);
        router.get("/i18n/languages", serveLanguages);
        return router;
    }
})(module.exports);
