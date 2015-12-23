"use strict";

var request = require('request');
var keys = require('./../config/access.js');


var getRoutes = function(src, dest, cb) {
    console.log("getRoutes");
    var baseUrl = "https://api.mapbox.com/v4/directions/";
    var typeOfTransport = "mapbox.cycling/";

    console.log(src);
    console.log(dest);
    var srcLat = parseFloat(src[0]);
    var srcLng = parseFloat(src[1]);
    var destLat = parseFloat(dest[0]);
    var destLng = parseFloat(dest[1]);

    var waypoints = srcLng + "," + srcLat + ";" + destLng + "," + destLat;
    var access_token = keys.mapbox.apiKey;

    var completeUrl = baseUrl + typeOfTransport + waypoints 
        + ".json?alternatives=true&instructions=html&geometry=polyline&steps=true&access_token=" 
        + access_token;

    // console.log(completeUrl);

    request.get(completeUrl, {
        }, function(err, response, resultBody) {
            return cb(err, resultBody);
    });
}


module.exports = { getRoutes: getRoutes};






