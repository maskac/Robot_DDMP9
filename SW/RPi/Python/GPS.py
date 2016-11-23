def GPS():
  ser = serial.Serial('/dev/ttyAMA0', 19200, timeout=0) // definování portu
  s = ser.read(1000) // přečtení věty
  while (s.find($GPGGA, beg=0, end=len(s)) == -1):
    s = ser.read(1000) //
  souradnice = s.split(",") // uložení věty do pole
  return souradnice // vrácení souřadnic v poli
