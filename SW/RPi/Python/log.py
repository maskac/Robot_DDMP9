import CPUtemp
import GPS
import adxl345
import log_RSSI
import teplotaDS
from datetime import datetime

# Soubor pro ukládání logování
log_file = "log.txt"

log_str = ""

#Formát zápisu: (datum a čas),(GPS souřadnice),(nadmořská výška),(počet satelitů),(kvalita signálu GPS),(CPU teplota),(teplota DS),(DS crc),(RSSI),(akcelerometr x),(akcelerometr y),(akcelerometr z) 
log_string += str(datetime.now()) + ","
gps_p = GPS.souradnice()
log_string += gps_p[0] + gps_p[1] + " " + gps_p[2] + gps_p[3] "," #Například: 50N 15E
log_string += GPS.nad_morska_vyska() + ","
log_string += GPS.pocet_satelitu() + ","
log_string += GPS.kvalita_signalu_GPS() + "," # 0 = není signál, 1 = připojeno k GPS, 2 = differenciálně připojeno k GPS
log_string += str(CPUtemp.getCPUtemperature()) + ","
temp = teplotaDS.getDCtemp()
log_string += str(temp[0]) + "," + temp[1] + ","
log_string += str(log_RSSI.get_RSSI()) + ","
adxl = adxl345.ADXL345().getAxes()
log_string += str(adxl["x"]) + "," + str(adxl["y"]) + "," + str(adxl["z"])

with open(file,"a") as writer:
  writer.write(log_string)
