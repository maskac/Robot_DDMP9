#!/bin/bash

#use chmod +x setup_display.sh first, or this script might not execute

#run this script as root, or it won't work
if [ "$(id -u)" != "0" ]; then
	echo "You are not root. Please run this script with "sudo" in front of it"
	exit 1
fi
echo
read -p "Warning! This script will reboot your Raspberry wen it's done. Do you want to continue? (y/n)" -n 1 -r
echo    # (optional) move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
  echo Please wait, this WILL take a while. A long while. May be up to 20 minutes.
  echo Go get a coffee
  sleep 5
  curl -SLs https://apt.adafruit.com/add-pin | bash
  echo 10%
  apt-get -y install raspberrypi-bootloader
  echo 50%
  apt-get -y install adafruit-pitft-helper
  echo 90%
  adafruit-pitft-helper -t 22
  echo 100%
  echo done
  read -rsp $'Rebooting now, press any key to continue...' -n1 key
  reboot
fi

