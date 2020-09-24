/*
  R.O.B.E.S.E.K.
  Arduino code
  Debug Serial set to 115200 bauds, Serial terminator is "\n"
  Web pages:
    none
*/

#include <Arduino.h>
#include <UIPEthernet.h>
#include <AFMotor.h>
#include <Servo.h>

// ======================= SETUP PART - change variables to match the your ones

//Motor and servo pins
#define motorFrontLeftPin 1
#define motorRearLeftPin 2
#define motorFrontRightPin 3
#define motorRearRightPin 4
#define camServoVerticalPin 9
#define camServoHorizontalPin 10

//Serials
#define SerialDEBUG Serial
  // Set speed for Serial port for ESP
#define SerialBaudDEBUG 115200

//Ranges
  // motor pwm range
#define mPRmin 50
#define mPRmax 255
  // motor current percent
#define mCPmin 0
#define mCPmax 100
  // camera servo angle vertical
#define cSAVmin 0
#define cSAVmax 180
  // camera servo angle horizontal
#define cSAHmin 60
#define cSAHmax 180

//Ethernet
  // don't change the first byte
#define robesek_mac 0x02,0x34,0x1E,0xF4,0x5C,0x20
  // commas instead of dots
#define robesek_ip 192,168,57,2
#define robesek_port 54321
#define ethernet_CS_pin 53

// ======================= DRIVER PART - do not change unless you know what you are doing

#define DEBUGpt if(debugSerial)SerialDEBUG.print
#define DEBUGptln if(debugSerial)SerialDEBUG.println

/*  
 *  Response headers and commands:
 *   starting with 0: 00 waiting for peripheries, 01 ready for anything, 02 communication error, 03 fatal error, 09 others - for the opposite side something like pass it on
 *   starting with 1 - motor management
 *   starting with 2 - camera management
 *   starting with 3 -
 *   starting with 4 -
 *   starting with 5 -
 *   starting with 6 -
 *   starting with 7 -
 *   starting with 8 -
 *   starting with 9 - settings (debug serial, etc.)
 */

uint8_t motorPwmRange[]       = {mPRmin, mPRmax};  // pwm range for every motor "[from],[to]"
int8_t  motorCurPercent       = mCPmax;            // current values of motor speed (%)
uint8_t camServoAngle[]       = {90, 90};          // vertical and horizontal servo angle (°)
uint8_t commandNum            = 0;                 // command numbers
char    commandArgs[3][11]    = {"", "", ""};      // 3 args
boolean debugSerial           = true;              // whether send debug to SerialDEBUG or not
boolean sendOutputIfNumberCom = false;             // whether send result or not if input is number command
boolean sendOutputIfStringCom = true;              // whether send result or not if input is string command
uint8_t ethIP[]               = {robesek_ip};
uint8_t ethMac[]              = {robesek_mac};

Servo          camServoHorizontal;
Servo          camServoVertical;
EthernetServer ethServer(robesek_port);
AF_DCMotor     motorFrontLeft(motorFrontLeftPin);
AF_DCMotor     motorRearLeft(motorRearLeftPin);
AF_DCMotor     motorFrontRight(motorFrontRightPin);
AF_DCMotor     motorRearRight(motorRearRightPin);

const char commandMap[10][10][15] = {
    {"m", "c", "3", "4", "5", "6", "7", "8", "o"}, // commandMap indentifiers, each map can have up to 10 commands
    {"stop", "for", "back", "left", "right", "brake", "speed", "speed++", "speed--", "range"},
    {"vert", "hor", "rst", "vert++", "vert--", "hor++", "hor--", ".", ".", "."},
    {".", ".", ".", ".", ".", ".", ".", ".", ".", "."},
    {".", ".", ".", ".", ".", ".", ".", ".", ".", "."},
    {".", ".", ".", ".", ".", ".", ".", ".", ".", "."},
    {".", ".", ".", ".", ".", ".", ".", ".", ".", "."},
    {".", ".", ".", ".", ".", ".", ".", ".", ".", "."},
    {".", ".", ".", ".", ".", ".", ".", ".", ".", "."},
    {"help", "debug", "sendOutput", ".", ".", ".", ".", ".", ".", "."}};

