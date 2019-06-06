import sys
import subprocess

interface = "wlan0"

def get_RSSI():
    proc = subprocess.Popen(["iwlist", interface, "scan"],stdout=subprocess.PIPE, universal_newlines=True)
    out, err = proc.communicate()
    line = matching_line(out.split("\n"),"Quality=")[:5]
    level = line.split('/')
    return int(round(float(level[0]) / float(level[1]) * 100))

def matching_line(lines, keyword):
    for line in lines:
        matching=match(line,keyword)
        if matching!=None:
            return matching
    return None

def match(line,keyword):
    line=line.lstrip()
    length=len(keyword)
    if line[:length] == keyword:
        return line[length:]
    else:
        return None

if (__name__=="__main__"):
    print(get_RSSI())
