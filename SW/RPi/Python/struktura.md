# Struktura logování
Log.py načte všechny programy (log_RSSI.py, GPS.py, a teploty). Z každého programu zavolá hlavní metodu (get_RSSI(), souradnice(), ...) a výsledky zapíše s datem do souboru log.txt (lze změnit).

## RSSI
+ get_RSSI() vrátí sílu signálu jako int.
+ Ostatní metody jsou pomocné.

## GPS
+ GPS() slouží k získání informací - pomocná.
+ souradnice() vrací souradnice v poli ( šířka, N nebo S, délka, E nebo W )
+ nad_morska_vyska() vrací nadmořskou výšku
+ kvalita_signalu_GPS() vrací kvalitu signálu
+ pocet_satelitu() vrací pocet satelitu

## Teplota CPU
+ getCPUtemperature() vrací teplotu jako int, v °C

## Teplota DC senzoru
+ GetDCtemp() vrací teplotu jako float v tuplu s crc jako string

## ADXL345 (akcelerometr)
+ getAxes(self,gforce=False) vrací zrychlení x, y, z jako dictionary {"x":x,"y":y,"z":z}