// function heads // for compiler
// TODO

// TODO TASKS:
//    prints to serial everywhere
//    main loop
//    ethernet wrapper
//    ultrasonic handler
//    ultrasonic cube mode (var isMoving bool)

// ======================= SETUP

void setup()
{
  // initialize SerialDEBUG
  SerialDEBUG.begin(SerialBaudDEBUG);

  // motor and servo initialization
  motorFrontLeft.run(RELEASE);
  motorRearLeft.run(RELEASE);
  motorFrontRight.run(RELEASE);
  motorRearRight.run(RELEASE);
  camServoHorizontal.attach(camServoHorizontalPin);
  camServoVertical.attach(camServoVerticalPin);
  // set them to the default state
  SetMotorSpeed();
  SetVerticalServo();
  SetHorizontalServo();

  // initialize ethernet
  Ethernet.init(ethernet_CS_pin);
  Ethernet.begin(ethMac, ethIP);
  ethServer.begin();
}

// ======================= MAIN

void loop()
{
  // grab commands from debug or ethernet and return result to its origin
  EthernetClient client = ethServer.available();
  if (client.available() || SerialDEBUG.available())
  {
    int com_len = 0;
    char *com = NULL;
    boolean isFromEthernet = false;
    boolean isCommandNumeric = false;
    int argc = 0;

    delay(1);
    if (client.available())
    {
      isFromEthernet = true;
      com_len = client.available() + 1;
      com = (char *)calloc(com_len, sizeof(char));
      com_len = client.read((uint8_t *)com, com_len) + 1;
    }
    else
    {
      com_len = SerialDEBUG.available() + 1;
      com = (char *)calloc(com_len, sizeof(char));
      com_len = SerialDEBUG.readBytes(com, com_len - 1) + 1;
    }
    com[com_len - 1] = 0;

    uint8_t result = ParseCommand(com, com_len, &argc, &isCommandNumeric);
    if (result)
    {
      DEBUGpt("Error: ");
      DEBUGptln(result);
    }
    else
    {
      DoJob(argc, isCommandNumeric);
    }

    free(com);
  }

  // iterate through ultrasonic sensors (cap approx. 1.2 meter)
  // TODO
}

// ======================= JOBBER

