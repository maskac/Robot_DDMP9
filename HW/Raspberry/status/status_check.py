#!/usr/bin/python3
#This script assumes that everything being checked for is already set up (if it isn't the LED won't light up)
ok = False
import os
import glob
import time
import RPi.GPIO as GPIO
ledPin = 11
GPIO.setmode(GPIO.BOARD)
GPIO.setup(ledPin, GPIO.OUT)

#add support of the ds18b20s
os.system('modprobe w1-gpio')
os.system('modprobe w1-therm')
#a list of directories in which the script shall look for the temperature sensors
dirList = ['/sys/bus/w1/devices/28-xxxx', '/sys/bus/w1/devices/28-xxxx', '/sys/bus/w1/devices/28-xxxx', '/sys/bus/w1/devices/28-xxxx']  #every "xxxx" will have to be replaced


def checkTempSensors():
    for dir in dirList:
        if not os.path.isdir(dir):
            return False
    return True


while True:
    ok=True
    if checkTempSensors() == False:
        ok = False
    
    if ok == True:
        GPIO.output(ledPin,GPIO.HIGH)
    else:
        GPIO.output(ledPin,GPIO.LOW)
    
    time.sleep(10)