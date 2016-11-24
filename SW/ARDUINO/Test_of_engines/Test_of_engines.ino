// ARDUINO MOTOR TESTER
// SETUP PART - change variables to match the right ones

#include <AFMotor.h>
AF_DCMotor mFrontLeft(1); // Motor pins
AF_DCMotor mRearLeft(2);
AF_DCMotor mFrontRight(3);
AF_DCMotor mRearRight(4);

const int pwmRange[] = {0,255}; // The smallest and largest value of PWM range, when sending to motors, these values are transformed via percentage to final pwm values (default: 0,255)
const int firstRunTestLengths[] = {24,2,2,2}; // Length of tests, which are running once at the beginning, in seconds

// DRIVER PART - do not change unless you know what you are doing

unsigned int testCurrent = 0, currentState = 0, power = 0, job = 0, test1State = 0;
unsigned long testStartTime = 0, testEndTime = 0, jobTime = 0, test1Time = 0;
String serialInput;

void setup() {
  Serial.begin(9600);
  Serial.println("Initializing, send 'H' to display help.");
  mFrontLeft.run(RELEASE);
  mRearLeft.run(RELEASE);
  mFrontRight.run(RELEASE);
  mRearRight.run(RELEASE);
  delay(750); // just to be sure everything has its time to load itself
  Serial.println("Initialized, starting the beginning test loop.");
}

void loop() {
  while(Serial.available() > 0) { // Serial read + convert to job and then call it
    serialInput = Serial.readString();
    serialInput.trim();
    job = serialInput.charAt(0);
    if(serialInput.length()>1) jobTime = 0 + serialInput.substring(1).toInt(); // *if* for jobs with deferred end
    doJob();
  }
  if(testCurrent==1 && (millis()-test1Time)>3000) { // Test 1
    test1State++;
    switch(test1State) {
      case 1:
        mFrontLeft.run(FORWARD);
        break;
      case 2:
        mFrontLeft.run(RELEASE);
        delay(20);
        mFrontLeft.run(BACKWARD);
        break;
      case 3:
        mFrontLeft.run(RELEASE);
        mFrontRight.run(FORWARD);
        break;
      case 4:
        mFrontRight.run(RELEASE);
        delay(20);
        mFrontRight.run(BACKWARD);
        break;
      case 5:
        mFrontRight.run(RELEASE);
        mRearLeft.run(FORWARD);
        break;
      case 6:
        mRearLeft.run(RELEASE);
        delay(20);
        mRearLeft.run(BACKWARD);
        break;
      case 7:
        mRearLeft.run(RELEASE);
        mRearRight.run(FORWARD);
        break;
      case 8:
        mRearRight.run(RELEASE);
        delay(20);
        mRearRight.run(BACKWARD);
        break;
      case 9:
        mRearRight.run(RELEASE);
        test1State = 0;
        break;
    }
    test1Time = millis();
  }
  if(millis()>=testEndTime && testCurrent!=0) { // Terminator
    stopWheels();
    test1State = 0;
    Serial.print("End of the test ");
    Serial.print(testCurrent);
    Serial.println(".");
    testCurrent = 0;
    if(currentState!=10) currentState++;
    if(currentState==4) {
      currentState = 10;
      Serial.println("End of the beginning test loop.");
    }
  }
  if(currentState!=10 && testCurrent == 0) { // Run once all tests at the beginning
    job = currentState+49;
    jobTime = firstRunTestLengths[currentState]*1000;
    doJob();
  }
}

