document.addEventListener('DOMContentLoaded', function() {
  const db = firebase.database();
  // Create listeners
  const devicesRef = db.ref('/devices/1/flexPadData/');
  // Register functions that update with last devices state
  devicesRef.on('value', function(snapshot) {
    let flexPadData = snapshot.val();
    let padsEl = document.getElementById('pads');
    padsEl.innerHTML = '';
    console.log(flexPadData);  

  for (var pad in flexPadData) {
    let div = document.createElement('div');
    console.log(pad);
    div.style = 'flex: 1 0 21%; marging: 1px; height:150px; background:' + getColor(flexPadData[pad]) + '; border-color: black';
    padsEl.appendChild(div);
  }
  });

});

function getColor(n){
   if (n === 1) {
     return 'red';
   }  
   return 'white';
}
