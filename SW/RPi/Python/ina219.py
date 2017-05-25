from inalib import INA219
from inalib import DeviceRangeError

SHUNT_OHMS = 0.1
MAX_EXPECTED_AMPS = 0.2

def read():
    ina = INA219(SHUNT_OHMS, MAX_EXPECTED_AMPS)
    ina.configure(ina.RANGE_16V)
    # bus voltage V, bus current mA, power mW, shunt voltage mV
    el = [ina.voltage(), ina.current(), ina.power(), ina.shunt_voltage()]
    return el

# tetsovani
if __name__ == "__main__":
    print read()
    t = read()
    print t[1]
