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
let r=0;

let detect_threshold = 80;
let flexPadArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let modeFunc='NORMAL';
let test= 'test';

// Configuration de pins pour lire des tensions
let A2 = 34;
let A3 = 39;
let A4 = 36;
let A5 = 32;

ADC.enable(A2);
ADC.enable(A3);
ADC.enable(A4);
ADC.enable(A5);

// Configuration de pins en mode output pour controler le multiplexeur d'injection de tension
let R0 = 13;
let R1 = 12;

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

let buildDataFlexPadByButton = function(pushedButtonNumber) {

  if (modeFunc === 'TOGGLE'){
    clearFlexPadArray();
  }
  
  if (pushedButtonNumber !== null){
    flexPadArray[pushedButtonNumber] = 1;
  }

  return flexPadArray;
    
};

function formatDataFlexPad(array){
  return JSON.stringify({
    flexPadData: array    
  });
}

function clearFlexPadArray(){
  flexPadArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
}

function publishDataFlexPad(){
  
  let ok = MQTT.pub(topic,formatDataFlexPad(flexPadArray));

  if (ok) {
    print('Published');
  } else {
    print('Error publishing');
  }
}

function detectTouch(analogInput, column){
  if (ADC.read(analogInput) > detect_threshold) { 
    print('Button: ', getPushedButton(r, column));
    let pushedButtonNumber = getPushedButton(r, column);
    print('FlexPad data:', buildDataFlexPadByButton (pushedButtonNumber));
    buildDataFlexPadByButton (pushedButtonNumber);
    publishDataFlexPad();
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
    clearFlexPadArray();
    publishDataFlexPad();
    MQTT.sub('/devices/' + deviceName + '/commands/#', function(conn, topic, msg) {
      if (msg === 'TOGGLE' || msg === 'NORMAL'){
        modeFunc = '' + msg; 
      }  
      if (msg === 'CLEAR'){
        clearFlexPadArray();
        publishDataFlexPad();
      }
      print('Message', msg);
    }, null);

    isConnected = true;
  }
}, null);



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

/*let R2 = 27;
let R3 = 21;*/