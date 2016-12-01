# Struktura logování
Log.py načte všechny programy (log_RSSI.py, GPS.py, a teploty). Z každého programu zavolá hlavní metodu (get_RSSI(), souradnice(), ...) a výsledky zapíše s datem do souboru.

## RSSI
+ get_RSSI() vrátí sílu signálu jako int.
+ Ostatní metody jsou pomocné.

## GPS
+ PS() slouží k získání informací - pomocná.
+ souradnice() vrací souradnice v poli ( šířka, N nebo S, délka, E nebo W )
+ nad_morska_vyska() vrací nadmořskou výšku
+ kvalita_signalu_GPS() vrací kvalitu signálu
+ pocet_satelitu() vrací pocet satelitu

## Teplota CPU
není k dispozici

## Teplota senzoru
není k dispozici
