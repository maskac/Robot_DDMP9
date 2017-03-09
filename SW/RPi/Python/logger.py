from threading import Timer
import log

# Kazdych 5 sekund zavola log_all z log.py
def log_all():
  log.log_all()
  Timer(5, log_all, ()).start()

# Kazdou sekundu zavola log_fast z log.py
def log_fast():
  log.log_fast()
  Timer(1, log_fast, ()).start()

#Nastartuje cyklus
log_all()
Timer(1, log_fast, ())
