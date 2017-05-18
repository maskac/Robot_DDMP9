



#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <Servo.h>
#define UART_BAUD 9600
#define zelena 12
#define modra 13
#define cervena 15
int swcervena = 0;
int swtimeout = 0;
int chyba = 0;
int mezera = 0;
int bufint = 0;
/*
const char *ssid = "test-wifi";  // You will connect your phone to this Access Point
const char *pw = "123456789"; // and this is the password
IPAddress ip(192, 168, 0, 1); // From RoboRemo app, connect to this IP
IPAddress netmask(255, 255, 255, 0);
 */
const int port = 4600; // and this port
unsigned long previousMillis = 0;
const long interval = 300;
int runfirst = 0;
int runfirstpre = 0;
unsigned long currentMillistimeout;
//vzpsat buffer todo
unsigned long premiltimeout = 0;
const long timeoutcon = 300;
unsigned long currentMillis;

void chybaoprava(void) {
    digitalWrite(cervena, HIGH);
    swcervena = 1;
    Serial.println("red on");
    previousMillis = millis();


}

WiFiServer server(port);
WiFiClient client;


char buf1[1024];
int i1 = 0;

/*
uint8_t buf2[1024];
uint8_t i2=0;
 */

void setup() {



    delay(500);

    Serial.begin(UART_BAUD);
    Serial.println("SW BEGIN0");


    Serial.print("Setting soft-AP ... ");
    Serial.println(WiFi.softAP("ESPsoftAP_01", "pass-to-soft-AP") ? "Ready" : "Failed!");



    server.begin();



}

void loop() {








    //digitalWrite(cervena, HIGH);

    if (client.connected()) {



       // Serial.println("client conected");

        digitalWrite(modra, HIGH);


    } else {
        digitalWrite(modra, LOW);

       // Serial.printf("Stations connected = %d\n", WiFi.softAPgetStationNum());
        //delay(3000);


    }




    if (!client.connected()) {
        client = server.available();

        return;
    }


    if (swcervena == 1) {
        currentMillis = millis();
        if (currentMillis - previousMillis >= interval) {
            previousMillis = currentMillis;
            digitalWrite(cervena, LOW);
            swcervena = 0;
            Serial.println("CERVENA DISBLE");
        }


    }


    if (client.available()) {

     
        buf1[i1] = (char) client.read();
        Serial.print(i1);
        Serial.print(buf1[i1]);
        Serial.print('\n');
        if (buf1[i1] !=0 ){
        if (runfirst == 0) {
            if (runfirstpre == 0) {
                premiltimeout = millis();
                runfirstpre = 1;
            }
            currentMillistimeout = millis();
            runfirst = 1;
        }
       // Serial.print(i1);
        //Serial.print(buf1[i1]);
        
        digitalWrite(modra, HIGH);

        if (i1 < 63)   i1++;
        
        } 
    }

    // now send to UART:
       
//Serial.print(i1);
    if (i1 > 0) {
         

        if (currentMillistimeout - premiltimeout >= timeoutcon) {
            premiltimeout = currentMillistimeout;
            swtimeout = 1;
            Serial.println("TIMEOT PRIJEM");
            chyba++;
        }
 //Serial.println((i1));
 
 
 
        if (buf1[i1-1] == 'a' || swtimeout == 1) {
            runfirst = 0;
                
            Serial.println("read end");


            if (swtimeout == 0) {
              


                do {
                    if (buf1[bufint] == ' ') {
                       
                    mezera++;
                }
                    if (mezera == 1) {
                        
                       
                      
                        if (!isdigit(buf1[bufint+1]) && buf1[bufint+1] !='a' ) { 
                       Serial.println(buf1[bufint+1]); 
                          
                        chyba++;
                        }

                    }
                    bufint++;
                   
                } while (buf1[bufint] != 'a');
                


            }





            if (mezera == 1 && chyba == 0) {

                Serial.write(buf1, i1);
               
Serial.println("\n reak ok");

                i1 = 0;
                mezera = 0;
                chyba = 0;
                bufint = 0;
                digitalWrite(modra, LOW);
                swtimeout = 0;

            } else {
                Serial.println("READ FAIL");
                chybaoprava();
                swtimeout = 0;
                bufint = 0;
                i1 = 0;
                mezera = 0;
                chyba = 0;
                digitalWrite(modra, LOW);





            }
        }
       
    }

















}












/*
  if(Serial.available()) {
    while(Serial.available()) {
      buf2[i2] = (char)Serial.read();
      if(i2<1023) i2++;
    }
    // now send to WiFi:
    client.write((char*)buf2, i2);
    i2 = 0;
  }
 */
//zkopĂ­rovĂˇno z jinehoo projektu ale zpÄ›tnĂˇ komunikace nebyla v zadĂˇnĂ­ moĹľnĂˇ se bude do budoucna hodit



