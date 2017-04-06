from threading import Timer
import log

# Kazdych 5 sekund zavola log_all z log.py
def log_all():
  Timer(5, log_all, ()).start()
  log.log_all()

# Kazdou sekundu zavola log_fast z log.py
def log_fast():
  Timer(1, log_fast, ()).start()
  log.log_fast()

#Nastartuje cyklus
log_all()
Timer(1, log_fast, ()).start()
