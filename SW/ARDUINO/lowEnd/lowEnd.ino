/*
 R.O.B.E.S.E.K.
 Arduino code
 Both serials set to 115200 bauds, Serial terminator is "\n"
 Web pages:
   Maxim7219 for 8x8 matrix: https://datasheets.maximintegrated.com/en/ds/MAX7219-MAX7221.pdf
   8x8 matrix program: http://playground.arduino.cc/LEDMatrix/Max7219
*/

#include <AFMotor.h>
#include <Servo.h>

// ======================= SETUP PART - change variables to match the right ones

//Motor and servo pins
AF_DCMotor mFrontLeft(1);
AF_DCMotor mRearLeft(2);
AF_DCMotor mFrontRight(3);
AF_DCMotor mRearRight(4);
#define sHorizontalPin 10
#define sVerticalPin 9

//8x8 matrix
#define Max7219_pinCLK 24
#define Max7219_pinCS 26
#define Max7219_pinDIN 22
#define Max7219_shutdown 0x01       // not in shutdown mode, for it 0x00
#define Max7219_brightness 0x0f     // brightness, range: 0x00 to 0x0f
#define Max7219_testmode 0x00       // not in display-test mode, for it 0x01

//Serials

#define SerialBaud 115200 // Set speed for Serial port


// ======================= DRIVER PART - do not change unless you know what you are doing

/*
 *  There is difference between serialRASP - Serial and serialESP - SerialESP,
 *    the first ones are booleans for online/offline serial
 *    the second ones are defines for serial ports
 *    
 *  Response headers:
 *   starting with 0: 00 waiting for peripheries, 01 ready for anything, 02 communication error, 03 fatal error, 09 others - for the opposite side something like pass it on
 *   starting with 1 - motor or servo
 *   starting with 2 - 8x8 matrix
 */

int j=0, rcPwmRange[] = {0,255};                   // j - temporary int, rcPwmRange - pwm range for motor "[from],[to]", changeable via "m:range [from],[to]"
int currentValues[] = {80,0,0};                    // current values of motor speed (%), vertical and horizontal servo angle
unsigned int job=0, i=0, rcCurrentPwm=0;           // job - number of current task, i - temporary uint, rcCurrentPwm - current pwm value aplied on motors
byte serialOutput=true;                           // whether sned output to Serial or not
void doJob(), SendToMax(byte Ma, byte Mb), MaxWrite(byte Me), SetMotorSpeed(), SetVerticalServo(), SetHorizontalServo();      // just for compiler
String serialInput, jobData;                       // serialInput - incoming string/serial buffer, jobData - data for current task
#define jobsLength 21                              // number of elements in jobs - once it will be calculated (maybe...)
const String jobs[]={"m:stop","m:for","m:back","m:left","m:right","m:brake","m:speed","m:speed++","m:speed--","m:range","help","matrix","c:vert","c:hor","c:rst","c:vert++","c:vert--","c:hor++","c:hor--",""};
// jobs - the last one is always empty
Servo sHorizontal;
Servo sVertical;

// =======SETUP=======

void setup(){
  // initialize serials
  Serial.begin(SerialBaud);
  
  // just to be sure ESP and Raspberry are loaded, they should send on start send something, now disabled - missing handlers on ESP and RASP
  Serial.println(F("01 Ready"));
  while(Serial.available()) Serial.read();
  Serial.println(F("09 Send \"help\" or I will die on your bad commands"));

  // motor and servo initialization
  mFrontLeft.run(RELEASE);
  mRearLeft.run(RELEASE);
  mFrontRight.run(RELEASE);
  mRearRight.run(RELEASE);
  SetMotorSpeed(); // set motors to default speed (in definition of "currentValues")
  sHorizontal.attach(sHorizontalPin);
  sVertical.attach(sVerticalPin);

  // initialize 8x8 matrix
  pinMode(Max7219_pinCLK, OUTPUT);
  pinMode(Max7219_pinCS, OUTPUT);
  pinMode(Max7219_pinDIN, OUTPUT);
  delay(10);    // wait for chip
  SendToMax(0x0b, 0x07);    // just pass some magic numbers - initialization sequence, follow datasheet
  SendToMax(0x09, 0x00);
  SendToMax(0x0c, Max7219_shutdown);
  SendToMax(0x0f, Max7219_testmode);
  SendToMax(0x0a, Max7219_brightness);
  for(i=1; i<9; i++) SendToMax(i, 0);    // empty all registers = turn all LEDs off
}

// =======LOOP=======

