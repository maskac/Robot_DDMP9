
# Projektová dokumentace

## Základy
### Hardware
+ Raspberry PI3
+ Raspberry cam2
+ Arduino Mega2560
+ Arduino Shield dual L297D
+ 2x servo motors
+ 4x motor with transmission 
+ GPS module RS232
+ DS18B20 temperature digital sensor
+ ESP8622 - Wi-Fi connection
+ 4 channel relay board
+ LM2596 switching power supply
+ 2x L293D + servo control
+ 4x 1mW laser pointer
+ 4x red LED diod

## Příjmání příkazů
Robot bude řízen přes aplikaci RoboRemo (zdarma ke stáhnutí na [Google Play](https://play.google.com/store/apps/details?id=com.hardcodedjoy.roboremofree&hl=cs"Aplikace RoboRemo")). Příkazy bude příjmat ESP8622 a přepošle je Arduinu Mega2560, které pomocí L293D ovládá motory a motory pro otáčení přední kamery.

## Odesílání informací
Informace bude odesílat přímo Raspberry Pi3 pomocí svého zabudovaného Wi-Fi připojení. A to obraz snímaný kamerou plus informace (GPS, teplota, rychlost, stav baterie) na určenou webovou stránku.

## Autonomita
V případě ztráty signálu si robot načte z černé skřínky poslední přijatý příkaz a provede opačnou operaci. Toto opakuje dokud znovu nezachytí signál.
K měření vzdálenosti od objektu použijeme dvě 1mW laserová ukazovátka cca 5 cm od sebe. Robot bude mít uložené jak daleko jsou od sebe "tečky" při vzdálenosti 25 cm od robota, pokud budou dál od sebe tak zastaví. Toto bude i vzadu.
V případě že robot se bude muset pohybovat v tmavém prostředí, tak pro upozornění na robota použijeme 4 červené LED diody (v každém rohu jedna).

## Černá skřínka
Každý příchozí příkaz se zašifruje pomocí metody asymetrického šifrování. Data se budou ukládat na SD kartu.
