"use strict";

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var async = require('async');
var keys = require('./config/access');
var path = require('path');
var request = require('request');
var mysql = require('mysql');
var findClosestAndNearestPoint = require('./RoutingModule/findClosestAndNearestPointTurf');
var findRoutes = require('./RoutingModule/findRoutes');
var findSurfaceDetails = require('./RoutingModule/findSurfaceDetails');

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

app.get('/', function() {
    console.log("Hello!");
});

var connection = mysql.createConnection({
    host: keys.mysql.url,
    user: keys.mysql.username,
    password: keys.mysql.password,
    database: keys.mysql.database,
    port: 3306
});

connection.connect(function(err) {
    if (!err) {
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

    // console.log(req.body);
    var data = req.body;
    //data contains the lat and long of the src and destination points

    var src = [data.srclat, data.srclng];
    var dest = [data.destlat, data.destlng];

    //data contains the lat and long of the src and destination points
    // var src = [data.src.lat, data.src.lng];
    // var dest = [data.dest.lat, data.dest.lng];

    // Turf - Find the closest 3 stations for the given source and given destination  in the request

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

    // console.log(findClosestAndNearestPoint);
    var closestAndNearestPoints = findClosestAndNearestPoint.getClosestAndNearestPoint(src, dest, points);

    //Find Availability of bikes at the specific point

    getCurrentStationStatus(function(err, stationStatuses) {
        var srcPts = [];
        var destPts = [];
        for (var j = 0; j < stationStatuses.stationBeanList.length; j++) {
            for (var k = 0; k < closestAndNearestPoints.pointsCloseToSrc.length; k++) {
                if ((stationStatuses.stationBeanList[j].latitude.toFixed(6) === closestAndNearestPoints.pointsCloseToSrc[k][0].toFixed(6)) &&
                    (stationStatuses.stationBeanList[j].longitude.toFixed(6) === closestAndNearestPoints.pointsCloseToSrc[k][1].toFixed(6))) {
                    var srcPt = {
                      latlon: closestAndNearestPoints.pointsCloseToSrc[k],
                      availableBikes: stationStatuses.stationBeanList[j].availableBikes,
                      availableDocks: stationStatuses.stationBeanList[j].availableDocks
                    }
                    srcPts.push(srcPt);
                    // srcBikes.push(stationStatuses.stationBeanList[j].availableBikes);
                    // srcDocks.push(stationStatuses.stationBeanList[j].availableDocks);
                }
            }

            for (var l = 0; l < closestAndNearestPoints.pointsCloseToDest.length; l++) {
                if ((stationStatuses.stationBeanList[j].latitude.toFixed(6) == closestAndNearestPoints.pointsCloseToDest[l][0].toFixed(6)) &&
                    (stationStatuses.stationBeanList[j].longitude.toFixed(6) == closestAndNearestPoints.pointsCloseToDest[l][1].toFixed(6))) {
                    var destPt = {
                      latlon: closestAndNearestPoints.pointsCloseToDest[l],
                      availableBikes: stationStatuses.stationBeanList[j].availableBikes,
                      availableDocks: stationStatuses.stationBeanList[j].availableDocks
                    }
                    destPts.push(destPt);
                    // destBikes.push(stationStatuses.stationBeanList[j].availableBikes);
                    // destDocks.push(stationStatuses.stationBeanList[j].availableDocks);
                }
            }
        }

        var closestNearestPointsAndAvailability = {
            closestSrcPoints: srcPts,
            nearestSrcPoint: closestAndNearestPoints.nearestSrcPoint.geometry.coordinates,
            closestDestPoints: destPts,
            nearestDestPoint: closestAndNearestPoints.nearestDestPoint.geometry.coordinates
        };

        return res.status(200).send(closestNearestPointsAndAvailability);
    });
});


function getCurrentStationStatus(cb) {
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
        return cb(err, body);
    });
}


app.post('/getRoutes', function(req, res) {
    // console.log(req.body);  
    // var data = Object.keys(req.body);
    // console.log(req.body);
    var data = req.body;
    //data contains the lat and long of the src and destination points

    var src = [data.srclat, data.srclng];
    var dest = [data.destlat, data.destlng];

    //Directions API - Find routes for the selected source station and destination and send the result to the iOS app

    findRoutes.getRoutes(src, dest, function(err, results) {
        if (err) {
            console.log(err);
            return res.status(400).send("error");
        }

        var resultsJSON = JSON.parse(results);
        var polylines = [];
        for (var i = 0; i < resultsJSON.routes.length; i++) {
            polylines.push(resultsJSON.routes[i].geometry);
        }

        // console.log(polylines);

        polylines.push('w_pfFt%60elVq%40Qt%40ObAg'); //To test multiple

        findSurfaceDetails.getSurfaceDetails(polylines, function(err, results) {
            // Process the result
            if (err) {
                console.log(err);
                return res.status(400).send("error");
            }


            var surfaceJSONresults = [];
            for (var i = 0; i < results.length; i++) {
                var temp = JSON.parse(results[i]);
                surfaceJSONresults.push(temp);
            }

            var routesAndSurface = {
                routes: resultsJSON.routes,
                surfaceDetails: surfaceJSONresults
            };
            return res.status(200).send(routesAndSurface);

        });
    });
});


app.post('/getSurfaceDetails', function(req, res) {
    var data = req.body.data;
    //data contains the lat and long of the src and destination points

    var polylines = data.polylines; //Polyline array. One polyline for each route.
    // var src = [data.src.lat, data.src.lng];
    // var dest = [data.dest.lat, data.dest.lng];

    findSurfaceDetails.getSurfaceDetails(polylines, function(err, results) {
        // Process the result
        if (err) {
            console.log(err);
            return res.status(400).send("error");
        }
        return res.status(200).send(results);

    });
});

// Turf - Find the nearest station to the source and the nearest station to the destination
// Weigh the stations based on the current number of available bikes
// Also use the mysql database to weigh the stations based on the trend at the current time



//Directions API - Find routes for the selected source station and destination and send the result to the iOS app


//Surface API - Find the terrain for the routes returned by the directions API. For each of the routes.
