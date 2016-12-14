import os

#Returns CPU temperature like int, in °C.
#Vrací teplotu CPU jako int v °C
def getCPUtemperature():
    res = os.popen('vcgencmd measure_temp').readline()
    return(int(res.replace("temp=","").replace("'C\n","")))
