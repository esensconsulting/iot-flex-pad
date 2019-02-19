load('api_config.js');
load('api_mqtt.js');
load('api_timer.js');
load('api_dht.js');
load('api_config.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js');
load('api_dht.js');

let deviceName = Cfg.get('device.id');
let topic = '/devices/' + deviceName + '/events';

let isConnected = false;

let dhtPin = Cfg.get('app.dht');
let dht = DHT.create(dhtPin, DHT.DHT11);
let led = 13; 
let button = Cfg.get('pins.button');
print('Topic: ', topic);

let A0 = 26;
let A1 = 25;
let A2 = 34;
let A3 = 39;

let bouclier = {};

GPIO.set_mode(led, GPIO.MODE_OUTPUT);

function setWhithePunchHandler(){ 

  print('hello');
  GPIO.set_mode(A0, GPIO.MODE_INPUT);
  GPIO.set_pull(A0, GPIO.PULL_UP); 
  setShieldPunchHandler(A0);
  GPIO.enable_int(A0);
}


function setBlackPunchHandler(){ 
 GPIO.set_mode(A1, GPIO.MODE_INPUT);
 GPIO.set_pull(A1, GPIO.PULL_UP); 
 setShieldPunchHandler(A1);
 GPIO.enable_int(A1);
} 

function setYellowPunchHandler(){ 
 GPIO.set_mode(A2, GPIO.MODE_INPUT);
 GPIO.set_pull(A2, GPIO.PULL_UP); 
 setShieldPunchHandler(A2);
 GPIO.enable_int(A2);
} 

function setRedPunchHandler(){ 
 GPIO.set_mode(A3, GPIO.MODE_INPUT);
 GPIO.set_pull(A3, GPIO.PULL_UP); 
 setShieldPunchHandler(A3);
 GPIO.enable_int(A3);
} 

function inputToColor(input){
  if (input === A0)
    return "white"
  if (input === A1)
    return "black"
  if (input === A2)
    return "yellow"
  if (input === A3)
    return "red"    
}

function setShieldPunchHandler(input){ 
    GPIO.set_button_handler(input, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function(input) {
    print('down again');
    GPIO.toggle(led);
    publishPunch(inputToColor(input))
  }, null);
}


let buildDataPunch = function(color) {
  return JSON.stringify({
    white: color === 'white',
    red: color === 'red',
    black: color === 'black',
    yellow: color === 'yellow'
  });
};

let buildDataColor = function(color) {
  return JSON.stringify({
    color:color
  });
};

function publishPunch(color){
  print('punch data:', buildDataPunch(color));
  // let ok = MQTT.pub(topic, buildDataPunch(color));
  let ok = MQTT.pub(topic, buildDataColor(color));
  if (ok) {
    print('Published');
  } else {
    print('Error publishing');
  }
}/*


/*Timer.set(
  100,
  true,
  function() {
    if (isConnected) {
    publishPunch(getRandomColor());
    }
  },
  null
);*/

Timer.set(
  20*1000,
  true,
  function() {
    print('Info:', getInfo());
  },
  null
);

MQTT.setEventHandler(function(conn, ev) {
  if (ev === MQTT.EV_CONNACK) {
    print('CONNECTED');
    isConnected = true;
    publishData();
  }
}, null);


function publishData() {
  let ok = MQTT.pub(topic, getInfo());
  if (ok) {
    print('Published');
  } else {
    print('Error publishing');
  }
}

let getInfo = function() {
  return JSON.stringify({
    total_ram: Sys.total_ram() / 1024,
    free_ram: Sys.free_ram() / 1024,
    temp: dht.getTemp(),
    hum: dht.getHumidity()
  });
};

/*setWhithePunchHandler();
setBlackPunchHandler();
setYellowPunchHandler();
setRedPunchHandler();*/

/*function getRandomColor(){
 let colorArray = ['white', 'red','yellow', 'black' ];
 return colorArray[Math.floor(Math.random()*4)]
}*/

// Monitor network connectivity.
Net.setStatusEventHandler(function(ev, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    evs = 'DISCONNECTED';
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
  }
  print('== Net event:', ev, evs);
}, null);
