"use strict";

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var keys = require('./config/access');
var dataModel = require('./model/predictiveDataSchema');
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

app.set('port', process.env.PORT || 5000);

//Setting up middleware services
app.use(express.static('public'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

var server = http.createServer(app).listen(app.get('port'), function() {
    console.log("Data Collection Server started on port: " + app.get('port'));
});

app.get('/', function(req, res) {
    //Get the data from the files and put into the db




    //Continue getting data from the citibike realtime api at regular intervals and update the db
    request.post('http://www.citibikenyc.com/stations/json', {
        headers: {
            'Content-Type': 'application/json'
        },
        form: {
            outputMode: "json"
        },
        json: true
    }, function(err, res, resultBody) {
     var body = JSON.parse(JSON.stringify(resultBody));
	});

	res.send("Hello from the other side! :)")
     // for (dataEntry in body.stationBeanList)
    
});