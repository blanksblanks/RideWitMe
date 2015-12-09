"use strict";

//Using dynamoose for AWS dynamoDB
var dynamoose = require('dynamoose');
var keys = require('./../../config/access');


dynamoose.AWS.config.update({
  accessKeyId: (process.env.awsAccessKey || keys.awsKeys.accessKey),
  secretAccessKey: (process.env.awsAccessKeySecret || keys.awsKeys.accessKeySecret),
  region: (process.env.awsRegion || 'us-east-1')
});


var stationStatusSchema = new dynamoose.Schema({
	station_id: { type: Number, required: true, hashKey: true}, 
	station_status: { type: String },
	available_bike_count: { type: Number },
	available_dock_count: { type: Number },
	type_of_data: { type: String, required: true }, //Specifies if the data is old or new
	station_summary_id: { type: Number, required: true },
	last_communication_time: { type: Number },
	created_at: { type: Number, rangeKey: true, required: true }
});

var stationDetailsSchema = new dynamoose.Schema({
	station_id: { type: Number, required: true, unique: true, hashKey: true}, 
	latitude: { type: Number, required: true },
	longitude: { type: Number, required: true },
	station_label: { type: String },
	created_at: { type: Number }
});

// var activeStationsSchema = new dynamoose.Schema({
// 	index_id: { type: Number, unique: true, required: true, hashKey: true },
// 	active_stations: { type: Number, required: true },
// 	total_stations: { type: Number, required: true },
// 	created_at: { type: String, required: true },
// 	updated_at: { type: String, required: true }
// });

var options = {
  create: true, // Create table in DB, if it does not exist
  waitForActive: true, // Wait for table to be created before trying to use it
  waitForActiveTimeout: 180000 // wait 3 minutes for table to activate
}

var stationStatusCollection = dynamoose.model('stationStatusDB', stationStatusSchema, options);
var stationDetailsCollection = dynamoose.model('stationDetailsDB', stationDetailsSchema, options);
// var activeStationsCollection = dynamoose.model('activeStationsDB', activeStationsSchema, options);

module.exports = { stationStatusCollection: stationStatusCollection, 
					stationStatusSchema: stationStatusSchema, 
					stationDetailsCollection: stationDetailsCollection, 
					stationDetailsSchema: stationDetailsSchema //, 
					// activeStationsCollection: activeStationsCollection,
					// activeStationsSchema: activeStationsSchema 
				};
