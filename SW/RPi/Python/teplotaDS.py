#!/usr/bin/python3

#Oh hello there,stranger.Wellcome to this lovely little script
#What does it do, you ask?
#It gets the temperature from a ds18b20 sensor, along with a crc from the sensor, the current date and time and the current unix timestamp,
#And it then stores this data to /tmp/teplota.log in CSV format like so:
#"ROBESEK TS1",date,time,unixtimestamp,temperature,crc


import os
import glob
import time

os.system('modprobe w1-gpio')
os.system('modprobe w1-therm')
 
DCbase_dir = '/sys/bus/w1/devices/'
DCdevice_folder = glob.glob(base_dir + '28*')[0]
DCdevice_file = device_folder + '/w1_slave'

def getDCtemp():
#read raw temp
    f = open(DCdevice_file, 'r')
    lines = f.readlines()
    f.close()
    return lines
    
#Get float °C
    equals_pos = lines[1].find('t=')
    if equals_pos != -1:
        temp_string = lines[1][equals_pos+2:]
        temp = float(temp_string) / 1000.0
#Get checksum (unused) and returns the float        
        equals_pos = lines[1].find('crc=')
    if equals_pos != -1:
        crc_string = lines[1][equals_pos+2:]
        #crc = float(crc_string)  -  Fakt naprd
        
    return(temp, crc_string)    

