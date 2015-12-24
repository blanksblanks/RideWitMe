# RideWitMe
# A Team
# Data Collection Web Service
Web server to collect data from the citibike api and store it into the database.

Hosted on its own EBS instance, the data collection server queries the citibike station json endpoint (http://www.citibikenyc.com/stations/json) every 10 minutes and updates into the Amazon RDS instance configured. 

The Amazon RDS database instance contains 2 main tables - station_status and stations_details. 

station_status is the table that contains the status of each station at a particular instance of time over a period of 2 years. After every query on the citibike json endpoint, this table is updated. 

stations_details is a table that contains the location and name of each of the citibike stations located in and around New York City.

When the data is analysed to derive temporal information about the stations, new tables are created inside the RDS database. 
- station_status_lessthanfivepercent contains the count per hour of the day when the particular station had less than 5% of bikes available. This is calculated for all station ids available. This could hence serve as a good destinatin dock station but probably not a great source dock station.
- station_status_morethanninetyfivepercent contains the count per hour of the day when the particular station had more than 95% of bikes available. This could hence serve as a good source dock station but probably not a great destination dock station at times.

As new data is added to the tables and new analysis carried out on the historical data, there will be more smaller tables created which will have very less service times leading to a fast and scalable architecture.
