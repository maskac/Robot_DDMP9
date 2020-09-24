import serial
# funkce pro prevedeni vety z GPS modulu do pole
def GPS():
# navazani spojeni s GPS modulem
  ser = serial.Serial(port='/dev/ttyS0', baudrate=9600, parity=serial.PARITY_NONE, stopbits=serial.STOPBITS_ONE, bytesize=serial.EIGHTBITS, timeout=5 )#'/dev/ttyS0', 9600, timeout=1
# precteni informaci z GPS modulu
  s = ser.read(1000) 
# precteni informace znova pokud neobsahuje spravnou vetu
  while (s.find("GPGGA", 0, len(s)) == -1):
    try:
        s = ser.read(1000)
    except SerialException as e:
        print(e)
# returnuti vety
  souradnice = s.split("GPGGA")[1].split(",")
  return souradnice 

# funkce pro vypsani souradnic v poli: [0] zemepisna sirka, [1] N = sever/S = jih, [2] zemepisna delka, [3] W = zapad/E = vychod
def souradnice():
  veta = GPS()
  sour = [veta[2], veta[3], veta[4], veta[5]]
  return sour 
  
# funkce pro vypsani nadmorske vysce v metrech
def nad_morska_vyska():
  veta = GPS() 
  if (veta[10] == "M"):
    mnm = veta[9]
    return mnm  

# funkce pro zjisteni kvality signalu: 0 = neni mozno urcit pozici, 1 = pozice urcena, 2 = pozice urcena diferencialne
def kvalita_signalu_GPS():
  veta = GPS()
  kval = veta[6]
  return kval

# funkce pro vypsani poctu satelitu 0 - 12
def pocet_satelitu():
  veta = GPS()
  satel = veta[7]
  return satel

# vypsani hodnot pri testovani
if (__name__=="__main__"):
  print(souradnice())
  print(nad_morska_vyska())
  print(kvalita_signalu_GPS())
  print(pocet_satelitu())
