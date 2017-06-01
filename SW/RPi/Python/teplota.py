def getCPUtemperature():
    #Najit teplotu, return jenom float v °C
    res = os.popen('vcgencmd measure_temp').readline()
    return(res.replace("temp=","").replace("'C\n",""))
