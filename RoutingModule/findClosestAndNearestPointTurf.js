"use strict";

var request = require('request');
var turf = require('turf');

var pointsInsidePolygon = function(polygon, points) {
    // console.log(polygon);
    var searchWithin = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": polygon
          }
        }
      ]
    };

    var ptsWithin = turf.within(points, searchWithin);

    return ptsWithin;
};



function getPolygonCoordinates(point) {
    // console.log(point);
    var lat = parseFloat(point[0]);
    var lng = parseFloat(point[1]);
    var polygonCoordinates = [[
      [lat-0.05,lng-0.05],
      [lat+0.05,lng-0.05],
      [lat-0.05,lng+0.05],
      [lat+0.05,lng+0.05]
    ]];

    return polygonCoordinates;
};


var getClosestPoints = function(src, dest, allPoints) {
    var pointsNearSrc = pointsInsidePolygon(getPolygonCoordinates(src), allPoints);
    var pointsNearDest = pointsInsidePolygon(getPolygonCoordinates(dest), allPoints);

    console.log(pointsNearSrc);
    console.log(pointsNearDest);

    return { pointsNearSrc: pointsNearSrc, pointsNearDest: pointsNearDest};
};


var convertPointToFeaturePoint = function(nonFeaturePoint) {
    var featurePoint = {
      "type": "Feature",
      "properties": {
        "marker-color": "#0f0"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [parseFloat(nonFeaturePoint[0]), parseFloat(nonFeaturePoint[1])]
      }
    };

    return featurePoint;
}

var pointNearest = function(featurePoint, closestPoints) {
    // console.log(closestPoints);
    var nearest = turf.nearest(featurePoint, closestPoints);
    nearest.properties['marker-color'] = '#f00';
    return nearest;
};

function getClosestAndNearestPoint(src, dest, allPoints) {
    var closestPoints = getClosestPoints(src, dest, allPoints);

    //Closest points are of the form FeatureCollection.<Point>

    var nearestSrcPoint = pointNearest(convertPointToFeaturePoint(src), closestPoints.pointsNearSrc);
    var nearestDestPoint = pointNearest(convertPointToFeaturePoint(dest), closestPoints.pointsNearDest);

    //Convert the FeatureCollection point into array of lat,lng
    var src = nearestSrcPoint.geometry.coordinates;
    var dest = nearestDestPoint.geometry.coordinates;

    var srcClosePoints = [];
    var destClosePoints = [];
    for (var i=0; i < closestPoints.pointsNearSrc.features.length; i++) {
        srcClosePoints.push(closestPoints.pointsNearSrc.features[i].geometry.coordinates);
    }

    for (var i=0; i < closestPoints.pointsNearDest.features.length; i++) {
        destClosePoints.push(closestPoints.pointsNearDest.features[i].geometry.coordinates);
    }

    return {nearestSrcPoint:nearestSrcPoint, nearestDestPoint:nearestDestPoint, pointsCloseToSrc: srcClosePoints, pointsCloseToDest: destClosePoints};
}


module.exports = { getClosestAndNearestPoint: getClosestAndNearestPoint };