void DoJob(int argc, boolean isCommandNumeric)
{
  int data = 0;

  switch (commandNum)
  {

      // MOTOR

    case 10: // stop
      motorFrontLeft.run(RELEASE);
      motorRearLeft.run(RELEASE);
      motorFrontRight.run(RELEASE);
      motorRearRight.run(RELEASE);
      break;
    case 11: // forward
      motorFrontLeft.run(FORWARD);
      motorRearLeft.run(FORWARD);
      motorFrontRight.run(FORWARD);
      motorRearRight.run(FORWARD);
      break;
    case 12: // backward
      motorFrontLeft.run(BACKWARD);
      motorRearLeft.run(BACKWARD);
      motorFrontRight.run(BACKWARD);
      motorRearRight.run(BACKWARD);
      break;
    case 13: // leftward
      motorFrontLeft.run(BACKWARD);
      motorRearLeft.run(BACKWARD);
      motorFrontRight.run(FORWARD);
      motorRearRight.run(FORWARD);
      break;
    case 14: // rightward
      motorFrontLeft.run(FORWARD);
      motorRearLeft.run(FORWARD);
      motorFrontRight.run(BACKWARD);
      motorRearRight.run(BACKWARD);
      break;
    case 15: // brake
      motorFrontLeft.run(BRAKE);
      motorRearLeft.run(BRAKE);
      motorFrontRight.run(BRAKE);
      motorRearRight.run(BRAKE);
      break;
    case 16: // speed (jobData)
      if (argc != 1) break;
      data = atoi(commandArgs[0]);
      if (data > mCPmax) data = mCPmax;
      if (data < mCPmin) data = mCPmin;
      motorCurPercent = data;
      SetMotorSpeed();
      break;
    case 17: // speed++ (jobData)
      if (argc != 1) break;
      data = atoi(commandArgs[0]);
      if (data < 0) break;
      data += motorCurPercent;
      if (data > mCPmax) data = mCPmax;
      motorCurPercent = data;
      SetMotorSpeed();
      break;
    case 18: // speed-- (jobData)
      if (argc != 1) break;
      data = atoi(commandArgs[0]);
      if (data < 0) break;
      data -= motorCurPercent;
      if (data < mCPmin) data = mCPmin;
      motorCurPercent = data;
      SetMotorSpeed();
      break;
    case 19: // speed range (jobData)
      if (argc != 2) break; // not enough args

      if (atoi(commandArgs[0]) > atoi(commandArgs[1])) break;

      data = atoi(commandArgs[0]);
      if (data > mPRmax) data = mPRmax;
      if (data < mPRmin) data = mPRmin;
      motorPwmRange[0] = data;

      data = atoi(commandArgs[1]);
      if (data > mPRmax) data = mPRmax;
      if (data < mPRmin) data = mPRmin;
      motorPwmRange[1] = data;

      SetMotorSpeed();
      break;

      // CAMERAS

    case 20: // vertical angle (jobData)
      if (argc != 1) break;
      data = atoi(commandArgs[0]);
      if (data > cSAVmax) data = cSAVmax;
      if (data < cSAVmin) data = cSAVmin;
      camServoAngle[0] = data;
      SetVerticalServo();
      break;
    case 21: // horizontal angle (jobData)
      if (argc != 1) break;
      data = atoi(commandArgs[0]);
      if (data > cSAHmax) data = cSAHmax;
      if (data < cSAHmin) data = cSAHmin;
      camServoAngle[1] = data;
      SetHorizontalServo();
      break;
    case 22: // reset to 90° 90°
      camServoAngle[0] = 90;
      camServoAngle[1] = 90;
      SetVerticalServo();
      SetHorizontalServo();
      break;
    case 23: // vertical angle ++ (jobData)
      if (argc != 1) break;
      data = atoi(commandArgs[0]);
      if (data < 0) break;
      data += camServoAngle[0];
      if (data > cSAVmax) data = cSAVmax;
      camServoAngle[0] = data;
      SetVerticalServo();
      break;
    case 24: // vertical angle -- (jobData)
      if (argc != 1) break;
      data = atoi(commandArgs[0]);
      if (data < 0) break;
      data -= camServoAngle[0];
      if (data < cSAVmin) data = cSAVmin;
      camServoAngle[0] = data;
      SetVerticalServo();
      break;
    case 25: // horizontal angle ++ (jobData)
      if (argc != 1) break;
      data = atoi(commandArgs[0]);
      if (data < 0) break;
      data += camServoAngle[1];
      if (data > cSAVmax) data = cSAVmax;
      camServoAngle[1] = data;
      SetHorizontalServo();
      break;
    case 26: // horizontal angle -- (jobData)
      if (argc != 1) break;
      data = atoi(commandArgs[0]);
      if (data < 0) break;
      data -= camServoAngle[1];
      if (data < cSAVmin) data = cSAVmin;
      camServoAngle[1] = data;
      SetHorizontalServo();
      break;

      // OTHERS

    case 90: // help
      break;
    case 91: // debug serial on/off
      if (argc != 1) break;
      data = atoi(commandArgs[0]);

      if ((debugSerial && !data) || (!debugSerial && data))
      {
        debugSerial = !debugSerial;
      }

      break;
    case 92: // sendoutput if number/string command on/off
      if (argc != 2) break;
      data = atoi(commandArgs[1]);

      if (commandArgs[0][0] == 'n' && ((sendOutputIfNumberCom && !data) || (!sendOutputIfNumberCom && data)))
      {
        sendOutputIfNumberCom = !sendOutputIfNumberCom;
      }
      if (commandArgs[0][0] == 's' && ((sendOutputIfStringCom && !data) || (!sendOutputIfStringCom && data)))
      {
        sendOutputIfStringCom = !sendOutputIfStringCom;
      }

      break;
    default: // wrong command specified
      break;
  }
}

