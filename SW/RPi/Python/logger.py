from threading import Timer
import log
import os
import sys

shut_file = "/tmp/shutloggerpi"
pid_file = "/home/pi/test/pid"

writer = open(pid_file, 'w')
writer.write(str(os.getpid()))
writer.close()

# Kazdych 5 sekund zavola log_all z log.py
def all_loop():
  if (os.path.exists(shut_file)):
    #os.system("sudo rm " + shut_file)
    sys.exit()
  Timer(5, all_loop, ()).start()
  log.log_all()

# Kazdou sekundu zavola log_fast z log.py
def fast_loop():
  if (not os.path.exists(shut_file)):
    Timer(1, fast_loop, ()).start()
  log.log_fast()

#Nastartuje cyklus
Timer(1, fast_loop, ()).start()
all_loop()
