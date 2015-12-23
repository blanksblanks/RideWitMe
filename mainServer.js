"use strict";

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var keys = require('./config/access');
var path = require('path');
var request = require('request');
var mysql = require('mysql');
var findClosestAndNearestPoint = require('./RoutingModule/findClosestAndNearestPointTurf');
var findRoutes = require('./RoutingModule/findRoutes');


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

getStationDetails(connection);

var dbRows;
function getStationDetails(connection) {
  connection.query('select * from stations_details', function(err, rows, fields) {
    //Process the fields and store in a global array for use whenever required
    dbRows = rows;
  });
}

app.listen(app.get('port'), function() {
  console.log("Main server started on port: " + app.get('port'));
});


app.post('/getClosestPoints', function(req, res) {
    var data = req.body.data;

    //data contains the lat and long of the src and destination points
    var src = [data.src.lat, data.src.lng];
    var dest = [data.dest.lat, data.dest.lng];

    // Turf - Find the closest 3 stations for the given source and given destination
    // in the request

    //Convert the station_details into FeatureCollection.<Point> format so that it was be used with turf for getting the closest points
    var points = {
      "type": "FeatureCollection",
      "features": []
    };

    for (var i = 0; i < dbRows.length; i++) {
      var feature = {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [dbRows[i].latitude, dbRows[i].longitude]
        }
      };

      points.features.push(feature);
    }

    console.log(findClosestAndNearestPoint);
    var closestAndNearestPoints = findClosestAndNearestPoint.getClosestAndNearestPoint(src, dest, points);

    return res.status(200).send(closestAndNearestPoints);

});


app.post('/getRoutes', function(req, res) {
    var data = req.body.data;
    //data contains the lat and long of the src and destination points

    var src = [data.src.lat, data.src.lng];
    var dest = [data.dest.lat, data.dest.lng];

    //Directions API - Find routes for the selected source station and destination and send the result to the iOS app
    
    findRoutes.getRoutes(res, src, dest);
});






// Turf - Find the nearest station to the source and the nearest station to the destination
// Weigh the stations based on the current number of available bikes
// Also use the mysql database to weigh the stations based on the trend at the current time



//Directions API - Find routes for the selected source station and destination and send the result to the iOS app


//Surface API - Find the terrain for the routes returned by the directions API. For each of the routes. 
