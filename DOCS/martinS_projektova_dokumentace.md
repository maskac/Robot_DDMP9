#R.O.B.E.S.E.K 1.0 Project Documentation

##Robot Hardware
###Design

The robot has a rectangular shape. It consists of a steel base  *40 * 20 * 20* large.
Movement is created by 4 wheels, each with its own electric motor with transmission.
The whole robot is powered by a 12V lead-acid battery.

###Electronics

The robot has 3 CPUs.

####Raspberry Pi 3

####ESP8266

####Arduino Mega 2560

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

Temperature of key components (battery, raspberry, arduino, motors) as well as external temperature is measured by a bunch of ds18b20 temperature sensors connected to the Raspbery. External and Battery temperatures only are displayed in the stream. Temperatures of the other measured areas are only displayed if they reach a potentialy dangerous temperatures (above 70°C) along with a warning.

###Battery Status

Battery status is measured by a digital voltmeter connected to the Raspberry. It is then transmitted along with the other data. If the voltage is dangerously low (11.5V), a warning is sent along with it.

###Acceleration

Acceleration is measured with an accelerometer such as the *ADXL3*. It is transmitted with the other data. If a high acceleration is detected (the robot falling from a big height), a "Goodbye" is sent along with the data, since the robot is unlikely to survive.

##Collision Prevention

Distance to objects is measured at all times with 2 laser distance meters connected to the raspberry, placed near the top of the robot (to allow for grass operation). If an object is detected (the distance is becomming shorter), the robot starts lowering its speed until it comes to a complete stop 5 cm away from the object.This can be overriden by a button in the remote cotrol i case the robot is wanted to ram something (or someone) (or driving in high grass)

Later, this will be replaced by a Kinect, that will allow for further functionallities

##Lights

In order to be seen, and to see, the robot will be equipped with 4 high power white narrow lighting field LEDs, two in the front, two in the back of the robot. For additional visibility, the robot shall be equipped with 2 blue and 2 red LEDs (**R**ed for **R**ight, b**L**ue for **L**eft) placed each in a top corner of the robot.

##Black Box

##In case of losing control signal
~~Use a small ammount of explosives to deliver at least a part of the robot to the last known position, where it had control signal.~~
-not very economical



TODO:HW (DESIGN, ELECTRONICS) , INT COMM, REMOT COMM, ~~VIDEO~~, TELLEMETRY (LOC, TEMP,  ~~BATT ~~, ACC), ~~ANTICOLLISION~~, ~~LIGHTS~~, BLACKBOX, FAILSAFE
