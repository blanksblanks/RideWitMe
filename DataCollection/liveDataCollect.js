"use strict";

var request = require('request');

var liveCollectData = function(connection) {
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

        var query = 'INSERT INTO station_status(station_id,status,' + 
            'available_bike_count,available_dock_count,created_at,station_summary_id) ' +
            'values ';

        var dataLen = body.stationBeanList.length;
        for (var i = 0; i < dataLen; i++) {
            var dataEntry = body.stationBeanList[i];
            // console.log(dataEntry);

            var newDate = new Date(dataEntry.lastCommunicationTime);

            var currValue = '(' + dataEntry.id + ',"' + dataEntry.statusValue 
                + '",' + dataEntry.availableBikes + ',' + dataEntry.availableDocks 
                + ',\'' + dataEntry.lastCommunicationTime + '\',' 
                + newDate.getTime() + ')';

            query = query + currValue;
            if (i < dataLen - 1) {
                query = query + ",";
            }
        }

        console.log(query);

        connection.query(query, function(err, rows, fields) {
        
        if (!err)
            console.log('The solution is: ', rows);
        else
            console.log('Error while performing Query.', err);
        });
    });
}

function startLiveDataCollection(connection) {
    setInterval(liveCollectData(connection), 600000);
}

module.exports = { startLiveDataCollection: startLiveDataCollection };
    

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