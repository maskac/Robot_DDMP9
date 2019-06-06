<?php

require("settings.php");

//output ajax
function doOutput($content,$is_error) {
    if($is_error===true) file_put_contents($php_log, $content);
    echo $content;
    die();
}

/*
---------------------------------------------------------------------------
------------------------------DAEMON STUFF---------------------------------
---------------------------------------------------------------------------
*/

// pass command to Arduino
function arduinoForwarder($command) {     
    global $arduino_serial;
    $r = "echo " . $command . " > " . $arduino_serial;
    try {
        shell_exec($r);
        shell_exec("echo pokus > txt.log");
        return $r;
    } catch (Exception $e) {
        return false;
    }
}

?>
