var Device = require("./device.js");
var util = require('util');

function SockioDevice(showmaster, attributes) {
	Device.call(this, showmaster, attributes)
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

SockioDevice.prototype.updateAttribute = function(name) {
  
  if (name == "inputs") {
    desiredInputs = this.get("inputs");
    //remove unwanted inputs
    for(inputName in this.inputPorts) {
      if (desiredInputs.indexOf(inputName) == -1) {
       this.inputPorts[inputName].disconnectAll();
       delete this.inputPorts[inputName];
     }
    }
    //create extra inputs
    for(inputIndex in desiredInputs) {
      inputName = desiredInputs[inputIndex];
      if (this.inputPorts[inputName] == undefined) {
        this.addInputPort(inputName);
      }
    }
  }
  
  if (name == "outputs") {
    desiredOutputs = this.get("outputs");
    //remove unwanted outputs
    for(outputName in this.outputPorts) {
      if (desiredOutputs.indexOf(outputName) == -1) {
       this.outputPorts[outputName].disconnectAll();
       delete this.outputPorts[outputName];
      }
    }
    //create extra outputs
    for(outputIndex in desiredOutputs) {
      outputName = desiredOutputs[outputIndex];
      if (this.outputPorts[outputName] == undefined) {
        this.addOutputPort(outputName);
      }
    }
  }
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