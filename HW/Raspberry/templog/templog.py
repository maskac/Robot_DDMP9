#!/usr/bin/python3

import os
import glob
import time

temp = 0 
crc = 0


os.system('modprobe w1-gpio')
os.system('modprobe w1-therm')
 
base_dir = '/sys/bus/w1/devices/'
deviceFolders = [glob.glob(base_dir + '28-xxx'), glob.glob(base_dir + '28-xxxx'), glob.glob(base_dir + '28-xxxxx')]
device_file = device_folder + '/w1_slave'

def read_temp_raw():
    f = open(device_file, 'r')
    lines = f.readlines()
    f.close()
    return lines

def logTempo():
    lines = read_temp_raw()
    equals_pos = lines[1].find('t=')
    if equals_pos != -1:
        temp_string = lines[1][equals_pos+2:]
        temp_c = float(temp_string) / 1000.0
        temp_f = temp_c * 9.0 / 5.0 + 32.0
        return temp_c, temp_f

def getVars():
    lines = read_temp_raw()
    equals_pos = lines[1].find('t=')
    if equals_pos != -1:
        temp_string = lines[1][equals_pos+2:]
        temp = float(temp_string) / 1000.0
        
        equals_pos = lines[1].find('crc=')
    if equals_pos != -1:
        temp_string = lines[1][equals_pos+2:]
        crc = float(temp_string) / 1000.0
        
        unixtime = int(time.time())
        date = 1
        time = 2


def logTemp():
    getVars






while True:
    logTemp()
    time.sleep(1)
