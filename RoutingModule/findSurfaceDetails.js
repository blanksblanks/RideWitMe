"use strict";

var request = require('request');
var keys = require('./../config/access.js');
var async = require('async');


var getSurfaceDetails = function(polylines, cb) {
    console.log("getSurface");
    var baseUrl = "https://api.mapbox.com/v4/surface/";
    var mapid = "mapbox.mapbox-terrain-v1";

    var access_token = keys.mapbox.apiKey;

    async.map(polylines, function(polyline, next) {
        var completeUrl = baseUrl + mapid + ".json?layer=contour&fields=ele&encoded_polyline=" + polyline + "&access_token=" + "pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q";

        request.get(completeUrl, {}, function(err, response, resultBody) {
            if (err) {
                return next();
            } else {
                // console.log(resultBody);
                return next(null, resultBody);
            }
        });
    }, cb);
}


module.exports = {
    getSurfaceDetails: getSurfaceDetails
};
