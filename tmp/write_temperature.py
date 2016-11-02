import datetime;
import time;

input_device_file = '/dev/ttyS0';
output_file = 'teplota.log';

current_datetime = datetime.datetime.now();
current_date = '[' + str(current_datetime.day) + '.' + str(current_datetime.month) + ',' + str(current_datetime.year) +']';
current_time = '[' + str(current_datetime.hour) + ':' + str(current_datetime.minute) + ':' + str(current_datetime.second) + ']';

unix_time = str(int(time.time()));

def read_temp_raw():
	f = open(input_device_file, 'r');
	lines = f.readlines();
	f.close();
	return lines;
def read_temp():
	lines = read_temp_raw();
	while lines[0].strip()[-3:] != 'YES':
		time.sleep(0.2);
		lines = read_temp_raw();
	equals_pos = lines[1].find('t=');
	if equals_pos != -1:
		temp_string = lines[1][equals_pos+2:];
		temperature = float(temp_string) / 1000.0;
		return temperature;

file = open(output_file, 'w');
file.write(', '.join(['"ROBESEK TS1"', current_date, current_time, unix_time, str(read_temp())]));
