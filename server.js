"use strict";

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var keys = require('./config/access');
var path = require('path');
var request = require('request');
var mysql = require('mysql');
var liveDataCollection = require('./DataCollection/liveDataCollect');

var app = express();

app.set('port', process.env.PORT || 3000);

//Setting up middleware services
app.use('/static', express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + '/data'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.get('/', function(){
	console.log("Hello!");
});

var connection = mysql.createConnection({
  host     : keys.mysql.url,
  user     : keys.mysql.username,
  password : keys.mysql.password,
  database : keys.mysql.database,
  port : 3306
});

connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... \n");    
} else {
    console.log("Error connecting database ... \n");    
}
});

app.listen(app.get('port'), function() {
    console.log("Main server started on port: " + app.get('port'));
});

//Collect data
liveDataCollection.startLiveDataCollection(connection);