#!/bin/bash
i=1
clear
tput setaf 6
while true
do
i=`top -bn1 | awk '{print $9}' | tail -n +8 | awk '{s+=$1} END {print s}'`
#i=`expr $RANDOM % 100 + 1`
clear
e="Processor usage = "$i"%"
echo $e
sleep 1
done