import sys
import os.path

def main():
	csv_file = str(sys.argv[1])
	# f = open(csv_file, "r")

	# Create subdirectory for split files
	filename = os.path.splitext(csv_file)[0]
	if not os.path.exists(filename):
		os.makedirs(filename)

	N = 5000
	counter = 0

	with open(csv_file, 'r') as infile:
	    first_line = infile.readline()
	    lines = []
	    for line in infile:
	        lines.append(line)
	        if len(lines) > N:
				counter = process(lines, first_line, counter, filename)
				lines = []
	    if len(lines) > 0:
	        process(lines)

def process(lines, first_line, counter, filename):
	write_file = '{}/{}_{}.csv'.format(filename, filename, counter)
	print write_file
	output = open(write_file, 'w')
	output.write(first_line)
	for line in lines:
		output.write(line)
	return counter + 1

if __name__ == "__main__":
    main()
