#Script for getting RSSI info.
#Skript pro získání RSSI infa.

import sys
import subprocess

interface = "wlan0"

def get_RSSI():
    """"Main method, returns RSSI signal level.
        Hlavní metoda, vrací RSSI sílu signálu."""
    proc = subprocess.Popen(["iwlist", interface, "scan"],stdout=subprocess.PIPE, universal_newlines=True) #Variable interface doesn't exist.
    out, err = proc.communicate()
    cell_line = match(out.split("\n")[0],"Cell ")
    line = cell_line[-27:]
    signal = get_signal_level(line)
    return signal

def get_signal_level(cell):
    level = matching_line(cell,"Quality=").split("Signal level=")[1] #Signal level is on the same line as Quality. Síla signálu je na stejném řádku jako kvalita.
    level = level.split()[0].split('/')
    return int(round(float(level[0]) / float(level[1]) * 100))
    
def matching_line(lines, keyword):
    """Returns the first matching line in a list of lines. See match()
       Vrátí první řádek, který začíná na keyword. Viz match()"""
    for line in lines:
        matching=match(line,keyword)
        if matching!=None:
            return matching
    return None

def match(line,keyword):
    """If the first part of line (modulo blanks) matches keyword,
       returns the end of that line. Otherwise returns None.
       V případě, že první část řádku (bez mezer) odpovídá keyword,
       vrací konec tohoto řádku. Jinak vrací None."""
    line=line.lstrip()
    length=len(keyword)
    if line[:length] == keyword:
        return line[length:]
    else:
        return None
