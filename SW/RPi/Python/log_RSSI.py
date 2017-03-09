#Script for getting rssi info.

import sys
import subprocess

interface = "wlan0"

def get_RSSI():
    """Main method. Returns rssi in percent."""
    proc = subprocess.Popen(["iwlist", interface, "scan"],stdout=subprocess.PIPE, universal_newlines=True)
    out, err = proc.communicate()
    line = matching_line(out.split("\n"),"Quality=")[:5]
    level = line.split('/')
    return int(round(float(level[0]) / float(level[1]) * 100))

def matching_line(lines, keyword):
    """Returns the first matching line in a list of lines. See match()"""
    for line in lines:
        matching=match(line,keyword)
        if matching!=None:
            return matching
    return None

def match(line,keyword):
    """If the first part of line (modulo blanks) matches keyword,
-       returns the end of that line. Otherwise returns None."""
    line=line.lstrip()
    length=len(keyword)
    if line[:length] == keyword:
        return line[length:]
    else:
        return None

if (__name__=="__main__"):
    print(get_RSSI())
