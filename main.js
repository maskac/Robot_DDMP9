addEventListener("load", init);
function init() {
  setInterval(update, 500);
  update();
}

function update() {
  fetchUsnul();
  fetchPlasil();
  fetchNightscout();
}

function fetchUsnul() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    console.log(Date.now() + " " + xhttp.readyState);
    if (xhttp.readyState == 4) {
      if (xhttp.status == 200) {
        var data = JSON.parse(xhttp.responseText);
        var element = document.getElementById("usnul");
        element.innerText = data.teplota;
        element.style.color = "#0000FF";
      } else {
        alert("Error: "+xhttp.status);
      }
    }
  };
  xhttp.open("GET","http://usnul.termo.cgcs.cz/vystup-json.php",true);
  xhttp.send();
}

function fetchPlasil() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    console.log(Date.now() + " " + xhttp.readyState);
    if (xhttp.readyState == 4) {
      if (xhttp.status == 200) {
        var data = JSON.parse(xhttp.responseText);
        var element = document.getElementById("plasil");
        element.innerText = data.teplota;
        element.style.color = "#0000FF";
      } else {
        alert("Error: "+xhttp.status);
      }
    }
  };
  xhttp.open("GET","http://plasil.termo.cgcs.cz/vystup-json.php",true);
  xhttp.send();
}

function fetchNightscout() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    console.log(Date.now() + " " + xhttp.readyState);
    if (xhttp.readyState == 4) {
      if (xhttp.status == 200) {
        var data = JSON.parse(xhttp.responseText);

        var element = document.getElementById("battery");
        element.innerText = data.bgs[0].battery;
        element.style.color = "#000000";

        var element2 = document.getElementById("sgv");
        var sgv = Number(data.bgs[0].sgv);
        element2.innerText = sgv;
        if (sgv < 4)
          element2.style.color = "#FF0000";
        if (sgv >= 4 && sgv < 9)
          element2.style.color = "#32cd32";
        if (sgv >= 9)
          element2.style.color = "#FFFF00";
      } else {
        //alert("Error: "+xhttp.status);
      }
    }
  };
  xhttp.open("GET","http://maska.nightscout.cz/pebble",true);
  xhttp.send();
}
