# **R.O.B.E.S.E.K.**
### Robot
  Základní konstrukce je postavena z hliníku, rozměry 300x600x400mm (vxšxh). Kola jsou z gumy o ⌀200mm s osou ve dnu. *(rozměry typnuty)*
### UI a ovládání
  Uživatelské prostředí bude webová stránka. Bude obsahovat překryvné vrstvy s údaji (GPS, rychlost aj.), které budou mít nastavitelnou průhlednost. Ovládání bude volitelné, buď klávesnice nebo grafické prvky na obrazovce (dále "dotyk"): [přepínače (Checkbox Three)](https://paulund.co.uk/playground/demo/css-style-checkboxes/), šipky (DataURI image s onclick funkcí) či joystick.
### Hardware
  *(možno přidat odkazy)*  
  Již přidaný: wifi modul ESP8266, motory kol (4x), serva pro kamery a kamery (2 ka. + 2\*2 se.), 4 relé na 1 desce, tepl. čidlo DS18B20, GPS modul, baterie s pojistkou a měřičem napětí  
  Micropočítače: Raspberry Pi 3, Arduino Mega 2560  
  Předpokládaný: svítilna, ultrazvukové sensory, sensor světla, LEDky pro ochranu robota (zviditelnění), akcelerometr  
  Spojení hardwaru dle /HW/schema
### Futury
  + (všechny futury by měli mít co nejrychlejší odezvu, proto jsou uvedené technologie zpracovávání dat pouze doporučení)
  + Ovládání pohybu robota uživatelem: vpřed + vzad + otáčení *(při dotyku šipky)*, rychlost *(při dotyku* `<input type="range" style="transform: rotate(270deg);">` *nebo stupně a +/-)*, brzda (*při dotyku přepínač*, signalizace v překryvné vrstvě)
  + Přenos zvuku a obrazu ze dvou kamer k uživateli přes wifi, předpokládaný protokol WebSockets, *ovládání kamer při dotyku pomocí onscreen joysticku*
  + Přenos telemetrie (GPS, teplota, stav baterie, stav wifi aj.) k užvateli přes wifi, u údajů nutných pro přežití robota obnova po ,5 nebo 1 sekundě, u ostatních po 30 sekundách či 1 minutě, předpokládaná technologie AJAX a komprimace do JSONu, ve webu zobrazení překryvnou vrstvou
  + Možnost ovládat svítilnu, *při dotyku přepínač*
  + Režim tajnosti: vypnutí všech svítívých segmentů, *při dotyku přepínač*
  + Režim nečinnosti: zastavení motorů, blikání ochranných ledek, *při dotyku přepínač*
  + Režim krychle: snímání ultrazvukových sensorů a držení se od objektů v uživatelem dané minimální vzdálenosti, zobrazeno v překryvné vrstvě, nastavitelné po 2cm krocích, při nule vypnuto, *při dotyku +/-*
  + Sebeochranné prostředky:
    + Propojení sensoru světla s ochrannými ledkami
    + Při neaktivitě nad 1 minutu (vyjma Režimu tajnosti) -> Režim nečinnosti
    + Při ztrátě komunikace i GPS signálu návrat na místo dle zaznamenávání ujeté trasy za poslední minutu, jinak dle GPS
  + Log: zaznamenávání telemetrie a komunikace s uživatelem do souboru ve formátu `datum čas data kontrolní.součet+ochrana.proti.přepisu`