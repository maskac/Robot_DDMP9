import smbus
adr = 0x40

bus = smbus.SMBus(1)
db = bus.write_byte(adr, 0x02)

if __name__ == "__main__":
	t = bus.read_i2c_block_data(adr, 0x00)
	print(t)
	print(db)
