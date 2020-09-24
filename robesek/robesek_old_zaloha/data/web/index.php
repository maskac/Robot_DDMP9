<?php
$fd = dio_open('/dev/ttyS0', O_WRONLY | O_NOCTTY | O_NONBLOCK);
dio_write($fd,$_GET["pass"]);
dio_close($fd);
?>
