import os

def getCPUtemperature():
    res = os.popen('vcgencmd measure_temp').readline()
    return(float(res.replace("temp=","").replace("'C\n","")))

if (__name__=="__main__"):
  print(getCPUtemperature())
