var Device = require("./device.js");
var util = require('util');

function SockioDevice(showmaster) {
	Device.call(this, showmaster)
  var api = showmaster.api
	this.io = require('socket.io')(api.http);
  
	this.io.on('connection', function(socket){
	  console.log('a user connected');
    this.sendInitialValues();
	  socket.on('disconnect', function(){
	     console.log('user disconnected');
	   });
		 
		socket.on("output", function(message) {
      console.log(" << " , message);
      socket.broadcast.emit("output", {"port": message["port"], "value": message["value"]});
      outputPort = this.outputPorts[message['port']]
      if (outputPort != undefined) {
        outputPort.update( message["value"]);
      }else {
        console.log("Input for undefined outputport " + message['port'])
      };
		}.bind(this))
	}.bind(this));


}

util.inherits(SockioDevice, Device);

SockioDevice.prototype.sendInitialValues = function() {
  for (var key in this.outputPorts) {
    this.sendOutputValue(key, this.outputPorts[key].value);
  }
  for (var key in this.inputPorts) {
    this.newValue(key, this.inputPorts[key].lastValue);
  }
}
// this sets up some connections to a mixer device for testing
// In the future, these ports are created and connected by api calls
SockioDevice.prototype.setupTestConnections = function() {
  // create an outputport on this device
  this.addOutputPort("output1");
  // send the data to the input port of the mixer device
  this.connectTo("output1", 0, "input");
  // create an outputport on this device
  this.addOutputPort("output2");
  // send the data to the intensity port of the mixer device
  this.connectTo("output2", 0, "intensity");
  // create an input port of this device
  this.addInputPort("input1");
  // retrieve the data from the mixer output port
  this.connectFrom("input1", 0, "output");
  // add an extra output port
  this.addOutputPort("output3");
}


SockioDevice.prototype.sendOutputValue = function(portName, value) {
  var message = {
      "port": portName, 
      "value": value
    };
  console.log(" >> " , message);
 	this.io.emit("output", message);
}

SockioDevice.prototype.newValue = function(portName, value) {
  var message = {
      "port": portName, 
      "value": value
    };
  console.log(" >> " , message);
 	this.io.emit("input", message);
}
module.exports = SockioDevice;