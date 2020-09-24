if (__name__=="__main__"):
  import serial
  ser = serial.Serial("/dev/ttyUSB", 19200, timeout=0)
  s = ser.read(1000000)
  print (s)
