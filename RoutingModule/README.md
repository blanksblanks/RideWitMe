# RideWitMe
# A Team
# Routing Web Service
Web server to find the closest and nearest citibike stations to a given source point, find the routes between any two given latitude and longitude, find the surface features for the retrived routes from getRoutes.


findClosestAndNearestPoints - returns a json object containing all the citibike stations within a given square arpund the source and destination point mentioned. It also returns the mearest source and destination citibike station location. The app uses the Turf api provided by the Mapbox api to get the above results. The citibike station json is queried to get the current locations of all the citibike stations which acts as the points from which the closest points are to be searched. Takes source and destination latitude and longitude as input.
Eg Input:
src = [lat,lng]
dest = [lat,lng]
allPoints = [{
              "type": "Feature",
              "properties": {},
              "geometry": {
                  "type": "Point",
                  "coordinates": [latitude, longitude]
             }, 
             ....
            ]
allPoints is an array of featurePoints

Eg Output:
{
	pointsCloseToSrc: {
		{
			latlon: [,],
		},
		{
			latlon: [,],
		},
		...
	},
	nearestSrcPoint: [,],
	pointsCloseToDest: {
		{
			latlon: [,],
		},
		{
			latlon: [,],
		},
		...
	},
	nearestDestPoint: [,]
}


findRoutes - returns a JSON object that contains the different routes between the source and destination locations passed as input along with the surface/terrain information about each of the routes. The endpoint uses the Directions api provided by Mapbox in order to find the best available routes between the source and destination in order of recommendation. The data returned by the Mapbox Directions API contains the points along the route along with the duration, distance and steps in the route.
Eg Input:
src = [lat,lng]
dest = [lat,lng]
allPoints = [[lat1,lng1], [lat2,lng2], ....]

Eg Output:
{
  "routes": [
    {
      "distance": 1335,
      "duration": 490,
      "summary": "City Hall Park Greenway - Murray Street",
      "geometry": polyline or set of coordinates for the route
      "steps": [List of Objects giving turn by turn directions]
    },
    {...
	},
	...
  ]
}



findSurfaceDetails - returns a JSON object with the surface details for every polyline passed as input. The function uses the Surface API provided by the Mapbox api. It returns the elevation for every point in the polyline. Useful for weighting the routes based on the eleveation profile.

Eg Input: 
polylines = ["cu|slAlj}clCkCpIwGxKmApCyAvIwIdQ{DvHzb@n", "@hkAuFfl@wJffAy@zHcAdJm@lGeFjq@aE", ...]

Eg Output: 
[   
    {
      "results": [
        {
          "id": 0,
          "latlng": {
            "lat": 407.13058,
            "lng": -740.05687
          },
          "ele": 23
        },
        {
          "id": 1,
          "latlng": {
            "lat": 407.13128,
            "lng": -740.05856
          },
          "ele": 32
        },
        ....
       ]
    },
    {
       "results": [....]
    },
	....
]