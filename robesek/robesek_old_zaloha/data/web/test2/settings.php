<?php

/* Logs */
$pass_09=true; // pass 09 responses to log
$blackbox_log="../logs/blackbox.log"; // arduino blackbox //projde to nahoru ??
$user_log="../logs/user.log"; // arduino blackbox in human-readable form, plus 09 responses if "pass_09" is set to true
$php_log="../logs/web.log"; // mostly errors from php

/* Arduino */
$arduino_init="stty -F /dev/ttyUSB0 cs8 115200 ignbrk -brkint -icrnl -imaxbel -opost -onlcr -isig -icanon -iexten -echo -echoe -echok -echoctl -echoke noflsh -ixon -crtscts"; // command which setup propably /dev/tty* or /dev/ttyUSB*
$arduino_serial="/dev/ttyUSB0"; // address of serial port, usually same as in the setup command

?>