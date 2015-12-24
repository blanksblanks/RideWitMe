# RideWitMe
# A Team

An interactive route planner on iOS and web with recommendations for the best possible Citibike route based on station, traffic, terrain conditions and insider tips from real users. Plan a trip with your friends and see their locations updated in realtime as you converge on your destination.

# Main Web Server - mainServer.js
Web server to serve the Routing endpoints. Starts an express server and listens to client requests.

/getClosestPoints - Takes the source and destination latitudes and longitudes as input and outputs the closest citibike station locations and bike availabilities. This calls into the findRoutes file to perform the Turf calls.
Eg:Input
{
	"srclat": "",
	"srclng": "",
	"destlat": "",
	"destLng": ""
}

Eg Output:
{
	closestSrcPoints: {
		{
			latlon: [,],
			availableBikes: "",
			availableDocks
		},
		...
	},
	nearestSrcPoint: [,],
	closestDestPoints: {
		{
			latlon: [,],
			availableBikes: "",
			availableDocks
		},
		...
	},
	nearestDestPoint: [,]
}


/getRoutes - Takes the start and end citibike stations location and provides the possible routes and surface information for those routes. The endpoint first calls into the Directions API to get the coordinate result for routes, calls the API again to get the polyline results to be passed into the findSurfaceDetails file to get the surface details as a JSON object. The routes and their surface information are then sent as response to the user.

Eg:Input
{
	"srclat": "",
	"srclng": "",
	"destlat": "",
	"destLng": ""
}

Eg Output:
{
  "routes": [
    {
      "distance": 1335,
      "duration": 490,
      "summary": "City Hall Park Greenway - Murray Street",
      "geometry": {
      		"type" : "LineString",
      		"coordinates": {
      			[,],
      			[,],
      			...
      		}
  	  },
      "steps": [ {Object}, {Object}, .... ]
    },
    {
    	....
    }
  ],
  "surfaceDetails": [
    {
      "results": [
        {
          "id": 0,
          "latlng": {
            "lat": 40.713058,
            "lng": -74.005687
          },
          "ele": 45
        },
        {
          ...
        }
      ]
    },
    {
     ...
    }
  ]
}



# dataCollectServer.js - Used in conjunction with the DataCollection functions to store data into the Amazon RDS DB. More information about the functionality is found in the README under DataCollection. This server is deployed separate from the mainServer.js which handles the routing requests.

