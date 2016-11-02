# Radek Tonar
# ROBEŠEK 

## pohyb
+ pomocí 4 kol pøipojených na servomotory
+ ovládání pøes raspberry pi(1)
+ pøenos signálu po wifi z telefonu/tabletu pøes vlastní applikaci
   
## kamery
1. pøední
+ otèná kamera, ovládaná pøes raspberry pi(1)
+ obraz pøes raspberry pi(1) 
+ pøenos obrazu po wifi z mobilního telefonu 
+ obraz jako pozadí v applikaci pro ovládání pohybu
2. zadní
+ soustava malých kamer zapojených do koule zabírajících 360°
+ pøenos obrazu pøes raspberry pi(2)
+ pøenos pøes wifi do google cardboard
+ ovldá druhý èlovìk
+ zvuk pøenášen do reproduktoru telefonu èi sluchátek

##reportování stavu
1. GPS
+ tøi gps moduly 
+ na dva zadní konce a jeden pøední
+ propoèet telemetrie
+ zjištìní pøesné polohy (+-1cm)
+ pøenos pøes raspberry pi(1) do ovládací applikace
2. teplota 
+ snímána pomocí senzoru na spod vozidla
+ pøenos pøes raspberry pi(1) po wifi do ovládací applikace 
3. stav baterie
+ mìøení pøes raspberry pi(1) 
+ zobrazování na tøíèíselném segmentovém displeji na horní stranì vozidla
+ pøenos pøes raspberry pi(1) do ovládací applikace pomocí wifi
+ pokud je stav baterie menší než 20% upozornuje v applikaci     
+ pokud je stav baterie menší než 10% vypne raspberry pi(2), pøenos teploty a telemetrie, stranová a koncová svìtla
+ pokud je stav baterie menší než 5% zaène pískat
4. telemetrie
+ zjištuje pohyb ve 3 osách
+ + pøenos pøes raspberry pi(1) do ovládací applikace pomocí wifi
+ ukládá do uložištì

##zabraòování kolizí
+ ètyøi infrared senzory na každém rohu
  + pokud je vzdálenost menší než 0,5 metru hlásí opticky pomocí blikajícího svìtla v applikaceí
  + pokud je vzdálenost menší než 2 cm limituje rychlost na 0,3 km/h 

##osvìtlení
1. vpøedu
+ dvì led svìtla o výkonu 800 lumenù s vysokým uhlem rozptylu (160°) 
  + jedno svìtlo dalkové, pøipevnìné ke kameøe a spoleènì se pohybující
  + zapínání aotomaticky pomocí detektoru svìtla, nebo manualnì pøes applikaci
2. strany
+ blikající led pásky 
+ aktivované neustále
3. vzadu
+ dvì èervená svìtla trvale zapnuta

##èerná skøínka
+ externí disk pøipojen k raspberry pi(1)
  + zaznamenává teplotu, GPS polohu ze všech tøí modulù, stav baterie, pohyb ve 3 osách 
  + po vyèerpání kapacity zaèíná pøemazávat nejstarší záznamy

##ztráta signálu
+ GSM modul se SIM kartou 
  + v pøípadì ztráty signnálu applikace upozorní a zaène signály posílat pøes SMS a MMS
                                                