void loop() {
  // READER: serial
  if(Serial.available() > 0 ) {
    // prepare data
    serialInput = Serial.readStringUntil('\n');
    serialInput.replace("\n","");

    // split data into job and jobData, based on "contains parameter" or not
    job = (serialInput.indexOf(" ") + 1);
    if(job == 0) {
      for(i=0; i<jobsLength; i++) {
        if(jobs[i] == serialInput) break;
      }
    }
    else {
      jobData = serialInput.substring(job);
      job--;
      for(i=0; i<jobsLength; i++) {
        if(jobs[i] == serialInput.substring(0, job)) break;    // look into jobs for match
      }
    }
    if(i == jobsLength) job = 128;    // if no job found
    else job = i;    // if job found
    doJob();    // finally do some jobbing (nice englando)
    serialOutput = false;    // reset "send response to Serial" status
  }
  // READER: ultrasonic sensors __WIP__
}

// =======JOBBER=======

// RIP easy commands (since 18.03.17 not in use, using simple incremental int): 0-9 (ASCII:48-57) reserved for control, letters (ASCII:65-90) are for addons, response only to RASP ("H" for displaying help)
void doJob() {
  switch(job) {
    case 0:    // Stop
      mFrontLeft.run(RELEASE);
      mRearLeft.run(RELEASE);
      mFrontRight.run(RELEASE);
      mRearRight.run(RELEASE);
      Serial.println(F("10:Motors: stop."));
      break;
    case 1:    // Forward
      mFrontLeft.run(FORWARD);
      mRearLeft.run(FORWARD);
      mFrontRight.run(FORWARD);
      mRearRight.run(FORWARD);
      Serial.println(F("11:Motors: forward."));
      break;
    case 2:    // Backward
      mFrontLeft.run(BACKWARD);
      mRearLeft.run(BACKWARD);
      mFrontRight.run(BACKWARD);
      mRearRight.run(BACKWARD);
      Serial.println(F("12:Motors: backward."));
      break;
    case 3:    // Leftward
      mFrontLeft.run(BACKWARD);
      mRearLeft.run(BACKWARD);
      mFrontRight.run(FORWARD);
      mRearRight.run(FORWARD);
      Serial.println(F("13:Motors: leftward."));
      break;
    case 4:    // Rightward
      mFrontLeft.run(FORWARD);
      mRearLeft.run(FORWARD);
      mFrontRight.run(BACKWARD);
      mRearRight.run(BACKWARD);
      Serial.println(F("14:Motors: rightward."));
      break;
    case 5:    // Brake
      mFrontLeft.run(BRAKE);
      mRearLeft.run(BRAKE);
      mFrontRight.run(BRAKE);
      mRearRight.run(BRAKE);
      Serial.println(F("15:Motors: brake."));
      break;
    case 6:    // Set speed, data format: [percent], range 0-100, it's translated using pwmRange to current speed
      j = jobData.toInt();
      if(j > 100) j=100;
      else if(j < 0) j=0;
      currentValues[0] = j;
      SetMotorSpeed();
      break;
    case 7:    // Motor speed++
      currentValues[0]++;
      SetMotorSpeed();
      break;
    case 8:    // Motor speed--
      currentValues[0]--;
      SetMotorSpeed();
      break;
    case 9:    // Set speed range, data format: [from],[to], define lowest and highest value of pwmRange in range 0-255
      i = jobData.indexOf(',');
      if(i < 0) {
        Serial.println(F("02:Motors: bad range format"));
        break;
      }
      j = jobData.substring(0,i).toInt();
      if(j > 255) j=255;
      else if(j < 0) j=0;
      rcPwmRange[0] = j;
      j = jobData.substring(i+1).toInt();
      if(j > 255) j=255;
      else if(j < 0) j=0;
      rcPwmRange[1] = j;
      {
        Serial.print(F("17 "));
        Serial.print(rcPwmRange[0]);
        Serial.print(F(" "));
        Serial.print(rcPwmRange[1]);
        Serial.print(F(":Motors: set pwm range from "));
        Serial.print(rcPwmRange[0]);
        Serial.print(F(" to "));
        Serial.print(rcPwmRange[1]);
        Serial.println(F("."));
      }
      break;
    case 10:    // Help
      if(serialOutput == false) break;
      Serial.print(F("09:Help:\n"));
      Serial.print(F(" Motors: \"m: \" and \"stop\" -> stop, \"for\" -> forward, \"back\" -> backward, \"left\" -> leftward, \"right\" -> rightward\n  \"brake\" -> brake, \"speed []\" -> set speed percent (0-100), \"range [from],[to]\" -> set speed range (0-255)\n"));
      Serial.print(F(" 8x8 matrix: \"matrix [address][data]\n  addresses: 0 for display, 1 for brightness, 2 for shutdown, 3 for test mode\n  data if display: 8 numbers in range 0-255 separated with comma, eg.: 232,104,234,052,195,023,154,042\n  data if other:\n   brightness from 0 to 15 (from low to high)\n   shutdown - \"0\" -> off, \"1\" -> on\n   test mode - \"0\" -> off, \"1\" -> on\n"));
      Serial.print(F(" Camera: \"c: \" and \"rst\" -> center camera, \"hor\"/\"vert\" for horizontal or vertical camera shifting\n followed by degree value (hor.: 0-180, vert.: 55-180), eg.: \"c:vert 120\"\n"));
      Serial.println(F(" Serial Output Settings: \"serout \" and \"?\" -> display values, \"rasp\" -> switch value for Raspberry, \"esp\" -> switch value for ESP"));
      break;
    case 11:    // 8x8 matrix
      switch(0 + jobData.charAt(0)) {
        case 49: // print data
          for(i=0; i<8; i++) SendToMax((i+1), jobData.substring((4*i+1), (4*i+4)).toInt());
          break;
        case 50: // brightness
          SendToMax(0x0a, jobData.substring(1).toInt());
          break;
        case 51: // on/off
          SendToMax(0x0c, jobData.substring(1).toInt());
          break;
        case 52: // test mode
          SendToMax(0x0f, jobData.substring(1).toInt());
          break;
      }
      Serial.println(F("09:8x8 matrix: done."));
      break;
    case 12:    // Vertical servo
      j = jobData.toInt();
      if(j > 180) j=180;
      else if(j < 0) j=0;
      currentValues[1] = j;
      SetVerticalServo();
      break;
    case 13:    // Horizontal servo
      j = jobData.toInt();
      if(j > 180) j=180;
      else if(j < 55) j=55;
      currentValues[2] = j;
      SetHorizontalServo();
      break;
    case 14:    // Reset both servos
      sHorizontal.write(90);
      sVertical.write(90);
      break;
    case 15:    // Vertical servo++
      currentValues[1]++;
      SetVerticalServo();
      break;
    case 16:    // Vertical servo--
      currentValues[1]--;
      SetVerticalServo();
      break;
    case 17:    // Horizontal servo++
      currentValues[2]++;
      SetHorizontalServo();
      break;
    case 18:    // Horizontal servo--
      currentValues[2]--;
      SetHorizontalServo();
      break;
    default:    // if no or illegal command entered
      Serial.println(F("02:This command is illegal or is not assigned to any job."));
      break;
  }
}

