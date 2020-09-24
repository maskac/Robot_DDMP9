// Using variable 'a - z' for function parameters, except "i" for fors
// Global vars:
var _mouseX = 0, _mouseY = 0, i = 0;
var keys=[32,87,65,83,68,81,69,82,37,38,39,40], commands=["m:stop","m:for","m:left","m:back","m:right","m:speed++","m:speed--","m:brake","c:hor--","c:vert++","c:hor++","c:vert--"]

// Has user storage support and does it contain something?
window.onload = function() {
    Resize();
    var status = document.getElementById("ioverlay_status");
    if (typeof(Storage) == "undefined") document.getElementById("ioverlay_settings").innerHTML = "Sorry, you can not use Image Overlay future. Your browser does not support Local Storage future. Please update your browser or get something new like Chrome.";
    else {
        if(localStorage.getItem("ioverlay") === null) status.innerHTML = "No previous upload found";
        else {
            status.innerHTML = "Found previous upload";
            SetIOverlay();
        }
        if(localStorage.getItem("tioverlay") !== null) TIOverlay('set');
    }
}

// Mouse X,Y
document.onmousemove = document.ondragover = function(e) {
    var event = e || window.event;
    _mouseX = event.clientX;
    _mouseY = event.clientY;
    document.getElementById("camera").innerHTML = _mouseX + " " + _mouseY;
}

// Resize automation
function Resize() {
    var can1 = document.getElementById("ioverlay_display"), can2 = document.getElementById("ioverlay_viewer"), Uwidth = window.innerWidth || document.body.clientWidth, Uheight = window.innerHeight || document.body.clientHeight, IOSheight = 0, IOS_header = document.getElementById("ioverlay_header").children;
    can1.width = Uwidth;
    can1.height = Uheight;
    Display('show','ioverlay_settings',false);
        IOSheight = IOS_header[0].offsetHeight;
        if(IOS_header[1].offsetHeight > IOS_header[2].offsetHeight) IOSheight += IOS_header[1].offsetHeight;
        else IOSheight += IOS_header[2].offsetHeight;
    Display('hide','ioverlay_settings',true);
    can2.width = (Uwidth * 0.5);
    can2.height = (Uheight * 0.75) - IOSheight;
}

// Shows/Hides menus
function Display(a,b,c) {
    var target = document.getElementById(b);
    if(c === false) target.style.visibility = "hidden";
    if(a == "show" && target.classList.contains("active") == false) target.classList.add("active");
    if(a == "hide") target.classList.remove("active");
    if(c === true) target.style.visibility = null;
}

// Sets opacity for overlays
function Opacity(d) {
    var opa = document.getElementById("menu_"+d+"_opacity").value;
    if(d.slice(-1) == 2) {
        d = d.slice(0, -1);
        document.getElementById("menu_"+d+"_opacity").value = opa;
    }
    else if (d !== "tioverlay") document.getElementById("menu_"+d+"2_opacity").value = opa;
    var target = document.getElementById(d);
    if(opa == 0) target.classList.remove("active");
    else {
        if(target.classList.contains("active") == false) target.classList.add("active");
        target.style.opacity = (opa / 100);
    }
    if(d == "tioverlay" && opa == 0) document.getElementById("tioverlay_status").innerHTML = "Input mode: keyboard";
    else if(d == "tioverlay") document.getElementById("tioverlay_status").innerHTML = "Input mode: touch";
}

// Save IOverlay https://jsfiddle.net/cv0gx6yL/
function SaveIOverlay(e) {
    var canvasS = document.getElementById("ioverlay_save"), ctxS = canvasS.getContext("2d"), img = document.getElementById("ioverlay_save2"), status = document.getElementById("ioverlay_status");
    try {
        var file = e.files[0];
        if (file.type.indexOf("image") < 0) {
            status.innerHTML = "Upload only image filetypes.";
            return;
        }
        var fReader = new FileReader();
        fReader.onload = function() {
            img.src = fReader.result;
            canvasS.width = img.width;
            canvasS.height = img.height;
            ctxS.drawImage(img, 0, 0);
            var dataURL = canvasS.toDataURL("image/png");
            localStorage.setItem("ioverlay", dataURL);
            SetIOverlay();
        };
        fReader.readAsDataURL(file);
        status.innerHTML = "Upload successful."
    }
    catch(err) {
        status.innerHTML = err.message;
    }
}

