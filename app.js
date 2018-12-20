var iotf = require("ibmiotf");
var io = require("socket.io")(4000);

/* Watson IoT config */
var device_config = require("./device.json");
var app_config = require("./app.json");

/* Device Emulation (In our case a raspberry pi & sensor) */
var deviceClient = new iotf.IotfManagedDevice(device_config);

/* Application (Your front-end) */
var appClient = new iotf.IotfApplication(app_config);

/* Setting the log level to trace. By default its 'warn' */
//deviceClient.log.setLevel('debug');

appClient.connect();
deviceClient.connect();

/* When your application has connected, setup listeners and callbacks. */
appClient.on("connect", function () {
  console.log("Connected the application.");
  
  /* Listen for temperature event on device types of IBM-KTH-Demo and where the device ID is 0. */
  appClient.subscribeToDeviceEvents("IBM-KTH-Demo", "0", "temperature");
  
  /* On a temperature event, insert the new data. */
  appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {
    console.log("Device Event from :: "+deviceType+" : "+deviceId+" of event "+eventType+" with payload : "+payload);
    
    /* Socket.io broadcast of newly arrived data. */
    io.emit('broadcast', JSON.parse(payload).number);
  });
});

/* When your device has connected, setup listeners and callbacks. */
deviceClient.on('connect', function(){
  console.log("Connected the device.");
	var rc = deviceClient.manage(4000, false, true);

  /* Update the device location, long-lat. */
  deviceClient.updateLocation(77.598838,12.96829);
  
  /* Hoisting. */
  setInterval(DemoData, 1500);
});

/* We have no action, however you can setup action listeners. */
deviceClient.on('dmAction', function(request){
  console.log('Action : '+request.Action);
});

/* Send spoofed data. */
function DemoData() {
   var data = {
      text: "demo_data",
      number: Math.random() * 20
   };
  deviceClient.publish('temperature', 'json', JSON.stringify(data), 0);
}


/* Redundancies. */
deviceClient.on('disconnect', function(){
  console.log('Disconnected from IoTF');
});

deviceClient.on('error', function (argument) {
	console.log(argument);
	process.exit(1);
});