uint8_t ParseCommand(char *msg, int msg_len, int *argc, boolean *isCommandNumeric)
{
  if (msg_len < 3)  return 1; // msg_len is always >= 3
  if (msg_len > 29) return 2; // msg_len is always <= 30
  // reset
  int msg_pos = 0;
  *argc = 0;
  commandNum = 0;
  commandArgs[0][0] = '\0';
  commandArgs[1][0] = '\0';
  commandArgs[2][0] = '\0';
  // commandNum
  if (msg[0] > '0' && msg[0] < '9') // numeric
  {
    *isCommandNumeric = true;
    while (msg_pos < msg_len)
    {
      if (msg[msg_pos] == ' ' || msg[msg_pos] == '\n' || msg[msg_pos] == '\r' || msg[msg_pos] == '\0') break;
      if (msg[msg_pos] < '0' || msg[msg_pos] > '9') return 3;
      commandNum = commandNum * 10 + msg[msg_pos++] - '0';
    }
  }
  else
  { // com:blah (text)
    *isCommandNumeric = false;
    if (msg[1] != ':') return 4;
    for (int i = 0; i < 10; i++) // com:
    {
      if (i == 9) return 5;
      if (commandMap[0][i][0] == msg[0])
      {
        commandNum = i + 1;
        break;
      }
    }
    msg_pos = 2;
    while (msg[msg_pos] != ' ' && msg[msg_pos] != '\n' && msg[msg_pos] != '\r' && msg[msg_pos] != '\0')
    {
      msg_pos++;
    }
    if (msg_pos == 2) return 6;
    for (int i = 0; i < 11; i++) // :blah
    {
      if (i == 10) return 7;
      if (commandMap[commandNum][i][0] == '.') continue;
      if (CommandEquals(msg, msg_pos, i))
      {
        commandNum = commandNum * 10 + i;
        break;
      }
    }
  }
  while (msg[msg_pos] == ' ') msg_pos++; // skip spaces
  int arg_pos = 0;
  while (msg[msg_pos] != '\n' && msg[msg_pos] != '\r' && msg[msg_pos] != '\0')
  {
    if (arg_pos == 11) return 8;
    if (msg[msg_pos] == ' ')
    {
      commandArgs[*argc][arg_pos] = '\0';
      arg_pos = 0;
      *argc += 1;
      msg_pos++;
      while (msg[msg_pos] == ' ') msg_pos++;
      continue;
    }
    commandArgs[*argc][arg_pos++] = msg[msg_pos++];
  }

  if (arg_pos > 0)
  {
    commandArgs[*argc][arg_pos] = '\0';
    *argc += 1;
  }
  return 0;
}

boolean CommandEquals(char *msg, int msg_pos, int com)
{
  int pos = 0;
  while (commandMap[commandNum][com][pos] == *(msg + 2 + pos))
  {
    pos++;
    if (pos >= (msg_pos-2)) return true;
  }
  return false;
}

// ======================= SET CURRENT VALUES

uint8_t SetMotorSpeed()
{
  uint8_t curSpeed = motorPwmRange[0] + (((motorPwmRange[1] - motorPwmRange[0]) * motorCurPercent) / 100);
  motorFrontLeft.setSpeed(curSpeed);
  motorRearLeft.setSpeed(curSpeed);
  motorFrontRight.setSpeed(curSpeed);
  motorRearRight.setSpeed(curSpeed);
  return curSpeed;
}

uint8_t SetVerticalServo()
{
  camServoVertical.write(camServoAngle[0]);
  return camServoAngle[0];
}

uint8_t SetHorizontalServo()
{
  camServoHorizontal.write(camServoAngle[1]);
  return camServoAngle[1];
}
