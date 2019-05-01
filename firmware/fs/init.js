load('api_config.js');
load('api_mqtt.js');
load('api_timer.js');
load('api_dht.js');
load('api_config.js');
load('api_gpio.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js');
load('api_dht.js');
load('api_adc.js');

let deviceName = Cfg.get('device.id');
let topic = '/devices/' + deviceName + '/events';
let isConnected = false;
let dhtPin = Cfg.get('app.dht');
let dht = DHT.create(dhtPin, DHT.DHT11);

let led = 13; 
let button = Cfg.get('pins.button');
print('Topic: ', topic);

let A2 = 34;
let A3 = 39;
let A4 = 36;
let A5 = 32;

let R0 = 13;
let R1 = 12;
let R2 = 27;
let R3 = 21;

let r=0;

let detect_threshold = 80;
let flexPadArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let modeFunc='NORMAL';
let test= 'test';

ADC.enable(A2);
ADC.enable(A3);
ADC.enable(A4);
ADC.enable(A5);

GPIO.set_mode(R0, GPIO.MODE_OUTPUT);
GPIO.set_mode(R1, GPIO.MODE_OUTPUT);


function setRow(r){
  let bArray = numberToBinaryArray(r);
  writeToRowSelector(bArray[0], bArray[1]);
}

function writeToRowSelector(i1, i0){
  GPIO.write(R0, i0);
  GPIO.write(R1, i1);
}

function numberToBinaryArray(n){
  if (n === 0) return [0,0];
  if (n === 1) return [0,1];
  if (n === 2) return [1,0];
  if (n === 3) return [1,1];
  return [0,0];
}

function getPushedButton(r,c){

  if (r === 0  && c === 0) return 0;
  if (r === 0  && c === 1) return 1;
  if (r === 0  && c === 2) return 2;
  if (r === 0  && c === 3) return 3;
  if (r === 1  && c === 0) return 4;
  if (r === 1  && c === 1) return 5;
  if (r === 1  && c === 2) return 6;
  if (r === 1  && c === 3) return 7;
  if (r === 2  && c === 0) return 8;
  if (r === 2  && c === 1) return 9;
  if (r === 2  && c === 2) return 10;
  if (r === 2  && c === 3) return 11;
  if (r === 3  && c === 0) return 12;
  if (r === 3  && c === 1) return 13;
  if (r === 3  && c === 2) return 14;
  if (r === 3  && c === 3) return 15;

}

function printVoltages(){
  print('C0:', ADC.read(A5), ' C1:', ADC.read(A4) , 'C2:', ADC.read(A3), ' C3', ADC.read(A2), 'R: ', r);
}

let buildDataFlexPad = function(pushedButtonNumber) {

  print('mode arribe',  modeFunc);
  if (modeFunc === 'TOGGLE'){
    flexPadArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  }
  
  flexPadArray[pushedButtonNumber] = 1;

  return JSON.stringify({
    flexPadData: flexPadArray    
  });
};

function publishDataFlexPad(pushedButtonNumber){
  print('FlexPad data:', buildDataFlexPad (pushedButtonNumber));
  let ok = MQTT.pub(topic, buildDataFlexPad (pushedButtonNumber));
  if (ok) {
    print('Published');
  } else {
    print('Error publishing');
  }
}

function detectTouch(analogInput, column){
  if (ADC.read(analogInput) > detect_threshold) { 
    print('Button: ', getPushedButton(r, column));
    publishDataFlexPad(getPushedButton(r, column));
  }
}
 

Timer.set(
  10,
  true,
  function() {
    setRow(r);
    detectTouch(A5,0);
    detectTouch(A4,1);
    detectTouch(A3,2);
    detectTouch(A2,3);
    // printVoltages();
    r++;
    if (r > 3) r = 0;
  },
  null
);

MQTT.setEventHandler(function(conn, ev) {
  if (ev === MQTT.EV_CONNACK) {
    print('CONNECTED');
    publishData();
    MQTT.sub('/devices/' + deviceName + '/commands/#', function(conn, topic, msg) {
      if (msg === 'TOGGLE' || msg === 'NORMAL'){
        modeFunc = '' + msg; 
        print('el test', test);
        print('el mode', modeFunc);
      }  
      print('Message', msg);
    }, null);

    isConnected = true;
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
