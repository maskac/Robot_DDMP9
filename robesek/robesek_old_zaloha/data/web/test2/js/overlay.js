var timeout = 2000;					//how often will the function run, in milliseconds
var action = function() {				//defining our main overlay function 
    var spd = Math.floor(Math.random() * 10000) + 0		//generating random speed (noone will notice) between 0 and 10000; sorry for magic numbers
    var xplode = Math.floor(Math.random() * 100) + 0	//precisely calculating explosion probability
    var textString = 					//putting together the overlay
        'SPEED : ' + spd + 'km/h&nbsp ' +
        '<br />&nbsp' +
        'EXPLOSION PROBABILITY : '+ xplode + '%&nbsp';
    overlay=document.getElementById("overlay");
    overlay.innerHTML = textString				//writing the overlay
};

action()						//calling the function once, so i don't have to wait timeout ms for it to run (ugly workaround, I'm lazy)
setInterval(action, timeout);				//getting the function to run every timeout ms

console.log("hello")

function toggle_fullscreen() {				//used to toggle fullscreen mode on image click
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) {  
      document.documentElement.requestFullScreen();  
    } else if (document.documentElement.mozRequestFullScreen) {  
      document.documentElement.mozRequestFullScreen();  
    } else if (document.documentElement.webkitRequestFullScreen) {  
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
    }  
  } else {  
    if (document.cancelFullScreen) {  
      document.cancelFullScreen();  
    } else if (document.mozCancelFullScreen) {  
      document.mozCancelFullScreen();  
    } else if (document.webkitCancelFullScreen) {  
      document.webkitCancelFullScreen();  
    }  
  }  
}