import CPUtemp
import GPS
import adxl345
import log_RSSI
import teplotaDS
from datetime import datetime

log_file = "log.txt"

def log():
  log_string = ""
  
  date = str(datetime.now()).replace(" ", ",").split(".")[0]
  gps_p = GPS.souradnice()
  gps = gps_p[0] + gps_p[1] + "," + gps_p[2] + gps_p[3]
  gps_nm = str(GPS.nad_morska_vyska())
  gps_ps = str(GPS.pocet_satelitu())
  gps_kvalita = str(GPS.kvalita_signalu_GPS())
  cpu_t = str(CPUtemp.getCPUtemperature())
  temp = teplotaDS.getDCtemp()
  dc_t = str(temp[0]) + "," + temp[1]
  rssi = str(log_RSSI.get_RSSI())
  adxl = adxl345.ADXL345().getAxes()
  acc = str(adxl["x"]) + "," + str(adxl["y"]) + "," + str(adxl["z"])
[M H5  
  #writer = open(log_file,"a")
  #writer.write(log_string)
  #writer.close()
  return log_string

if (__name__=="__main__"):
  print(log())
