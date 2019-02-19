const functions = require('firebase-functions');
const admin = require('firebase-admin');

//admin.initializeApp(functions.config().firebase);

//admin.initializeApp(functions.config().firebase);
admin.initializeApp(functions.config().firebase);
const db = admin.database();


/**
 * Receive data from pubsub, then 
 * Write telemetry raw data to bigquery
 * Maintain last data on firebase realtime database
 */
//const db = admin.database();

/**
 * Receive data from pubsub, then 
 * Write telemetry raw data to bigquery
 * Maintain last data on firebase realtime database
 */
exports.receiveTelemetry = functions.pubsub
  .topic('telemetry-topic')
  .onPublish(event => {

    console.log("Event !!!!! " + JSON.stringify(event));

    const attributes = event.attributes;
    //let message = event.data;
    let message = JSON.parse (new Buffer(event.data, 'base64').toString('ascii'));  
    //let textMessage = buff.toString('ascii');
    //messageObjet = JSON.parse(json)

    console.log("Message !!!!! " + JSON.stringify(message));
    
    const deviceId = attributes.deviceId;
    console.log("DeviceID !!!!! " + deviceId);

    /*const data = {
      humidity: message.hum,
      temp: message.temp,
      deviceId: deviceId,
      timestamp: 0
    };*/

    /*const data = {
     white: message.white,
     red: message.red,
     black: message.black,
     yellow: message.yellow
    };*/

     const data = {
       color: message.color,
     };

     console.log("Data !!!!! " + JSON.stringify(data));

    /*if (
      message.hum < 0 ||
      message.hum > 100 ||
      message.temp > 100 ||
      message.temp < -50
    ) {
      // Validate and do nothing
      return;
    }*/

    //return null; 
    return Promise.all([
      updateCurrentDataFirebase(data)
    ]);

  });


/*function updateCurrentDataFirebase(data) {
  return db.ref(`/devices/1`).set({
    humidity: data.humidity,
    temp: data.temp,
    lastTimestamp: 0
  });
}*/

/*function updateCurrentDataFirebase(data) {
  return db.ref(`/devices/1`).set({
    white: data.white,
    red: data.red,
    black: data.black,
    yellow: data.yellow
  });
}*/

function updateCurrentDataFirebase(data) {
  return db.ref(`/devices/1`).set({
    color: data.color,
   });
}

