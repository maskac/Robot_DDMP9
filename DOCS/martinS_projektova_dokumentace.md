#R.O.B.E.S.E.K 1.0 Project Documentation

##Robot Hardware
###Design

The robot has a rectangular shape. It consists of a steel base  *40cm * 20cm * 20cm* large.
Movement is created by 4 wheels, each with its own electric motor with transmission. These motors are not steerable, steering is achieved by rotating the left wheels in one direction, and the other two right in the other direction.
The whole robot is powered by a 12V lead-acid battery. Power goes from the battery through a fuse into a LM2596. From there it is distributed to a dual L297D realy board to drive the motors, and to the rest of the electronics. There are 2 cameras on board, one of them is equipped with 2 servos, allowing 180° by 180° rotation. Also on board are 4 relay boards. To these, front and back lights are connected (see [Lights](#lights) )

###Electronics

The robot has 3 CPUs.

####Raspberry Pi 3

The raspberry receives and processes all the tellemetry data and the camera feed(s). It communicates with the Arduino over *RS232 over USB*.

####ESP8266

The ESP receives control signals over WiFi and then sends them over RS232 to the Arduino

####Arduino Mega 2560

The Arduino Receives control signals from the ESP and then processes them. If the desired action is movement or camera rotation, the Arduino sends signals to the L293Ds using digital parallel communication. If the desired action is switching the Head (or reversing) lights on, the signal is sent to the relay boards. Also connected to the arduino are the 4 colored LEDs. For info about lights, see [Lights](#lights)
#####L293D

There are 2 L293Ds on board. They are used to control the motors and camera servos.

####Kinect

Later on in the development, a kinect sensor will be added to allow for functions such as object tracking and better autonnomous mod.

##Remote Control

The robot is controlled remotely using an app called [RoboRemo](https://play.google.com/store/apps/details?id=com.hardcodedjoy.roboremo)
From the app, the signal is first received by the *ESP8266*, the signal is then processed as shown over at [Electronics](#electronics)

##Internal Communication

##Video feed trasmission

Video is captured by two cams. One is the [Raspberry Camera Module v2](https://www.raspberrypi.org/products/camera-module-v2/), can be rotated in two axis, is in the front of the robot. The other is a USB webcam, cannot be rotated. The webcams are connected to the Raspberry Pi by the Pi's camera connector and USB, respectively. There the videos are compressed and then displayed on a webpage hosted on the raspberry. (Transmitting to other devices that want to watch the stream is done using the Pi's onboard WiFi)

##Status Reporting

All tellemetry is reported through WiFi, separate from the video feed. It can be later overlayed over the video feed (on the webpage serving the video feed), or worked with seperately. A solution simmilar to [freeboard](https://freeboard.io/) (or freeboard itself) can later be used to transmit tellemetry to another webpage (for use on another monitor)

###Location

Location is detected using an RS232 GPS module connected to the Raspberry Pi. There it is added to the tellemetry stream. In later versions of the Robot, GPS could be used for an autonomous mode.

###Temperature

Temperature of key components (battery, raspberry, arduino, motors) as well as external temperature is measured by a bunch of ds18b20 temperature sensors communicating with the Raspbery using 1-wire. External and Battery temperatures only are displayed in the stream. Temperatures of the other measured areas are only displayed if they reach a potentialy dangerous temperatures (above 70°C) along with a warning.

###Battery Status

Battery status is measured by a digital voltmeter connected to the Raspberry. It is then transmitted along with the other data. If the voltage is dangerously low (11.5V), a warning is sent along with it.

###Acceleration

Acceleration is measured with an accelerometer such as the *ADXL3*. It is transmitted with the other data. If a high acceleration is detected (the robot falling from a big height), a "Goodbye" is sent along with the data, since the robot is unlikely to survive.

##Collision Prevention

Distance to objects is measured at all times with 4 laser distance meters connected to the raspberry, placed near the top of the robot (to allow for grass operation)(2 in the front, 2 in the back of the robot). If an object is detected (the distance is becomming shorter), the robot starts lowering its speed until it comes to a complete stop 5 cm away from the object.This can be overriden by a button in the remote cotrol i case the robot is wanted to ram something (or someone) (or driving in high grass)

Later, this will be replaced by a Kinect, that will allow for further functionallities

##Lights

In order to be seen, and to see, the robot will be equipped with 4 high power white narrow beam LEDs, two in the front, two in the back of the robot. For additional visibility, the robot shall be equipped with 2 blue and 2 red low power wide beam LEDs (**R**ed for **R**ight, b**L**ue for **L**eft) placed each in a top corner of the robot. These are blinked using the Arduino.

##Black Box

Every single movement of the motors is sent by the arduino into the RasPi, where they are stored onto an USB flash drive along with other tellemetry data (acceleration, temperatures, GPS location,...) and snapshots of the camera feed (every 5 seconds) for 2 hours (to prevent filling its storage and to not damage the SD card), then they are rewritten.

##In case of losing control signal
~~Use a small ammount of explosives to deliver at least a part of the robot to the last known position, where it had control signal.~~
-not very economical

If control signal is lost, the robot will execute all its movements in reverse order (stored in the Black Box). It will keep doing that for 15 minutes or until signal is found. (to prevent the robot from running away) In later versions with the Kinnect, etc. The robot will try to return back where it came from using GPS and the Kinnect.
