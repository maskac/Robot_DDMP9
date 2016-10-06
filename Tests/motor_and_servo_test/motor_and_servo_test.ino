
#include <AFMotor.h>
#include <Servo.h> 


AF_DCMotor motorl1(1);
AF_DCMotor motorl2(2);
AF_DCMotor motorp1(3);
AF_DCMotor motorp2(4);

Servo servo1;
Servo servo2;



void setup() {
  Serial.begin(9600);           // set up Serial library at 9600 bps
  Serial.println("All motor test start");
  
  // turn on servo
  servo1.attach(9);
  servo2.attach(10); 
  
  // turn all motor to maxpower and release motors
  motorl1.setSpeed(255);
  motorl1.run(RELEASE);
  motorl2.setSpeed(255);
  motorl2.run(RELEASE);
  motorp1.setSpeed(255);
  motorp1.run(RELEASE);
  motorp2.setSpeed(255);
  motorp2.run(RELEASE);

}

int i;


void loop() {

  //run first motor, both servo to 0
  servo1.write(0);
  servo2.write(0);
  motorl1.run(FORWARD);
  delay(3000);
  motorl1.run(BACKWARD);
  delay(3000);
  motorl1.run(RELEASE);
  
  //run second motor, both servo to 90
  servo1.write(90);
  servo2.write(90);
  motorl2.run(FORWARD);
  delay(3000);
  motorl2.run(BACKWARD);
  delay(3000);
  motorl2.run(RELEASE);

  //run third motor, both servo to 180
  servo1.write(180);
  servo2.write(180);
  motorp1.run(FORWARD);
  delay(3000);
  motorp1.run(BACKWARD);
  delay(3000);
  motorp1.run(RELEASE);
  
  //run fourth motor, both servo to 90
  servo1.write(90);
  servo2.write(90);
  motorp2.run(FORWARD);
  delay(3000);
  motorp2.run(BACKWARD);
  delay(3000);
  motorp2.run(RELEASE);
  
  
}
