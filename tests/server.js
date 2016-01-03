/**
 * Copyright 2015
 * Created by Carlos on 12/29/2015.
 */

var express = require('../node_modules/express');
var logger = require('morgan');
var i18n = require('../src/middleware');
var app = express();
app.use(logger('dev'));
app.use(i18n.localize({endpointEnabled: true, path: __dirname + '/i18n', queryStringEnabled: true}));
app.use('/locals', function(req, res) {
	res.json(res.locals.i18n);
});
app.listen(4000);

exports.app = app;
