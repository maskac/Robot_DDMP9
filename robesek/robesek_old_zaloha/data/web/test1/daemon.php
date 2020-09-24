<?php
require("functions.php");
require("settings.php");


if(count(getopt("h::"))>0) {
    echo "Parameters are:\n";
    echo "-h Help\n";
    echo "(no parameters) Run daemon\n";
    die();
}

echo "Starting daemon\n";

//init Tasker
shell_exec($arduino_init);
/*while(true) {
    //check for arduino response - propably dio?
    sleep(1);
}*/

?>