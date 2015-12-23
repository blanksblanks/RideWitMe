"use strict";

var request = require('request');
var turf = require('turf');

var pointsInsidePolygon = function(polygon, points) {
    console.log(polygon);
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


    // console.log("Inside pointsInsidePolygon");
    // console.log(points.features[0]);
    // console.log(searchWithin.features[0].geometry.coordinates);

    var ptsWithin = turf.within(points, searchWithin);

    // console.log("Pts within");
    // console.log(ptsWithin);
    return ptsWithin;
};



function getPolygonCoordinates(point) {
    console.log(point);
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
        "coordinates": [nonFeaturePoint.lat, nonFeaturePoint.lng]
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
    // console.log("Closest points");
    // console.log(closestPoints);
    // console.log(closestPoints.pointsNearSrc.features[0]);
    // console.log(closestPoints.pointsNearDest.features[0]);
    //Closest points are of the form FeatureCollection.<Point>

    var nearestSrcPoint = pointNearest(convertPointToFeaturePoint(src), closestPoints.pointsNearSrc);
    var nearestDestPoint = pointNearest(convertPointToFeaturePoint(dest), closestPoints.pointsNearDest);

    return {nearestSrcPoint:nearestSrcPoint, nearestDestPoint:nearestDestPoint, pointsNearSrc: closestPoints.pointsNearSrc, pointsNearDest: closestPoints.pointsNearDest};
}


module.exports = { getClosestAndNearestPoint: getClosestAndNearestPoint };