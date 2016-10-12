# Projekt R.O.B.E.Š.E.K
## HARDWARE

## DÁLKOVÉ OVLÁDÁNÍ
Robot je ovládán z tabletu nebo z mobilu prostřednictvím aplikace [RoboRemo](https://play.google.com/store/apps/details?id=com.hardcodedjoy.roboremo "RoboRemo na Google play") , jejíž příkazy přijímá wi-fi modem **ESP8266**, který je přes **RS232** kabel posílá **Arduinu MEGA 2560**, který je vykoná a přepošle přes **RS232 - USB konvertor** **Raspberry pi 3**.

## REPORTOVÁNÍ STAVU
Robot bude reportovat svůj stav přes web spolu s přenosem obrazu z kamer. Náléhavější věci jako například nízký stav baterie bude reportovat rovnou do řídícího tabletu přes aplikaci RoboRemo.

## OSVĚTLENÍ A OZVUČENÍ

## OCHRANA PROTI POŠKOZENÍ
Pokud dojde k přerušení napájení, **Arduino MEGA 2560** zastaví motory a zapne je až ve chvíli, kdy bude **Raspberry pi 3** nastartované.
Pokud **LIDAR** vpředu (při couvání to bude **LIDAR** vzadu) zaznamená, že je blízko nějaký objekt, robot zastaví motory aby nedošlo ke srážce a robot dovolí jen jízdu na opačnou stranu nebo otočení.
**LIDARY** budou také měřit vzdálenost objektů vlevo a vpravo, aby robot nevjel do místa, kam se na šířku nevejde.
Pokud robot zaznamená příliš velký náklon, také zastaví motory, ale dovolí jen jízdu zpět (opatření proti pádu ze schodů).
Pokud robot zaznamená příliš vysokou teplotu zastaví motory, aby nedošlo k přehřátí.
Při každé z této situací vyšle robot do řídícího tabletu varování.

## ČERNÁ SKŘÍŇKA
### Zabezpečení
Data v černé skříňce budou zabezpečena proti falšování metodou asymetrického šifrování. Data bude zaznamenávat **Raspberry Pi 3** na svojí SD kartu

### Struktura
Zápis do černé skříňky se provede, když přijde příkaz z ovládacího tabletu nebo když dojde k události jako je ztráta nebo najití ovládacího signálu**,** ztráta nebo najití GPS (v případě ztráty GPS se zaznamená GPS souřadnice z posledního místa s GPS signálem)**,** zaznamenání překážky ve směru jízdy**,** nízký stav baterie**,** zaznamenání vysoké teploty **nebo** příliš vysokého stoupání nebo klesání.
Zápis bude obsahovat: typ události (buď přijetí příkazu nebo zaznamenání události)**,** příkaz nebo událost**,** čas a datum**,** vnější teplotu**,** GPS poloha**,** rychost**,** stav baterie **a** stoupání nebo klesání.

## ZTRÁTA SIGNÁLU
Při ztrátě signálu bude robot postupovat přesně opečně podle příkazů uložených v Černé skříňce. Pokud dojde k velkému naklonění robot se pokusí jet na opačnou stranu, a pokud se naklonění nezmenší zůstane robot na místě (toto zabezpečení je proti pádu ze schodů).Systémy na ochranu proti poškození budou fungovati jako normálně. Po celou dobu vracení se na místo bude zapnuto výstražné blikání.
