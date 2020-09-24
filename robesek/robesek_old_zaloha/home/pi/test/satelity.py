import serial
# funkce pro zjisteni ID jednotlivych satelitu
def sat():
# navazani spojeni s GPS modulem
  ser = serial.Serial(port='/dev/ttyS0', baudrate=9600, parity=serial.PARITY_NONE, stopbits=serial.STOPBITS_ONE, by$
# precteni informaci z GPS modulu
  s = ser.read(1000)
# precteni informace znova pokud neobsahuje spravnou vetu
  while (s.find("GPGSA", 0, len(s)) == -1):
    try:
        s = ser.read(1000)
    except SerialException as e:
        print(e)
# prevedeni vety do pole
  veta = s.split("GPGSA")[1].split(",")
  satel = [veta[3], veta[4], veta[5], veta[6], veta[7], veta[8], veta[9], veta[10], veta[11], veta[12], veta[13], veta[14]]
# returnuti ID satelitu v poli 0 - 11
  return satel

# vypsani hodnot pri testovani
if (__name__=="__main__"):
  print(satel)
