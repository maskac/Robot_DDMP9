#!/usr/bin/python3
#This script assumes that everything being checked for is already set up (if it isn't the LED won't light up)
ok = False
import os
import glob
import time
import RPi.GPIO as GPIO
import subprocess
import string
ledPin = 11
GPIO.setmode(GPIO.BOARD)
GPIO.setup(ledPin, GPIO.OUT)

#add support of the ds18b20s
os.system('modprobe w1-gpio')
os.system('modprobe w1-therm')
#a list of directories in which the script shall look for the temperature sensors
dirList = ['/sys/bus/w1/devices/28-xxxx', '/sys/bus/w1/devices/28-xxxx', '/sys/bus/w1/devices/28-xxxx', '/sys/bus/w1/devices/28-xxxx']  #the "xxxx"s will have to be replaced by the used ds18b20s' serial numbers


def checkTempSensors():
    for dir in dirList:
        if not os.path.isdir(dir):  #if the directory doesn't exist
            return False
    return True


while True:
    ok=True         #beginning of loop, nothing is broken now.
    if checkTempSensors() == False:         #if temp sensors are broken
        ok = False                          #everything is no longer ok
    

    #checking if mysql is running
    tmp = os.popen("ps -Af").read()         #load a list of all loading processes
    

    if "msql" not in tmp[:]:                #if mysql is not in the list
        ok = False                          #everything is no longer ok
    
    if ok == True:                          #if everything is still ok
        GPIO.output(ledPin,GPIO.HIGH)       #turn a led on
    else:                                   #else
        GPIO.output(ledPin,GPIO.LOW)        #turn the let off
    time.sleep(10)                          #sleep for 10 seconds before repeating