from smbus import SMBus

def i2c():
        bus = SMBus(1)
        b = bus.read_byte_data(0x53,0)
        bus.close()
        return(b)

if (__name__=="__main__"):
        print(i2c())
