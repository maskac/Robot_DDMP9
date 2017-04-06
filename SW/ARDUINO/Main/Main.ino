/*
 R.O.B.E.S.E.K.
 Arduino code
 Both serials set to 115200 bauds, Serial terminator is "\n"
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
#define Max7219_shutdown 0x01       // not in shutdown mode, for it 0x00
#define Max7219_brightness 0x0f     // brightness, range: 0x00 to 0x0f
#define Max7219_testmode 0x00       // not in display-test mode, for it 0x01

//Serials
#define SerialRASP Serial
#define SerialESP Serial2
#define SerialBaudESP 115200 // Set speed for Serial port for ESP
#define SerialBaudRASP 115200 // Set speed for Serial port for Raspberry

// ======================= DRIVER PART - do not change unless you know what you are doing

/*
 *  There is difference between serialRASP - SerialRASP and serialESP - SerialESP,
 *    the first ones are booleans for online/offline serial
 *    the second ones are defines for serial ports
 *    
 *  Response headers:
 *   starting with 0: 00 waiting for response, 01 ready for anything, 02 communication error, 03 fatal error, 09 others - for the opposite side something like pass it on
 *   starting with 1 - motor control
 */

int j=0, rcPwmRange[] = {0,255};                   // j - temporary int, rcPwmRange - pwm range for motor "[from],[to]", changeable via "m:range [from],[to]"
unsigned int job=0, i=0, rcCurrentPwm=100;         // job - number of current task, i - temporary uint, rcCurrentPwm - current pwm value aplied on motors
byte serialOutput = false;                         // whether sned output to SerialRASP or not
boolean serialRASP=true, serialESP=true;           // stores whether are serial online or not
void doJob(), SendToMax(byte Ma, byte Mb), MaxWrite(byte Me);      // just for compiler
String serialInput, jobData;                       // serialInput - incoming string/serial buffer, jobData - data for current task
#define jobsLength 13                              // number of elements in jobs - once it will be calculated (maybe...)
const String jobs[]={"m:stop","m:for","m:back","m:left","m:right","m:break","m:speed","m:7","m:8","m:range","help","matrix",""};
// jobs - the last one is always empty, elements with number only are reserved for future usage

// =======SETUP=======

void setup(){
  // initialize serials
  SerialESP.begin(SerialBaudESP);
  SerialRASP.begin(SerialBaudRASP);
  
  // just to be sure ESP and Raspberry are loaded, they should send on start send something
  while(serialRASP == false || serialESP == false){
    if(SerialRASP.available() > 0) serialRASP = true;
    if(SerialESP.available() > 0) serialESP = true;
    i++;
    if(i>60000){
      if(serialRASP == true) SerialRASP.println("00 Waiting!");
      if(serialESP == true) SerialESP.print("00");
      i = 0;
    }
  }
  SerialRASP.println("01 Ready");
  SerialESP.print("01");

  // motor releases
  mFrontLeft.run(RELEASE);
  mRearLeft.run(RELEASE);
  mFrontRight.run(RELEASE);
  mRearRight.run(RELEASE);

  // initialize 8x8 matrix
  pinMode(Max7219_pinCLK, OUTPUT);
  pinMode(Max7219_pinCS, OUTPUT);
  pinMode(Max7219_pinDIN, OUTPUT);
  delay(10);    // wait for chip
  SendToMax(0x0b, 0x07);    // just some magic numbers - initialization sequence, go to datasheet
  SendToMax(0x09, 0x00);
  SendToMax(0x0c, Max7219_shutdown);
  SendToMax(0x0f, Max7219_testmode);
  SendToMax(0x0a, Max7219_brightness);
  for(i=1; i<9; i++) SendToMax(i, 0);    // empty all registers = turn all LEDs off
}

// =======LOOP=======

