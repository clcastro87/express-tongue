# express-tongue

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]

**Express middleware to handle sites in multiple languages.**

The following localization setup are supported:

  - authenticated user with language attribute
    ```js
    Ex: req.user.language
    ```
  - querystring 
    ```
    Ex: ?hl=en
    ```
  - cookie
  - User-Agent
  - default language

## Install

```bash
$ npm install express-tongue
```

## API

```js
var app = express();
var i18n = require('express-tongue');
app.use(i18n.localize({ 
    endpointEnabled: true, 
    path: __dirname + '/i18n', 
    queryStringEnabled: true
}));
```

### localize([options])

Returns the localization middleware using the given `options`. This middleware injects 
the variable i18n inside res.locals, for usage inside template engines. Also is you are
planning to use localization on client side; for example in SPA, then you have 
several endpoints which helps you to develop a fully localized page.

#### Options

`localize()` accepts these properties in the options object. 

##### defaultLang

Default language abbreviation. Defaults to `en`.

##### path

Directory where localization files are located. Defaults to `WORKING_DIR/i18n`.

##### languages

Replace available languages for those specified in array. This is useful when you want
to deactivate some language.

##### endpointEnabled

Enables API endpoint for usage in client apps. Defaults to `false`

##### endpointPath

Route in which endpoint will be mounted. Defaults to `/i18n`

##### queryStringEnabled

Allows language replacement by setting key in querystring.

##### queryStringKey

Setup key used in querystring to define current language. Defaults to `hl`.

#### langCookie

Cookie name for storing current locale.

## Examples

### express/connect

When using this module with express or connect, simply `app.use` the module as
high as you like. Requests that pass through the middleware will inject `i18n` property 
to res.locals

```js
var i18n = require('compression')
var express = require('express')

var app = express();
var i18n = require('express-tongue');
app.use(i18n.localize({ 
    endpointEnabled: true, 
    path: __dirname + '/i18n', 
    queryStringEnabled: true
}));

app.use('/locals', function(req, res) {
    res.json(res.locals.i18n);
});
```

## License

[MIT](LICENSE)