// =======CURRENT VALUES=======             motor speed and servos
void SetMotorSpeed() {
  if(currentValues[0] > 100) currentValues[0]=100;
  else if(currentValues[0] < 0) currentValues[0]=0;
  rcCurrentPwm = rcPwmRange[0] + (((rcPwmRange[1]-rcPwmRange[0]) * currentValues[0])/100);    // I hope that you like math hehe
  mFrontLeft.setSpeed(rcCurrentPwm);
  mRearLeft.setSpeed(rcCurrentPwm);
  mFrontRight.setSpeed(rcCurrentPwm);
  mRearRight.setSpeed(rcCurrentPwm);
  {
    Serial.print(F("16 "));
    Serial.print(rcCurrentPwm);
    Serial.println(F(":Motors: set speed to precedent value."));
  }
}
void SetHorizontalServo() {
  if(currentValues[2] > 180) currentValues[2]=180;
  else if(currentValues[2] < 0) currentValues[2]=0;
  sHorizontal.write(currentValues[2]);
  {
    Serial.print(F("18 "));
    Serial.print(currentValues[2]);
    Serial.println(F(":Servos: set horizontal to precedent value."));
  }
}
void SetVerticalServo() {
  if(currentValues[1] > 180) currentValues[1]=180;
  else if(currentValues[1] < 55) currentValues[1]=55;
  sVertical.write(currentValues[1]);
  {
    Serial.print(F("19 "));
    Serial.print(currentValues[1]);
    Serial.println(F(":Servos: set vertical to precedent value."));
  }
}

// =======8x8 MATRIX=======        (I like copypasting... so much... I even copypasted my life... saaaad) -> from web source

int Mc;
byte Md;
void SendToMax(byte Ma, byte Mb) {
  digitalWrite(Max7219_pinCS, LOW);
  MaxWrite(Ma);
  MaxWrite(Mb);
  digitalWrite(Max7219_pinCS, HIGH);
}

void MaxWrite(byte Me) {
  Mc = 8;
  while(Mc > 0) {
    Md = 0x01 << (Mc - 1);                          // get bitmask
    digitalWrite(Max7219_pinCLK, LOW);              // tick
    if(Me & Md) digitalWrite(Max7219_pinDIN, HIGH); // choose bit, if true send 1
    else digitalWrite(Max7219_pinDIN, LOW);         // send 0
    digitalWrite(Max7219_pinCLK, HIGH);             // tock
    --Mc;                                           // move to lesser bit
  }
}
