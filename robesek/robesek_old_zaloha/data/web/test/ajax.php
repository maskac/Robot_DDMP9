<?php

require("functions.php");

// error on no action
if(!isset($_GET["action"])) {
    doOutput("PHP backend: no action specified!",true);
}

//specify what to do on which action
switch($_GET["action"]) {
    case("arduino_forward"):
        $r = arduinoForwarder($_GET["content"]);
        if($r===false) doOutput("Arduino forwarder: error",true);
        else doOutput($r);
        break;
    default: doOutput("PHP backend: no valid action specified!",true);
}
?>