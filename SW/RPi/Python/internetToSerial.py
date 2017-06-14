#!/usr/bin/python3

from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
import serial
ser = serial.Serial("/dev/ttyUSB0", 115200)

def sendSer(payload):
  ser.write(payload.encode())

class listener(WebSocket):

  def handleMessage(self):
    self.sendMessage(self.data)
    print(self.data)
    sendSer(self.data)
  def handleConnected(self):
    print(self.address, 'connected')

  def handleClose(self):
    print(self.address, 'closed')

server = SimpleWebSocketServer('', 8000, listener)
server.serveforever()
