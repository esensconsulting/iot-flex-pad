const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
const db = admin.database();
const topic = 'flex-pad-data-topic-0';

exports.receiveTelemetry = functions.pubsub
  .topic(topic)
  .onPublish(event => {

    console.log("Event !!!!! " + JSON.stringify(event));
    const attributes = event.attributes;
    let message = JSON.parse (new Buffer(event.data, 'base64').toString('ascii'));  
    console.log("Message !!!!! " + JSON.stringify(message));
    const deviceId = attributes.deviceId;
    console.log("DeviceID !!!!! " + deviceId);
    const data = message;
    console.log("Data !!!!! " + JSON.stringify(data));

    return Promise.all([
      updateCurrentDataFirebase(data)
    ]);

  });

function updateCurrentDataFirebase(data) {
  return db.ref(`/devices/1`).set(data);
}

