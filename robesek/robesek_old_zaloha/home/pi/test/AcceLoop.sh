while true
do
out=$(python adxl345.py 2>&1);
  #$out = `python adxl345.py`;
clear;  
printf "\n\n\n\n";
echo $out;
sleep 1;
done