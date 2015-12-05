csv_file = 'station_snapshots_20151129.csv'
f = open(csv_file, "r");

Lines = f.readlines()

i = 0
counter = 0;
firstLine = Lines[0]

for i in range(len(Lines)):
	with open('filename{}.txt'.format(counter), 'w') as output:
		output.write(firstLine);
		output.write(Lines[i + 500])
		counter = counter  + 1
