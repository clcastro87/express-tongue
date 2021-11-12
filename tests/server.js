/**
 * @author: Carlos Luis Castro Márquez
 */
"use strict";

const express = require("../node_modules/express");
const logger = require("morgan");
const i18n = require("../src/middleware");
const app = express();
app.use(logger("dev"));
app.use(
    i18n.localize({
        endpointEnabled: true,
        path: __dirname + "/i18n",
        queryStringEnabled: true,
    })
);
app.use("/locals", function (req, res) {
    res.json(res.locals.i18n);
});
app.listen(4000);

exports.app = app;
