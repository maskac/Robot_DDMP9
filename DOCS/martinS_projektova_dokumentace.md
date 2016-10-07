#R.O.B.E.S.E.K 1.0 Project Documentation

##Robot Hardware
###Design

The robot has a rectangular shape. It consists of a steel base  *x * y * z* large.
Movement is created by 4 wheels, each with its own electric motor with transmission.
The whole robot is powered by a 12V lead-acid battery.

###Electronics

##Remote Control

The robot is controlled remotely using an app called [RoboRemo](https://play.google.com/store/apps/details?id=com.hardcodedjoy.roboremo)
From the app, the signal is first received by an *ESP8266*

##Internal Communication

##Video feed trasmission

Video is captured by two cams. One is the [Raspberry Camera Module v2](https://www.raspberrypi.org/products/camera-module-v2/), can be rotated in two axis, is in the front of the robot. The other is a USB webcam (The Raspi can only have one raspberry camera module connected at once) ,cannot be rotated. The webcams are connected to the Raspberry Pi by the Pi's camera connector and USB, respectively. Here the videos are compressed and then displayed on a webpage hosted on the raspberry. (Transmitting to other devices that want to watch the stream is done using the Pi's onboard WiFi)

##Status Reporting

All tellemetry is reported through WiFi, separate from the video feed. It can be later overlayed over the video feed (on the webpage serving the video feed), or worked with seperately. A solution simmilar to [freeboard](https://freeboard.io/) (or freeboard itself) can later be used to transmit tellemetry to another webpage (for use on another monitor)

###Location

Location is detected using an RS232 GPS module connected to the Raspberry Pi. There it is added to the tellemetry stream. In later versions of the Robot, GPS could be used for an autonomous mode.

###Temperature

Temperature of key components (battery, raspberry, arduino, motors) as well as external temperature is measured by a bunch of ds18b20 temperature sensors. External and Battery temperatures only are displayed in the stream. Temperatures of the other measured areas are only displayed if they reach a potentialy dangerous temperatures (above 70°C) along with a warning.

###Battery Status



###Acceleration

##Collision Prevention

##Lights

##Black Box

##In case of losing control signal
~~Use a small ammount of explosives to deliver at least a part of the robot to the last known position, where it had control signal.~~
-not very economical



TODO:HW (DESIGN, ELECTRONICS) , INT COMM, REMOT COMM, ~~VIDEO~~, TELLEMETRY (LOC, TEMP, BATT, ACC), ANTICOLLISION, LIGHTS, BLACKBOX, FAILSAFE
