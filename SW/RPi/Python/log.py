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
server_IP = "192.168.212.57"
server_port = 1883
client_ID = "RaspPi"
topic_gps_sou = "/GPS/sour"
topic_gps_nm = "/GPS/nadm"
topic_gps_ps = "/GPS/ps"
topic_gps_kval = "/GPS/sour"
topic_temp_cpu = "/temp/CPU"
topic_temp_ds = "/temp/DS"
topic_ina_bv = "/ina219/bv/V"
topic_ina_bc = "/ina219/bc/mA"
topic_ina_p = "/ina219/p/mW"
topic_ina_sv = "/ina219/sv/mV"
topic_rssi = "/rssi"
topic_acc_x = "/acc/x"
topic_acc_y = "/acc/y"
topic_acc_z = "/acc/z"

#Log soubor format: datum,souradnice,nadmorska_vyska,pocet_sat_GPS, kvalita_sig_GPS,teplota_cpu,napeti,proud,vykon,shunt_voltage,teplote_senzoru_DS,rssi,akcelerometr


def log_all():
  #Nacteme vsechny informace
  sour = gps_sou()
  nm = gps_nm()
  ps = gps_ps()
  kval = gps_kval()
  cpu = temp_cpu()
  ina = ina219.read()
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
         (topic_ina_bv, str(round(ina[0], 2)), 0, False),
         (topic_ina_bc, str(round(ina[1], 1)), 0, False),
         (topic_ina_p, str(round(ina[2], 1)), 0, False),
         (topic_ina_sv, str(round(ina[3], 1)), 0, False),
         (topic_rssi, rssi, 0, False),
         (topic_acc_x, str(accel["x"]), 0, False),
         (topic_acc_y, str(accel["y"]), 0, False),
         (topic_acc_z, str(accel["z"]), 0, False)]

  iot.multiple(msgs, server_IP, server_port, client_ID)

  log_string = date() + "," + sour + "," + nm + "," + ps + "," + kval + "," + cpu + "," + str(ina[0]) + "," + str(ina[1]) + "," + str(ina[2]) + "," + str(ina[3]) + "," + ds + "," + rssi + "," + str_accel

  #Pro otestovani
  print(log_string)

  writer = open(log_file,"a")
  writer.write(log_string)
  writer.close()

def log_fast():
  accel = acc()
  str_accel= str(accel["x"]) + "," + str(accel["y"]) + "," + str(accel["z"])
  ina = ina219.read()

  #Pro otestovani:
  print(str(ina[0]) + "," + str(ina[1]) + "," + str(ina[2]) + "," + str(ina[3]) + "," + str_accel)

  msgs = [(topic_ina_bv, str(round(ina[0], 2)), 0, False),
         (topic_ina_bc, str(round(ina[1], 1)), 0, False),
         (topic_ina_p, str(round(ina[2], 1)), 0, False),
         (topic_ina_sv, str(round(ina[3], 1)), 0, False),
         (topic_acc_x, str(accel["x"]), 0, False),
         (topic_acc_y, str(accel["y"]), 0, False),
         (topic_acc_z, str(accel["z"]), 0, False)]

  #Vytvorit pole zprav aby se daly odeslat naraz
  iot.multiple(msgs, server_IP, server_port, client_ID)

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
  log_fast()
  log_all()
  log_fast()
