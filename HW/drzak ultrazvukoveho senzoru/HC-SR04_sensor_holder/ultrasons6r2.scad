difference () {
 union () {
  cube ([55, 31, 2]);
  translate ([20, -30, 0]) 
    cube ([15, 30, 2]);
  translate ([20, -32, 0]) 
    cube ([15, 2, 17]); 
  translate ([18, -32, 0]) 
    cube ([2, 34, 5]); 
  translate ([35, -32, 0]) 
    cube ([2, 34, 5]); 
  translate ([13, 0, 0]) 
    cube ([5, 2, 5]); 
  translate ([37, 0, 0]) 
    cube ([5, 2, 5]); 

}
 union () {
  translate ([14, 15, 0]) 
     cylinder  (h=2, r=8.5 , $fs=0.1 );
  translate ([40, 15, 0]) 
     cylinder  (h=2, r=8.5 , $fs=0.1 );
  translate ([20, 5, 0]) 
     cube ([14, 20, 2]);
  translate ([6, 6, 0]) 
     cylinder  (h=2, r=1 , $fs=0.1 );
  translate ([6, 24, 0]) 
     cylinder  (h=2, r=1 , $fs=0.1 );
  translate ([48, 6, 0]) 
     cylinder  (h=2, r=1 , $fs=0.1 );
  translate ([48, 24, 0]) 
     cylinder  (h=2, r=1 , $fs=0.1 );
translate ([27.5, -30, 10])  {
 rotate ([90, 0, 0])
    cylinder  (h=2, r=2, $fs=0.1);
}
}
}
