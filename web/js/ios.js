var socket = null;
var x0, x1, y0, y1 = 0;
var device__position = "portrait";

function Rotate() {
  let angle = '90';

  switch (device__position){
    case 'portrait':
      MakeLandscape();
      $('#img').height('600px');
      break;
    case 'landscape':
      MakePortrait();
      break;
  }
}

function Swipe() {
  socket.send(JSON.stringify({"whoyouare": "device", "toudid": $("img#img").attr('data-udid'), "action": "swipe", "x0": x0, "x1": x1, "y0": y0, "y1": y1}));
}

function StartSwipe(event) {
  x0 = Math.round(((event.pageX - $('img#img').offset().left)*93)/100);
  y0 = Math.round(((event.pageY - $('img#img').offset().top)*93)/100);
}

function StopSwipe(event) {
  x1 = Math.round(((event.pageX - $('img#img').offset().left)*93)/100);
  y1 = Math.round(((event.pageY - $('img#img').offset().top)*93)/100);

  if ((x0 > x1 + 50)||
      (y0 > y1 + 50)||
      (x1 > x0 + 50)||
      (y1 > y0 + 50)
    ) {
    Swipe();
  }
}

function MakePortrait() {
  socket.send(JSON.stringify({"whoyouare": "device", "toudid": $("img#img").attr('data-udid'), "action": "portrait"}));
}

function MakeLandscape() {
  socket.send(JSON.stringify({"whoyouare": "device", "toudid": $("img#img").attr('data-udid'), "action": "landscape"}));
}

function GoHome() {
  socket.send(JSON.stringify({"whoyouare": "device", "toudid": $("img#img").attr('data-udid'), "action": "home"}));
}

function Point(event) {
  let positionX = Math.round(((event.pageX - $('img#img').offset().left)*93)/100);
  let positionY = Math.round(((event.pageY - $('img#img').offset().top)*93)/100);

  socket.send(JSON.stringify({"whoyouare": "device", "toudid": $("img#img").attr('data-udid'), "action": "tap", x: positionX, y: positionY}));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function WebSocketTest() {
      if ("WebSocket" in window) {
         id = getRandomInt(100, 999);
         var img = document.getElementById("img");
         var udid = window.location.search.substr(1);
         socket = new WebSocket("ws://localhost:9030/:" + id + "/device");
         var ws = new ReconnectingWebSocket('ws://' + location.host + '/');
         
         $('#img').attr('data-udid', udid);
         document.getElementById("img").addEventListener("click" , Point);
         document.getElementById("img").addEventListener("mousedown" , StartSwipe);
         document.getElementById("img").addEventListener("mouseup" , StopSwipe);

         socket.onopen = function() {
            socket.send(JSON.stringify({"whoyouare": "device", "action": 'deviceconnected', 'udid': window.location.search.substr(1)}));
            console.log('Client connected to Server');
         }

         socket.onmessage = function (event) {
            response = JSON.parse(event.data);
            console.log(event);
            $('.loader').hide();
            $('.outer').show();
         }

         ws.onopen = function() {
             console.log("Socket is open");
         };

         ws.onmessage = function (evt) {
            response = JSON.parse(evt.data);
            if (response["data"].indexOf("ServerURLHere->") !== -1) {
              let broadcasting = response["data"].substring(response["data"].indexOf("ServerURLHere->") + "ServerURLHere->".length, response["data"].length);
              broadcasting = broadcasting.substring(0, broadcasting.indexOf("<-ServerURLHere"));
              console.log(broadcasting);
              img.src  = broadcasting.replace("8100", "9100");
              socket.send(JSON.stringify({"whoyouare": "device", "action": 'starttests', 'udid': window.location.search.substr(1)}));
            }
         };

         ws.onclose = function() {
         };
      } else {
         alert("WebSocket NOT supported by your Browser!");
      }
   }

