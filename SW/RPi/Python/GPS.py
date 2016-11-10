def GPS():
  ser = serial.Serial('/dev/ttyAMA0', 19200, timeout=0) // definování portu
  s = ser.read(1000) // přečtení věty
  souradnice = s.split(",") // uložení věty do pole
  return souradnice