void doJob() {
  switch(job) {
    case 49: // Test 1
      stopWheels();
      power = ((pwmRange[1] - pwmRange[0])*0.7)+pwmRange[0];
      Serial.print("Test 1: forward and backward motion consecutively for 3+3 seconds for each of them,\n each wheel separately (total loop time 27 seconds),\n for ");
      Serial.print(jobTime);
      Serial.print("ms, PWM 70%: ");
      Serial.println(power);
      test1Time = millis()-3000; // to run first part instantly
      testInit();
      testCurrent = 1; // test itself -> see *if* above
      break;
    case 50: // Test 2
      stopWheels();
      power = ((pwmRange[1] - pwmRange[0])*0.8)+pwmRange[0];
      Serial.print("Test 2: forward motion for ");
      Serial.print(jobTime);
      Serial.print("ms, PWM 80%: ");
      Serial.println(power);
      testInit();
      testCurrent = 2;
      mFrontLeft.run(FORWARD); // test itself
      mRearLeft.run(FORWARD);
      mFrontRight.run(FORWARD);
      mRearRight.run(FORWARD);
      break;
    case 51: // Test 3
      stopWheels();
      power = ((pwmRange[1] - pwmRange[0])*0.8)+pwmRange[0];
      Serial.print("Test 3: backward motion for ");
      Serial.print(jobTime);
      Serial.print("ms, PWM 80%: ");
      Serial.println(power);
      testInit();
      testCurrent = 3;
      mFrontLeft.run(BACKWARD); // test itself
      mRearLeft.run(BACKWARD);
      mFrontRight.run(BACKWARD);
      mRearRight.run(BACKWARD);
      break;
    case 52: // Test 4
      stopWheels();
      power = pwmRange[1];
      Serial.print("Test 4: counterclockwise motion for ");
      Serial.print(jobTime);
      Serial.print("ms, PWM 100%: ");
      Serial.println(power);
      testCurrent = 4;
      testInit();
      mFrontLeft.run(BACKWARD); // test itself
      mRearLeft.run(BACKWARD);
      mFrontRight.run(FORWARD);
      mRearRight.run(FORWARD);
      break;
    case 83: // Stop
      if(testCurrent==0) {
        Serial.println("No test running.");
        break;
      }
      stopWheels();
      Serial.print("Stopping test ");
      Serial.print(testCurrent);
      if(currentState!=10) {
        currentState = 10;
        Serial.println(", end of the beginning loop.");
      }
      else Serial.println(".");
      test1State = 0;
      testCurrent = 0;
      break;
    case 67: // Display current test
      if(testCurrent==0) {
        Serial.println("No test running.");
        break;
      }
      if(currentState!=10) {
        Serial.print("Running the beginning test loop, actual test: ");
        job = currentState + 1;  // I don't like Serial.print so much
        Serial.println(job);
      }
      else {
        Serial.print("Running test ");
        Serial.println(testCurrent);
      }
      Serial.print(" Test start time: ");
      Serial.println(testStartTime);
      Serial.print(" Current time: ");
      Serial.println(millis());
      Serial.print(" Test end time: ");
      Serial.println(testEndTime);
      Serial.print(" PWM: ");
      Serial.println(power);
      break;
    case 72: // Help
      Serial.println("Use only capital letters and numbers.");
      Serial.println(" Usage: first char + time in ms for duration of tests (max over 1M), e.g. 15000 -> test1 for 5000ms."); //" Usage: first char + time in ms for duration of non-instant job (max over 1M)."
      Serial.println(" Send C to display current test and its times.");
      Serial.println(" Send S to stop any test.");
      Serial.println(" Send 1-4 for tests.");
      break;
    default:
      Serial.println("This command is illegal or is not assigned to any job.");
      break;
  }
}

void stopWheels() { // Stops all wheels
  mFrontLeft.run(RELEASE);
  mRearLeft.run(RELEASE);
  mFrontRight.run(RELEASE);
  mRearRight.run(RELEASE);
}

void testInit() { // Set motors speeds and save times
  testStartTime = millis();
  testEndTime = millis() + jobTime;
  mFrontLeft.setSpeed(power);
  mRearLeft.setSpeed(power);
  mFrontRight.setSpeed(power);
  mRearRight.setSpeed(power);
}

