/**
 * Express middleware to handle automatic localization.
 *
 * @author: Carlos Luis Castro Márquez
 * @date: 05/02/2015
 */
(function (i18n) {
    'use strict';

    // Environment configuration
    var env = process.env.NODE_ENV || 'development';
    var DEBUG = env === 'development';
    var DEBUG_SIGNATURE = 'i18n';

    // Module requires
    var _ = require('lodash');
    var fs = require('fs');
    var path = require('path');
    var express = require('express');
    //var debug = DEBUG ? require('debug')(DEBUG_SIGNATURE) : function () {};
    var debug = require('debug')(DEBUG_SIGNATURE);

    // Module exports
    i18n.localize = localizeMiddleware;

    /**
     * Generates an Express middleware to handle sites in multiple languages.
     *
     * This middleware injects the variable i18n inside res.locals, for usage inside template engines. Also is you are
     * planning to use localization on client side; for example in SPA, then you have several endpoints which helps
     * you to develop a fully localized page.
     *
     * ### Options:
     *
     *   - `defaultLang` {String} Default language abbreviation. Defaults to `en`.
     *   - `path` {String} Directory where localization files are located. Defaults to `WORKING_DIR/i18n`.
     *   - `languages` {Array} Replace available languages for specified. This is useful when you want
     *   to deactivate some language
     *   - `endpointEnabled` {Boolean} Enables API endpoint for usage in client apps. Defaults to `false`
     *   - `endpointPath` {String} Route in which endpoint will be mounted. Defaults to `/i18n`
     *   - `queryStringEnabled` {Boolean} Allows language replacement by setting key in querystring.
     *   - `queryStringKey` {String} Setup key used in querystring to define current language. Defaults to `hl`.
     *   - `langCookie` {String} Cookie name for storing current locale.
     *
     * @param {Object} options
     * @returns {Function} Express middleware function.
     */
    /* jshint maxcomplexity: 12 */
    /* jshint -W071 */
    function localizeMiddleware(options) {

        // Set default options if not present
        options = options || {};
        options.defaultLang = options.defaultLang || 'en';
        options.path = options.path || path.join(process.cwd(), 'i18n');
        options.languages = options.languages || mapDirectoryFiles();
        options.endpointEnabled = options.endpointEnabled || false;
        options.endpointPath = options.endpointPath || '/i18n';
        options.queryStringEnabled = options.queryStringEnabled || false;
        options.queryStringKey = options.queryStringKey || 'hl';
        options.langCookie = options.langCookie || 'xp_i18n_lang';

        debug('Configuration options:', options);

        // Private fields
        var languagesConfigured = options.languages;
        var defaultLangAbbr = options.defaultLang;
        var languagesPath = options.path;
        var resources = {};
        var defaultLang = {};
        var languages = [];
        var cookieTTL = 365 * 24 * 3600000; // 1 year

        /**
         * Maps language files in i18n directory
         *
         * @returns {Array} Array of available languages in directory.
         * */
        function mapDirectoryFiles() {
            var available = [];
            fs.readdirSync(options.path)
                .filter(function (file) {
                    return (file.indexOf('.') !== 0) && (file.indexOf('.json') === file.length - 5);
                })
                .forEach(function (file) {
                    available.push(file.substring(0, file.indexOf('.')));
                });
            debug('Languages in directory:', available);
            return available;
        }

        /**
         * Initializes localization engine.
         * */
        function initialize() {
            // Build default lang
            debug('Building default language:', defaultLangAbbr);
            defaultLang = buildLang(defaultLangAbbr);
            // Build all these languages
            languagesConfigured.forEach(function (lang) {
                if (lang !== defaultLangAbbr) {
                    debug('Building lang:', lang);
                    buildLang(lang);
                }
            });
            languages = _.map(resources, 'lang');
        }

        /**
         * Builds path for a language.
         *
         * @param {String} lang Language abbreviation.
         * @returns {String} Path to language file.
         * */
        function buildLangPath(lang) {
            // Secure with realpath to avoid wrong absolute uri
            return fs.realpathSync(path.join(languagesPath, lang + '.json'));
        }

        /**
         * Builds localization data for language.
         *
         * @param {String} lang Language abbreviation.
         * @returns {Object} Language object.
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
            keyValues.strings = _.defaults(keyValues.strings, defaultLang.strings);
            // Set language data in cache.
            resources[lang] = keyValues;
            // Return lang dictionary
            return keyValues;
        }

        /**
         * Gets localization data for specified language
         *
         * @param {String} langString Language abbreviation.
         * @returns {Object} Localization data object.
         * */
        function getLocaleData(langString) {
            if (!_.isString(langString)) {
                throw new TypeError('Wrong method input!');
            }
            // If string get language data
            return getLang(langString);
        }

        /**
         * Get resources for a given language
         *
         * @param {String} lang Language abbreviation.
         * @returns {Object} Localization resources.
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
         * Get languages available from strings.
         *
         * @returns {Array} Array with information referred to loaded languages.
         * */
        function getLanguages() {
            return _.map(resources, function (item) {
                return {name: item.language, value: item.lang};
            });
        }

        /**
         * Serves locale data in res.locals.i18n.
         *
         * @param {Object} req Express request.
         * @param {Object} res Express response.
         * @param {Function} next Next call in express pipeline.
         * */
        function serveLocaleData(req, res, next) {
            res.locals.i18n = {};
            var i18nQueryKey = options.queryStringKey;
            var queryValue = req.query[i18nQueryKey];

            if (req.user && req.user.language) {
                debug('Setting according to user language.');
                res.locals.i18n = getLocaleData(req.user.language);
            }
            else if (req.query && queryValue && queryValue.length === 2) {
                res.locals.i18n = getLocaleData(queryValue);
                res.cookie(options.langCookie, queryValue, {maxAge: cookieTTL});
            }
            else if (req.cookies && req.cookies[options.langCookie]) {
                debug('Setting according to cookie language.');
                res.locals.i18n = getLocaleData(req.cookies[options.langCookie]);
            }
            else {
                debug('Setting according to User-Agent.');
                // Ask express for language accepted according to request
                var accepted = req.acceptsLanguages(languages);
                // If there is no one accepted then select default
                if (!accepted) {
                    debug('User-Agent does not accept an language, setting default instead.');
                    accepted = defaultLangAbbr;
                }
                else {
                    debug('User-Agent accepts:', accepted);
                }
                res.locals.i18n = getLocaleData(accepted);
            }
            next();
        }

        /**
         * Serves all i18n resources.
         *
         * @param {Object} req Express request.
         * @param {Object} res Express response.
         * @param {Function} next Next call in express pipeline.
         * */
        function serveResources(req, res, next) {
            return res.json(res.locals.i18n);
        }

        /**
         * Serves i18n string resources.
         *
         * @param {Object} req Express request.
         * @param {Object} res Express response.
         * @param {Function} next Next call in express pipeline.
         * */
        function serveStrings(req, res, next) {
            return res.json(res.locals.i18n.strings);
        }

        /**
         * Serves i18n available languages.
         *
         * @param {Object} req Express request.
         * @param {Object} res Express response.
         * @param {Function} next Next call in express pipeline.
         * */
        function serveLanguages(req, res, next) {
            return res.json(getLanguages());
        }

        // Initialize engine
        initialize();

        // Builds sub router and returns as middleware
        var router = express.Router();
        router.all('*', serveLocaleData);
        if (options.endpointEnabled) {
            debug('Setting i18n endpoint!');
            var endpointPath = options.endpointPath;
            var lastSlash = endpointPath.lastIndexOf('/');
            if (lastSlash === (endpointPath.length - 1)) {
                endpointPath.substring(0, lastSlash);
            }
            router.get(endpointPath, serveResources);
            router.get(endpointPath + '/strings', serveStrings);
            router.get(endpointPath + '/languages', serveLanguages);
        }
        return router;
    }

})(module.exports);
