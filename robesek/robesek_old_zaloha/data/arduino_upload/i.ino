/* 
 R.O.B.E.S.E.K.  
 Arduino final code
 Both serials set to 38400 bauds, timeout for them lowered to 30ms
 Web pages:
   Maxim7219 for 8x8 matrix: https://datasheets.maximintegrated.com/en/ds/MAX7219-MAX7221.pdf
   8x8 matrix program: http://playground.arduino.cc/LEDMatrix/Max7219
*/

#include <AFMotor.h>

// ======================= SETUP PART - change variables to match the right ones

//Motor pins  
AF_DCMotor mFrontLeft(1);
AF_DCMotor mRearLeft(2);
AF_DCMotor mFrontRight(3);
AF_DCMotor mRearRight(4);

//8x8 matrix
#define Max7219_pinCLK 24
#define Max7219_pinCS 26
#define Max7219_pinDIN 22

#define SerialBaudESP 38400 // Set speed for Serial port for ESP
#define SerialBaudRASP 38400 // Set speed for Serial port for Raspberry

// ======================= DRIVER PART - do not change unless you know what you are doing

//ESP Serial1, RASP Serial
int rcPwmRange[] = {0,255,0};
unsigned int job=0, a=0, rcCurrentPwm;
byte serialOutput = false;
void doJob(), SendToMax(byte Ma, byte Mb), MaxWrite(byte Me);
String serialInput, jobData; // used for communication

// =======SETUP=======

void setup(){
  // INIT: serials
  Serial1.begin(SerialBaudESP);
  Serial.begin(SerialBaudRASP);
  //Serial.println("00 Waiting!");
  //while(Serial1.available() == 0) {}
  //while(Serial2.available() == 0) {} // just to be sure ESP and Raspberry are loaded, they should send on start send something

  // INIT: motor releases
  mFrontLeft.run(RELEASE);
  mRearLeft.run(RELEASE);
  mFrontRight.run(RELEASE);
  mRearRight.run(RELEASE);

/*
  // INIT: 8x8 matrix
  pinMode(Max7219_pinCLK, OUTPUT);
  pinMode(Max7219_pinCS, OUTPUT);
  pinMode(Max7219_pinDIN, OUTPUT);
  delay(10);
  SendToMax(0x0b, 0x07);
  SendToMax(0x09, 0x00);
  SendToMax(0x0c, 0x01);      // not in shutdown mode, for it 0x00
  SendToMax(0x0f, 0x00);      // not in display-test mode, for it 0x01
  SendToMax(0x0a, 0x0f);      // the first 0x0f is the value you can set, range: 0x00 to 0x0f
  for(a=1; a<9; a++) SendToMax(a, 0);      // empty all registers = turn all LEDs off
*/
}

// =======LOOP=======

void loop() {
  // READER: serial
  if(Serial1.available() > 0 || Serial.available() > 0) {
    while(Serial1.available() > 0) {
      serialInput = Serial1.readStringUntil(59);
    }
    while(Serial2.available() > 0) {
      serialInput = Serial2.readStringUntil(59);
      serialOutput = true;
    }
    job = serialInput.charAt(0);
    if(serialInput.length() > 1) jobData = serialInput.substring(1);
    doJob();
    serialOutput = false;
  }
  // READER: ultrasonic sensors __WIP__
}

// =======JOBBER=======

