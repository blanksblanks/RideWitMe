"use strict";

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var keys = require('./config/access');
var path = require('path');
var request = require('request');
var AWS = require('aws-sdk');
var awsRegion = 'us-east-1';

AWS.config.update({
    accessKeyId: (process.env.awsAccessKey || keys.awsKeys.accessKey),
    secretAccessKey: (process.env.awsAccessKeySecret || keys.awsKeys.accessKeySecret),
    region: (process.env.awsRegion || 'us-east-1')
});

var app = express();

app.set('port', process.env.PORT || 3000);

//Setting up middleware services
app.use(express.static('public'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

var server = http.createServer(app).listen(app.get('port'), function() {
    console.log("Main Server started on port: " + app.get('port'));
});

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, './views', 'index.html'));
	// res.send("Hello from the other side! :)");
});