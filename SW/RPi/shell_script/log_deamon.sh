#!/bin/sh
### BEGIN INIT INFO
# Provides:          logdaemon
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Init log daemon
# Description:       Bla bla
### END INIT INFO

case "$1" in
  start)
    echo "Starting script logger.py "
    python /home/pi/test/logger.py & > /dev/null 2>&1
    echo "logger.py initalized"
    ;;
  stop)
    echo "Stopping script logger.py"
    touch /tmp/shutloggerpi
    PID=$(</home/pi/test/pid)
    while true
    do
      if ! ps -p $PID > /dev/null
      then
        break
      fi
      sleep 1
    done
    ;;
  *)
    echo "Usage: /etc/init.d/log_daemon {start|stop}"
    exit 1
    ;;
esac

exit 1

