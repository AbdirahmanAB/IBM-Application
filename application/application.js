var iotf = require("ibmiotf");
const axios = require('axios');
var EventEmitter = require('events');

class Application extends EventEmitter {
  constructor(org, key, token) {
    /* Call super to define this. */
    super();
    
    /* that is used to access this in other scopes below this one. */
    var that = this;
    
    /* This is our config for Watson IoT! */
    const app_config = {
      "org": org,
      "id": "0",
      "domain": "internetofthings.ibmcloud.com",
      "auth-key": key,
      "auth-token": token
    };
    
    /* Application (Your front-end) */
    this.app_client = new iotf.IotfApplication(app_config);
    this.app_client.connect();
    
    const url = 'https://iot-display.herokuapp.com/display/get/5e8c8382c5c0f600242851f4';
    const getu = async url => {
      try {
        const response = await axios.get(url);
        const myData = response.data.display.message.text;
        myData = JSON.stringify(myData);
        that.app_client.publishDeviceCommand("IBM-KTH","0", "currentMessage", "json", myData);
      } catch (error) {
        console.error(error);
      }
    };

    /* When your application has connected, setup listeners and callbacks. */
    this.app_client.on("connect", function () {
      console.log("Connected the application.");
      
      /* Subscribe to temperature event on device types of IBM-KTH-Demo and where the device ID is 0. */
      that.app_client.subscribeToDeviceEvents("IBM-KTH", "0", "getCurrentMessage");
      
      /* On a data recieved, emit event. */
      that.app_client.on("deviceEvent", async function (deviceType, deviceId, eventType, format, payload) {
        //console.log("Device Event from :: " +deviceType + " : " + deviceId + " of event " + eventType + " with payload : " + payload);
        getu(url);
      });
    });
  }
}

module.exports = Application;






