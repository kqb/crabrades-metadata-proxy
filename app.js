var express = require("express");
var app = express();
var cors = require('cors');
app.use(cors());
var metadataRouter = require('./routes/api/token-metadata')
app.use('/api/token-metadata', metadataRouter);

module.exports = app;