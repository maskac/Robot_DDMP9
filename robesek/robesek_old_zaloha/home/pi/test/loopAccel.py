import log as l
from threading import Timer
from time import sleep
log_file = "log.txt"
index = 0

def timed_log():
  Timer(1, timed_log, ()).start()
  #writer = open(log_file,"a")
  #writer.write(log.log())
  #writer.close()
  print l.gps_sou()

sleep(10)
timed_log()