void loop() {
  // READER: serial
  if(SerialESP.available() > 0 || SerialRASP.available() > 0) {
    // prepare data
    while(SerialESP.available() > 0) {
      serialInput = SerialESP.readStringUntil('\n');
    }
    while(SerialRASP.available() > 0) {
      serialInput = SerialRASP.readStringUntil('\n');
      serialOutput = true;    // always send response to SerialRASP
    }
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
    serialOutput = false;    // reset "send response to SerialRASP" status
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
      if(serialOutput == true) SerialRASP.println("10 Motors: stop.");
      break;
    case 1:    // Forward
      mFrontLeft.run(FORWARD);
      mRearLeft.run(FORWARD);
      mFrontRight.run(FORWARD);
      mRearRight.run(FORWARD);
      if(serialOutput == true) SerialRASP.println("11 Motors: forward.");
      break;
    case 2:    // Backward
      mFrontLeft.run(BACKWARD);
      mRearLeft.run(BACKWARD);
      mFrontRight.run(BACKWARD);
      mRearRight.run(BACKWARD);
      if(serialOutput == true) SerialRASP.println("12 Motors: backward.");
      break;
    case 3:    // Leftward
      mFrontLeft.run(BACKWARD);
      mRearLeft.run(BACKWARD);
      mFrontRight.run(FORWARD);
      mRearRight.run(FORWARD);
      if(serialOutput == true) SerialRASP.println("13 Motors: leftward.");
      break;
    case 4:    // Rightward
      mFrontLeft.run(FORWARD);
      mRearLeft.run(FORWARD);
      mFrontRight.run(BACKWARD);
      mRearRight.run(BACKWARD);
      if(serialOutput == true) SerialRASP.println("14 Motors: rightward.");
      break;
    case 5:    // Break
      mFrontLeft.run(BRAKE);
      mRearLeft.run(BRAKE);
      mFrontRight.run(BRAKE);
      mRearRight.run(BRAKE);
      if(serialOutput == true) SerialRASP.println("15 Motors: brake.");
      break;
    case 6:    // Set speed, data format: [percent], range 0-100, it's translated using pwmRange to current speed
      j = jobData.toInt();
      if(j > 100) j=100;
      else if(j < 0) j=0;
      rcCurrentPwm = rcPwmRange[0] + (((rcPwmRange[1]-rcPwmRange[0]) * j)/100);    // I hope that you like math hehe
      mFrontLeft.setSpeed(rcCurrentPwm);
      mRearLeft.setSpeed(rcCurrentPwm);
      mFrontRight.setSpeed(rcCurrentPwm);
      mRearRight.setSpeed(rcCurrentPwm);
      if(serialOutput == true) {
        SerialRASP.print("09 Motors: set speed to ");
        SerialRASP.print(rcCurrentPwm);
        SerialRASP.println(" pwm.");
      }
      break;
    case 9:    // Set speed range, data format: [from],[to], define lowest and highest value of pwmRange in range 0-255
      if(jobData.indexOf(',') < 0) {
        if(serialOutput == true) SerialRASP.println("02 Motors: bad range format");
        break;
      }
      i = jobData.indexOf(',');
      j = jobData.substring(0,i).toInt();
      if(j > 255) j=255;
      else if(j < 0) j=0;
      rcPwmRange[0] = j;
      j = jobData.substring(i+1).toInt();
      if(j > 255) j=255;
      else if(j < 0) j=0;
      rcPwmRange[1] = j;
      if(serialOutput == true) {
        SerialRASP.print("09 Motors: set pwm range from ");
        SerialRASP.print(rcPwmRange[0]);
        SerialRASP.print(" to ");
        SerialRASP.print(rcPwmRange[1]);
        SerialRASP.println(".");
      }
      break;
    case 10:    // Help
      if(serialOutput == false) break;
      SerialRASP.print("09 Help:\n");
      SerialRASP.print(" Motors: \"m:\" and stop -> stop, for -> forward, back -> backward, left -> leftward, right -> rightward\n break -> break, speed -> set speed percent (0-100), range -> set speed range \"[from],[to]\" (0-255)\n");
      SerialRASP.println(" 8x8 matrix: matrix + address + array\n  addresses: 0 for display, 1 for brightness, 2 for shutdown, 3 for test mode\n  array if display: 8 numbers in range 0-255 separated with comma, eg.: 0232,104,234,052,195,023,154,042\n  array if other:\n   brightness from 0 to 15 (from low to high)\n   shutdown - zero -> shutdown, one -> work\n   test mode - zero -> off, one -> on");
      break;
    case 11:    // 8x8 matrix     !!!!! NEED REWORK !!!!! prefer not to use
        switch(0 + jobData.charAt(0)) {
          case 49:
            for(i=0; i<8; i++) SendToMax((i+1), jobData.substring((4*i+1), (4*i+4)).toInt());
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
    default:    // if no or bad command entered
      if(serialOutput == true) SerialRASP.println("02 This command is illegal or is not assigned to any job.");
      break;
  }
}

// =======8x8 MATRIX=======        (I like copypasting... so much... I even copypasted my life... saaaad)

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
