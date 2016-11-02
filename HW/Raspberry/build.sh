#!/bin/bash

#variables setup
instl=False             #created and nullled a variable that tells wherther install mode is on or not
bld=False                       #created and nullled a variable that tells wherther build mode is on or not
arguments=( "$@" )      #gets all the arguments givven to the script, puts them into an array called "arguments"
pithonBuildList=("status/status_check.py" "templog/templog.py") #a list of the locations of all the stuff that is to be built, for the RPi, written in python3 (the "i" is intentional)
piBootList=("status/status_check.py" "templog/templog.py") #a list of the locations of all the stuff that is to be executed on boot on the Pi.
arduinoFlash=("") #here the main arduino sketch's location is stored.
required=(python3 arduino arduino-core build-essential manpages-dev python-setuptools python-pip)                            #required packages are stored in the "requiered" array

#a function that checks if a text is an element of the arguments array
containsArgument () {
    local arg="$1"
    if [[ " ${arguments[@]} " =~ " $arg " ]]; then
        return 0
    else
        return 1
    fi
}

checkRoot () {                          #check if the script is run as root
    if [ "$(id -u)" != "0" ]; then
            echo "You are not root. Please run this script with "sudo" in front of it"
            exit 1
    fi
}

bootListContains () {
    local script="$1"
    if [[ " ${piBootList[@]} " =~ " $script " ]]; then
        return 0
    else
        return 1
    fi
}

installAll () {
        preDir="$(pwd)"
        for script in "${pithonBuildList[@]}"                   #Get all the stuff that is to be built
                do
                                        local scriptLoc="/home/pi/robesek/${script}"
                                        local initdFile="$(basename $script)"
                                        local scriptDir="$(dirname $scriptLoc)"
                                        local dir="$(dirname $script)"
                                        rm -rf $scriptLoc
                                        cp -R $dir /home/pi/robesek/
                                        echo "Building $script"
                                        cd $scriptDir
                                        pyinstaller -F $scriptLoc
                                        ls | grep -v dist | xargs rm -rf
                                        cp dist/* .
                                        rm -rf dist
                                        cd $preDir
                                        if bootListContains $script  ; then
                                                echo "Installing $script now"
                                                checkRoot

                                                echo '#! /bin/sh
# /etc/init.d/noip
### BEGIN INIT INFO' > $initdFile
                                                echo "# Provides: $dir " >> $initdFile
                                                echo '#Required-Start: $remote_fs $syslog
# Required-Stop: $remote_fs $syslog
# Default-Start: 2 3 4 5
# Default-Stop: 0 1 6 ' >> $initdFile
                                                echo "#Short-Description: A script that runs $script at boot
# Description: A script that runs $script at boot and stop it at shutdown
### END INIT INFO " >> $initdFile
                                                echo 'case "$1" in
  start)' >> $initdFile
                                                echo "    $scriptloc" >> $initdFile
                                                echo '    ;;
  stop)' >> $initdFile
                                                echo "    killall $dir" >> $initdFile
                                                echo '    ;;
  *)
    echo "Usage: /etc/init.d/whatever {start|stop}"
    exit 1
    ;; esac
exit 0' >> $initdFile
                                                chmod 755 /etc/init.d/${initdFile}
                                                update-rc.d $initdFile defaults
                                                echo "$script now starts at boot!"
                                        fi
                                done
}




if containsArgument "--install" || containsArgument "-i" ; then     #checks for "install" in the array using the containsArgument function.
    instl=True
elif containsArgument "--build" || containsArgument "-b" ; then
    bld=True
elif containsArgument "--all" || containsArgument "-a" ; then
	bld=True
	instl=True
		#TODO: add checking for "all", "arduino", "raspberry", "status_check"
else
	echo "Incorrect syntax, correct syntax is ..."      #If no argument is passed, display correct syntax and exit
	exit 1
fi


#checks for required packages and installs them if they are missing
echo "Checking for prerequisites"
for i in "${required[@]}"                       #start checking
do
echo "Checking for $i"
if [ $(dpkg-query -W -f='${Status}' $i 2>/dev/null | grep -c "ok installed") -eq 0 ]; then           #asks dpkg wherther the package is install
    echo "$i is not installed, attempting to install it now"
        checkRoot                       #if a package is missing and script is not run as root
    apt-get update && apt-get -y install $i
fi
done
pip install pyinstaller
echo "done checking dependencies"

if [ $instl = True ] ; then
    echo "now installing scripts"
    mkdir /home/pi/robesek
        installAll

fi
exit 0