// Set both canvases with scaling (and everyone likes tons of mathematical equations)
function SetIOverlay() {
    var ioverlay = new Image(), can1 = document.getElementById("ioverlay_display"), ctx1 = can1.getContext("2d"), can1W = can1.width, can1H = can1.height, can2 = document.getElementById("ioverlay_viewer"), ctx2 = can2.getContext("2d"), can2W = can2.width, can2H = can2.height, scale = 0;
    ioverlay.onload = function() {
        ctx1.clearRect(0,0,can1W,can1H);
        ctx2.clearRect(0,0,can2W,can2H);
        ctx1.drawImage(ioverlay, 0, 0); // UNDONE - missing settings                	context.drawImage(img,x,y,width,height);
        if(ioverlay.width <= can2W && ioverlay.height <= can2H) ctx2.drawImage(ioverlay, Math.floor((can2W - ioverlay.width)/2), Math.floor((can2H - ioverlay.height)/2));
        else if((ioverlay.width / can2W) == (ioverlay.height / can2H)) {
            scale = ioverlay.width / can2W;
            ctx2.drawImage(ioverlay, 0, 0, (ioverlay.width / scale), (ioverlay.height / scale));
        }
        else if(ioverlay.width > can2W || (ioverlay.width / can2W) >= (ioverlay.height / can2H)) {  // Does the second condition need to be?
            scale = ioverlay.width / can2W;
            ctx2.drawImage(ioverlay, 0, Math.floor((can2H - ioverlay.height / scale)/2), (ioverlay.width / scale), (ioverlay.height / scale));
        }
        else {
            scale = ioverlay.height / can2H;
            ctx2.drawImage(ioverlay, Math.floor((can2W - ioverlay.width / scale)/2), 0, (ioverlay.width / scale), (ioverlay.height / scale));
        }
    };
    ioverlay.src = localStorage.getItem("ioverlay"); 
}

// Screenshot
function MakeScreenshot() { alert("It's just a prank bro, but we got a solution, maybe..."); }

// Customizing TIOverlay
function TIOverlay(f,g) {
    var settings = "", order = ["ti_arrows","ti_joystick","ti_speed","ti_switches"], temp, target;
    switch(f) {
    case "load":
        Display('show','menu_leave');
        Display('hide','menu');
        for(i = 0; i < order.length; i++) {
                target = document.getElementById(order[i]);
                target.setAttribute("draggable","true");
        }
        break;
    case "move":
        document.getElementById(g).style.top = _mouseY + "px";
        document.getElementById(g).style.left = _mouseX + "px";
        break;
    case "unload":
        Display('hide','menu_leave');
        for(i = 0; i < order.length; i++) {
                target = document.getElementById(order[i]);
                target.setAttribute("draggable","false");
        }
        settings = ""; // save positions
        for(i = 0; i < order.length; i++) settings += document.getElementById(order[i]).offsetTop + "," + document.getElementById(order[i]).offsetLeft + ";";
        localStorage.setItem("tioverlay",settings);
        break;
    case "set":
        settings = localStorage.getItem("tioverlay").split(";");
        for(i = 0; i < order.length; i++) {
            temp = settings[i].split(",");
            document.getElementById(order[i]).style.top = temp[0];
            document.getElementById(order[i]).style.left = temp[1];
        }
        break;
    }
}

// Communication to and from robot
function Sendkey(l) {
    for(i = 0; i < keys.length; i++) {
        if(keys[i] == l) {
            //console.log(l);
            //console.log(commands[i]);
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {}
            var web = "http://192.168.212.57/test/ajax.php?action=arduino_forward&content=" + encodeURIComponent(commands[i]);
            console.log(web);
            xhttp.open("GET", web, true);
            xhttp.send();
            break;
        }
    }
}