// 0-9 (ASCII:48-57) reserved for control, letters (ASCII:65-90) are for addons, response only to RASP ("H" for displaying help)
void doJob() {
  switch(job) {
    case 48: // Forward
      mFrontLeft.run(FORWARD);
      mRearLeft.run(FORWARD);
      mFrontRight.run(FORWARD);
      mRearRight.run(FORWARD);
      if(serialOutput == true) Serial.println("11 Motors: forward.");
      break;
    case 49: // Backward
      mFrontLeft.run(BACKWARD);
      mRearLeft.run(BACKWARD);
      mFrontRight.run(BACKWARD);
      mRearRight.run(BACKWARD);
      if(serialOutput == true) Serial.println("12 Motors: backward.");
      break;
    case 50: // Leftward
      mFrontLeft.run(BACKWARD);
      mRearLeft.run(BACKWARD);
      mFrontRight.run(FORWARD);
      mRearRight.run(FORWARD);
      if(serialOutput == true) Serial.println("13 Motors: leftward.");
      break;
    case 51: // Rightward
      mFrontLeft.run(FORWARD);
      mRearLeft.run(FORWARD);
      mFrontRight.run(BACKWARD);
      mRearRight.run(BACKWARD);
      if(serialOutput == true) Serial.println("14 Motors: rightward.");
      break;
    case 52: // Stop
      mFrontLeft.run(RELEASE);
      mRearLeft.run(RELEASE);
      mFrontRight.run(RELEASE);
      mRearRight.run(RELEASE);
      if(serialOutput == true) Serial.println("10 Motors: stop.");
      break;
    case 53: // Break
      mFrontLeft.run(BRAKE);
      mRearLeft.run(BRAKE);
      mFrontRight.run(BRAKE);
      mRearRight.run(BRAKE);
      if(serialOutput == true) Serial2.println("15 Motors: brake.");
      break;
    case 54: // Set speed, format [number], number is percent - then it's translated using pwmRange to speed
      rcCurrentPwm = rcPwmRange[0] + ((rcPwmRange[1]-rcPwmRange[0]) * (jobData.toInt()/100));
      mFrontLeft.setSpeed(rcCurrentPwm);
      mRearLeft.setSpeed(rcCurrentPwm);
      mFrontRight.setSpeed(rcCurrentPwm);
      mRearRight.setSpeed(rcCurrentPwm);
      if(serialOutput == true) {
	Serial2.print("Motors: set speed to ");
	Serial2.print(rcCurrentPwm);
	Serial2.println(" pwm.");
      }
      break;
    case 57: // Set speed range, format [from],[to], define lowest and highest value of pwmRange in range 0-255
      rcPwmRange[2] = jobData.indexOf(44);
      rcPwmRange[0] = jobData.substring(0,rcPwmRange[2]).toInt();
      rcPwmRange[1] = jobData.substring(4).toInt();
      if(serialOutput == true) {
        Serial2.print("Motors: set pwm range from ");
        Serial2.print(rcPwmRange[0]);
        Serial2.print(" to ");
        Serial2.print(rcPwmRange[1]);
        Serial2.println(".");
      }
      break;
/*
    case 65: // 8x8 matrix
        switch(0 + jobData.charAt(0)) {
          case 49:
            for(a=0; a<8; a++) SendToMax((a+1), jobData.substring((4*a+1), (4*a+4)).toInt());
            break;
          case 50:
            SendToMax(0x0a, jobData.substring(1).toInt());
            break;
          case 51:
            SendToMax(0x0c, jobData.substring(1).toInt());
            break;
          case 52:
            SendToMax(0x0f, jobData.substring(1).toInt());
            break;
        }
      break;
*/
    case 72: // Help
      if(serialOutput == false) break;
      Serial2.println("Help:\nUse only capital letters and numbers.");
      Serial2.println(" Moves: 0 -> forward, 1 -> backward, 2 -> leftward, 3 -> rightward\n 4 -> stop, 5 -> break, 6 -> set speed percent, 9 -> set speed range");
//      Serial2.println(" 8x8 matrix: A + address + array\n  addresses: 0 for display, 1 for brightness, 2 for shutdown, 3 for test mode\n  array if display: 8 numbers in range 0-255 separated with comma, eg.: 0232,104,234,052,195,023,154,042\n  array if other:\n   brightness from 0 to 15 (from low to high)\n   shutdown - zero -> shutdown, one -> work\n   test mode - zero -> off, one -> on");
      break;
    default:
      if(serialOutput == true) Serial2.println("01 This command is illegal or is not assigned to any job.");
      break;
  }
}

// =======8x8 MATRIX======= 

void SendToMax(byte Ma, byte Mb) {
  digitalWrite(Max7219_pinCS, LOW);
  MaxWrite(Ma);
  MaxWrite(Mb);
  digitalWrite(Max7219_pinCS, HIGH);
}

int Mc;
byte Md;
void MaxWrite(byte Me) {
  Mc = 8;
  while(Mc > 0) {
    Md = 0x01 << (Mc - 1);                          // get bitmask
    digitalWrite(Max7219_pinCLK, LOW);            // tick
    if(Me & Md) digitalWrite(Max7219_pinDIN, HIGH); // choose bit, if true send 1
    else digitalWrite(Max7219_pinDIN, LOW);       // send 0
    digitalWrite(Max7219_pinCLK, HIGH);           // tock
    --Mc;                                          // move to lesser bit
  }
}

