"use strict";

var fs = require( 'fs' );
var request = require('request');
var dataSchema = require('./model/predictiveDataSchema');
var path = require('path');

var collectData = function() {
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
	
		console.log(body.stationBeanList[0]);

     	var unixTimeStamp = new Date().getTime(); //Use the unix timestamp as the station summary id(i.e. snapshot id)
     	var allStationStatuses = [];
     	var allStationDetails = [];
     	for (var i = 0; i < body.stationBeanList.length; i++) {
     		var dataEntry = body.stationBeanList[i];
     		// console.log(dataEntry);
     		
		   	var stationStatus = {
				station_id: dataEntry.id, 
				station_status: dataEntry.statusValue,
				available_bike_count: dataEntry.availableBikes,
				available_dock_count: dataEntry.availableDocks,
				type_of_data: "New",
				station_summary_id: Math.round(unixTimeStamp/1000),
				last_communication_time: new Date(dataEntry.lastCommunicationTime).getTime(),
				created_at: unixTimeStamp
			};

			allStationStatuses.push(stationStatus);
			stationStatus = null;

			var stationDetails = {
  				station_id: dataEntry.id,
  				latitude: dataEntry.latitude,
  				longitude: dataEntry.longitude,
  				station_label: dataEntry.stationName,
  				created_at: unixTimeStamp
  			};

  			allStationDetails.push(stationDetails);
  			stationDetails = null;
        }

        var options = {
			overwrite: false
		};

		dataSchema.stationStatusCollection.batchPut(allStationStatuses, options, function(err) {
	    	if (err) {
	        	return console.log(err);
	    	}
	    
	    	console.log("Saved stationStatuses to DB : " + unixTimeStamp);

	    	options.overwrite = true;
	    	dataSchema.stationDetailsCollection.batchPut(allStationDetails, options, function(err) {
	    		if (err) {
	        		return console.log(err);
	    		}

	    		console.log("Saved stationDetails to DB : " + unixTimeStamp);
	    	});
    	});
    });
};


var stationIndexToIdMapping = {};
function addDataFromCSV() {
    //Get the data from the files and put into the db. Do it only once.
    // var stationStatusDirpath = "./data/station_snapshots_20151129";
    var stationStatusDirpath = "./data/sample_data";
    var stationDetailsFilepath = "./data/stations_20151129.csv";

    //The stations csv has running indices for each of the stations which is used in snapshots and summaries
    var data = fs.readFileSync(stationDetailsFilepath);
    var dataAsString = data.toString();

    var linesInData = dataAsString.split(/\r\n|\n/);
    var allStationDetailsArr = [];

    //The first line is the headers. We will ignore them
    for (var index = 1; index < linesInData.length; index++) {
    	//Split on comma and build up the object
    	var line = linesInData[index];
    	var fields = line.split(',');

    	var headerLength = linesInData[0].split(',').length;
    	if (fields.length != headerLength) {
			continue;
		}

    	// console.log(fields);

    	stationIndexToIdMapping[fields[0]] = fields[1];

    	var stationDetails = {
			station_id: parseInt(fields[1]),
			latitude: parseFloat(fields[2]),
			longitude: parseFloat(fields[3]),
			station_label: fields[4],
			created_at: new Date(fields[6]).getTime()
		};

		allStationDetailsArr.push(stationDetails);
		stationDetails = null;
	}

	var options = {
		overwrite: true
	};

	dataSchema.stationDetailsCollection.batchPut(allStationDetailsArr, options, function(err) {
    	if (err) {
        	return console.log(err);
    	}
    	linesInData = null;
    	data = null;
    	fields = null;

    	console.log("Saved the station details from csv");

	    // Loop through all the files in directory
		fs.readdir( stationStatusDirpath, function( err, files ) {
	        if( err ) {
	            return console.error( "Could not list the directory.", err );
	        } 

	        options.overwrite = false; 

	        files.forEach( function( file, index ) {
	        	console.log("##### Now serving file: " + file + " #####");
	        	var allStationStatusesArr = [];
	            // Make one pass and make the file complete
	            var filePath = path.join( stationStatusDirpath, file );

	            var data1 = fs.readFileSync(filePath);
	            var dataAsString1 = data1.toString();

	            var linesInData1 = dataAsString1.split(/\r\n|\n/);

	            var headerLength1 = linesInData1[0].split(',').length;

	            //The first line is the headers. We will ignore them
	            for (var ind1 = 1; ind1 < linesInData1.length; ind1++) {
	            	//Split on comma and build up the object
	            	fields = null;
	            	var line1 = linesInData1[ind1];
	            	var fields = line1.split(',');
	              	if (fields.length != headerLength1) {
						continue;
					}

	            	// console.log(fields);
	            	// console.log("--------------------------");
	            	// console.log(parseInt(stationIndexToIdMapping[fields[1]]));
	            	var actual_station_id = parseInt(stationIndexToIdMapping[fields[1]]);
	            	if (actual_station_id == NaN) {
	            		console.log("continuing");
	            		continue;
	            	}
	            	var stationStatus = {
						station_id: actual_station_id, 
						station_status: fields[2],
						available_bike_count: parseInt(fields[3]),
						available_dock_count: parseInt(fields[4]),
						type_of_data: "Old",
						station_summary_id: parseInt(fields[6]),
						last_communication_time: new Date(fields[5]).getTime(),
						created_at: new Date(fields[5]).getTime()
					};

					allStationStatusesArr.push(stationStatus);
					stationStatus = null;
	            }


	            // console.log("Index: " + index + " arr: " + allStationStatusesArr);
	            dataSchema.stationStatusCollection.batchPut(allStationStatusesArr, options, function(err) {
			    	if (err) {
			        	return console.log(err);
			    	}

			    	console.log("saved to db, file " + index);
			    });
	        });
		});
	});
}



function startDataCollection() {
	// addDataFromCSV();
	collectData();
	setInterval(collectData, 600000);
}



module.exports = { startDataCollection: startDataCollection };
    

//------------Sample result from citibike json------------
// id: 72,
// stationName: "W 52 St & 11 Ave",
// availableDocks: 37,
// totalDocks: 39,
// latitude: 40.76727216,
// longitude: -73.99392888,
// statusValue: "In Service",
// statusKey: 1,
// availableBikes: 0,
// stAddress1: "W 52 St & 11 Ave",
// stAddress2: "",
// city: "",
// postalCode: "",
// location: "",
// altitude: "",
// testStation: false,
// lastCommunicationTime: "2015-12-05 01:43:10 PM",
// landMark: ""