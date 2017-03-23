import CPUtemp
import GPS
import adxl345
import log_RSSI
import teplotaDS
import ina219
from datetime import datetime
import paho.mqtt.publish as iot

#Konstanty:
log_file = "log.txt"
server_IP = "iot.eclipse.org"
topic = "r.o.b.e.s.e.k/16-17"

#Log soubor format: datum,souradnice,nadmorska_vyska,pocet_sat_GPS, kvalita_sig_GPS,teplota_cpu,ina219,teplote_senzoru_DS,rssi,akcelerometr
#MQTT format - log_all: "all:souradnice,nadmorska_vyska,pocet_sat_GPS, kvalita_sig_GPS,teplota_cpu,ina219,teplote_senzoru_DS,rssi,akcelerometr"
#MQTT format - log_fast: "fast:akcelerometr,ina219"


def log_all():
  log_string = ""
  log_string += gps_sou() + ","
  log_string += gps_nm() + ","
  log_string += gps_ps() + ","
  log_string += gps_kval() + ","
  log_string += temp_cpu() + ","
  log_string += str(ina219.i2c()) + ","
  
  ds = temp_ds()
  if ds[1] == "": #V pripade dobreho crc ulozi teplotu
    log_string += ds[0] + ","
  else:#Kdyz ne ulozi chybu
    log_string += "DSError,"
  log_string += rssi() + ","
  accel = acc()
  log_string += str(accel["x"]) + "," + str(accel["y"]) + "," + str(accel["z"]) + ","

  iot.single(topic, "all:" + log_string, 0, False, server_IP)

  log_string = date() + log_string + "\n" #Cas na konec kdyby to slo pomalu
  
  #Pro otestovani
  print(log_string)
  
  writer = open(log_file,"a")
  writer.write(log_string)
  writer.close()

def log_fast():
  log_string = ""
  accel = acc()
  log_string += str(accel["x"]) + "," + str(accel["y"]) + "," + str(accel["z"]) + ","
  log_string += str(ina219.i2c())
  
  #Pro otestovani:
  print(log_string)
  
  iot.single(topic, "fast:" + log_string, 0, False, server_IP)

def date():
  return str(datetime.now()).replace(" ", ",").split(".")[0]

def gps_sou():
  gps_p = GPS.souradnice()
  return gps_p[0] + gps_p[1] + "," + gps_p[2] + gps_p[3]

def gps_nm():
  return str(GPS.nad_morska_vyska())

def gps_ps():
  return str(GPS.pocet_satelitu())

def gps_kval():
  return str(GPS.kvalita_signalu_GPS())

def temp_cpu():
  return str(CPUtemp.getCPUtemperature())

def temp_ds():
  return teplotaDS.getDCtemp()

def rssi():
  return str(log_RSSI.get_RSSI())

def acc():
  return adxl345.ADXL345().getAxes()

if (__name__=="__main__"):
  log_all()
