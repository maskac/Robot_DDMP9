#!/bin/bash

#variables setup
instl="0"		#created and nullled a variable that tells wherther install mode is on or not
bld="0"			#created and nullled a variable that tells wherther build mode is on or not
arguments=( "$@" )	#gets all the arguments givven to the script, puts them into an array called "arguments"
pithonBuildList=["status/status_check.py"] #a list of the locations of all the stuff that is to be built, for the RPi, written in python3 (the "i" is intentional) 
piBootList=["status/status_check.py"] #a list of the locations of all the stuff that is to be executed on boot on the Pi.
arduinoFlash="" #here the main arduino sketch's location is stored.

#a function that checks if a text is an element of the arguments array
containsArgument () {
    local arg="$1"
    if [[ " ${arguments[@]} " =~ " $arg " ]]; then
        return 0
    else
        return 1
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
    local arg="$1"
    for script in "${pithonBuildList[@]}"			#Get all the stuff that is to be built
do
echo "Building $script"
if bootListContains $script  ; then		
    echo "building and installing $script now"
	if [ "$(id -u)" != "0" ]; then				#if a package is missing and script is not run as root
	    echo "You are not root. Please run this script with "sudo" in front of it"
	    exit 1
    fi
    apt-get update && apt-get -y install $i
fi
done
}




if containsArgument "--install" || containsArgument "-i" ; then		#checks for "install" in the array using the containsArgument function.
    inst=True
elif containsArgument "--build" || containsArgument "-b" ; then
    bld=True
elif containsArgument "--all" || containsArgument "-a" ; then
    bld=True
	inst=True
	#TODO: add checking for "all", "arduino", "raspberry", "status_check"
else
    echo "Incorrect syntax, correct syntax is ..."	#If no argument is passed, display correct syntax and exit
    exit 1
fi


#checks for required packages and installs them if they are missing
required=(python3 arduino arduino-core)				#required packages are stored in the "requiered" array
echo "Checking for prerequisites"
for i in "${required[@]}"			#start checking
do
echo "Checking for $i"
if [ $(dpkg-query -W -f='${Status}' $i 2>/dev/null | grep -c "ok installed") -eq 0 ]; then		#asks dpkg wherther the package is install
    echo "$i is not installed, attempting to install it now"
	if [ "$(id -u)" != "0" ]; then				#if a package is missing and script is not run as root
	    echo "You are not root. Please run this script with "sudo" in front of it"
	    exit 1
    fi
    apt-get update && apt-get -y install $i
fi
done
echo "done checking dependencies"
if [ instl = True ]; then
		installAll()



exit 0
