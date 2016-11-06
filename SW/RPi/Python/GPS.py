def GPS():
  ser = serial.Serial('/dev/ttyAMA0', 19200, timeout=0)
  s = ser.read(100)
  souradnice = s.split(",")
  return souradnice
