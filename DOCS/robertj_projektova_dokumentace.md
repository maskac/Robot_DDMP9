# Projektová dokumentace

## Základy
### Hardware
+ Raspberry PI3
+ 2x Raspberry cam2
+ Arduino Mega2560
+ Arduino Shield dual L297D
+ 2x servo motors
+ 4x motor with transmission 
+ GPS module RS232
+ DS18B20 temperature digital sensor
+ ESP8622 - Wi-Fi connection
+ 4 channel relay board
+ LM2596 switching power supply

## Příjmání příkazů

## Odesílání informací

## Autonomita
V případě ztráty signálu si robot načte z černé skřínky poslední přijatý příkaz a provede opačnou operaci. Toto opakuje dokud znovu nezachytí signál.
K měření vzdálenosti od objektu použijeme dvě 1mW laserová ukazovátka cca 5 cm od sebe. Robot bude mít uložené jak daleko jsou od sebe "tečky" při vzdálenosti 25 cm od robota, pokud budou dál od sebe tak zastaví. Toto bude i vzadu.

## Černá skřínka
Každý příchozí příkaz se zašifruje pomocí metody asymetrického šifrování. Data se budou ukládat na SD kartu.
