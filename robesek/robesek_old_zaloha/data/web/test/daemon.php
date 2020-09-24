<?php
require("functions.php");
require("settings.php");
require("tasker.php");

if(count(getopt("h::"))>0) {
    echo "Parameters are:\n";
    echo "-h Help\n";
    echo "(no parameters) Run daemon\n";
    die();
}

echo "Starting daemon\n";

//init Tasker
shell_exec($arduino_init);
while(true) {
    Tasker::doWork();
    sleep(1);
}

?>
