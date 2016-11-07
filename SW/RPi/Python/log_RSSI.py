#Script for getting RSSI info.
#Skript pro získání RSSI infa.

import sys
import subprocess

#Main method, returns RSSI info.
#Hlavní metoda, vrací RSSI info.
def get_RSSI():
    proc = subprocess.Popen(["iwlist", interface, "scan"],stdout=subprocess.PIPE, universal_newlines=True) #Variable interface doesn't exist.
    out, err = proc.communicate()
    cell_line = match(out.split("\n")[0],"Cell ")
    line = cell_line[-27:]
    signal = get_signal_level(line)
    return int(signal)

def get_signal_level(cell):
    return matching_line(cell,"Quality=").split("Signal level=")[1] #Signal level is on the same line as Quality. Síla signálu je na stejném řádku jako kvalita.

def matching_line(lines, keyword):
    """Returns the first matching line in a list of lines. See match()"""
    for line in lines:
        matching=match(line,keyword)
        if matching!=None:
            return matching
    return None

def match(line,keyword):
    """If the first part of line (modulo blanks) matches keyword,
    returns the end of that line. Otherwise returns None"""
    line=line.lstrip()
    length=len(keyword)
    if line[:length] == keyword:
        return line[length:]
    else:
        return None

