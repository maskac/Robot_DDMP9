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
server_IP = "192.168.212.57" # Jen local nestaci
topic_gps_sou = "GPS/sour"
topic_gps_nm = "GPS/nadm"
topic_gps_ps = "GPS/ps"
topic_gps_kval = "GPS/sour"
topic_temp_cpu = "temp/CPU"
topic_temp_ds = "temp/DS"
topic_ina = "ina219"
topic_rssi = "rssi"
topic_acc = "acc"

#Log soubor format: datum,souradnice,nadmorska_vyska,pocet_sat_GPS, kvalita_sig_GPS,teplota_cpu,ina219,teplote_senzoru_DS,rssi,akcelerometr


def log_all():
  #Nacteme vsechny informace
  sour = gps_sou()
  nm = gps_nm()
  ps = gps_ps()
  kval = gps_kval()
  cpu = temp_cpu()
  ina = str(ina219.i2c())
  ds = temp_ds()
  if ds[1] == "": #V pripade dobreho crc ulozi teplotu
    ds = str(ds[0])
  else:#Kdyz ne ulozi chybu
    ds = "DSError,"
  accel = acc()
  str_accel = str(accel["x"]) + "," + str(accel["y"]) + "," + str(accel["z"]) 
  rssi = get_rssi()
  
  #Vytvorit pole zprav aby se daly odeslat naraz
  msgs = [(topic_gps_sou, sour, 0, False),
         (topic_gps_nm, nm, 0, False),
         (topic_gps_ps, ps, 0, False),
         (topic_gps_kval, kval, 0, False),
         (topic_temp_cpu, cpu, 0, False),
         (topic_temp_ds, ds, 0, False),
         (topic_ina, ina, 0, False),
         (topic_rssi, rssi, 0, False),
         (topic_acc, str_accel, 0, False)]
  
  iot.multiple(msgs, server_IP)
  
  log_string = ""
  log_string += sour + ","
  log_string += nm + ","
  log_string += ps + ","
  log_string += kval + ","
  log_string += cpu + ","
  log_string += ina + ","
  log_string += ds + ","
  log_string += rssi + ","
  log_string += str_accel + ","
  log_string = date() + log_string + "\n" #Cas na konec kdyby to slo pomalu
  
  #Pro otestovani
  print(log_string)
  
  writer = open(log_file,"a")
  writer.write(log_string)
  writer.close()

def log_fast():
  accel = acc()
  str_accel= str(accel["x"]) + "," + str(accel["y"]) + "," + str(accel["z"]) + ","
  ina = str(ina219.i2c())

  #Pro otestovani:
  print(ina + "," + str_accel)

  msgs = [(topic_ina, ina, 0, False),
         (topic_acc, str_accel, 0, False)]

  #Vytvorit pole zprav aby se daly odeslat naraz
  iot.multiple(msgs, server_IP)

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

def get_rssi():
  return str(log_RSSI.get_RSSI())

def acc():
  return adxl345.ADXL345().getAxes()

if (__name__=="__main__"):
  log_all()
