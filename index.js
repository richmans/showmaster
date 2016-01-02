#!/usr/bin/env node
const events = require('events');
const util = require('util');

/********************** OUTPUT PORT ****************************/
function OutputPort() {
	events.EventEmitter.call(this)
	this.value = 0.0;
	this.outputDestinations = {}
};

util.inherits(OutputPort, events.EventEmitter);

OutputPort.prototype.update = function(newValue) {
	this.value = newValue;
	this.emit("value", this.value);
}

OutputPort.prototype.connect = function(inputPort) {
	connectionId = inputPort.connect(this);
}

OutputPort.prototype.registerConnection = function(connectionId, inputPort) {
  console.log("Register connection " + connectionId);
	this.outputDestinations[connectionId] = inputPort;
}

OutputPort.prototype.unregisterConnection = function(connectionId) {
	delete this.outputDestinations[connectionId];
}

OutputPort.prototype.disconnect = function(connectionId) {
	var destination = this.outputDestinations[connectionId]
	if (destination == undefined) return;
	destination.disconnect(connectionId);
}

/********************** INPUT PORT ****************************/
function InputPort(callback, aggregation) {
	this.callback = callback;
	this.inputs = {};
	this.inputSources = {};
	this.lastValue = 0;
	this.aggregation = aggregation;
}

InputPort.prototype.nextConnectionId = 0;

InputPort.prototype.connect = function(outputPort) {
	connectionId = InputPort.prototype.nextConnectionId;
	InputPort.prototype.nextConnectionId += 1;
	var subscriber =  this.newValue.bind(this, connectionId);
	this.inputs[connectionId] = 0;
	this.inputSources[connectionId] = [outputPort, subscriber];
	outputPort.on("value", subscriber);
	return connectionId;
}

InputPort.prototype.disconnect = function(connectionId) {
	var source = this.inputSources[connectionId][0];
	var subscriber = this.inputSources[connectionId][1];
	source.removeListener("value", subscriber)
	source.unregisterConnection(connectionId);
	delete this.inputs[connectionId];
	delete this.inputSources[connectionId];
}

InputPort.prototype.newValue = function(connectionId, newValue) {
  //console.log("Inputport value " + connectionId + ": " + newValue)
	if (this.aggregation == "latest"){
		resultValue = newValue
	} else {
		resultValue = this.inputs[connectionId] = newValue;
		for (id in this.inputs) { 
			if (this.inputs[id] > resultValue) resultValue = this.inputs[id];
		}
	}
	if (resultValue != this.lastValue) {
		this.lastValue = resultValue;
		this.callback(resultValue);
	}
}

/********************** DEVICE ****************************/

function Device(showmaster) {
	this.inputPorts = {};
	this.outputPorts = {};
  this.showmaster = showmaster;
  this.id = Device.prototype.nextDeviceId;
  console.log("Registering device " + this.id);
  
  this.showmaster.devices[this.id] = this;
  Device.prototype.nextDeviceId += 1;
}

Device.prototype.nextDeviceId = 0;

/* Connects the outputport of this device to the inputport of the otherdevice */
Device.prototype.connectTo = function(outputPortName, otherDeviceId, otherPortName) {
  outputPort = this.outputPorts[outputPortName];
  if (outputPort == undefined) {console.log("ct ouputPort " + outputPortName + " not found"); return 1;}
  otherDevice = this.showmaster.getDevice(otherDeviceId);
  if (otherDevice == undefined) {console.log("ct device " + otherDeviceId + " not found"); return 1;}
  otherPort = otherDevice.inputPorts[otherPortName];
  if (otherPort == undefined) {console.log("ct inputPort " + otherPortName + " not found"); return 1;}
  outputPort.connect(otherPort);
  return 0
}

/* Connects the inputport of this device to the outputport of the otherdevice */
Device.prototype.connectFrom = function(inputPortName, otherDeviceId, otherPortName) {
  inputPort = this.inputPorts[inputPortName];
  if (inputPort == undefined) {console.log("cf inputPort " + inputPortName + " not found"); return 1;}
  otherDevice = this.showmaster.getDevice(otherDeviceId);
  if (otherDevice == undefined) {console.log("cf device " + otherDeviceId + " not found"); return 1;}
  otherPort = otherDevice.outputPorts[otherPortName];
  if (otherPort == undefined) {console.log("cf outputPort " + otherPortName + " not found"); return 1;}
  otherPort.connect(inputPort);
  return 0;
}

Device.prototype.nextDevice = 0;

Device.prototype.addInputPort = function(portName) {
	this.inputPorts[portName] = new InputPort(this.newValue.bind(this, portName));
}

Device.prototype.addOutputPort = function(portName) {
	this.outputPorts[portName] = new OutputPort();
}

Device.prototype.newValue = function(portName, value) {
	
}

/********************** DIMMER DEVICE ****************************/
function Dimmer(showmaster) {
	Device.call(this, showmaster)
	this.addInputPort("intensity");
	this.addInputPort("input");
	this.addOutputPort("output");
	this.intensity = 0;
	this.input = 0;
}

util.inherits(Dimmer, Device);

Dimmer.prototype.newValue = function(portName, value) {
	var intensity = this.inputPorts["intensity"].lastValue;
	var input = this.inputPorts["input"].lastValue;
	var outputValue = intensity * input;
 	this.outputPorts["output"].update(outputValue);
}

/********************** SOCKIO DEVICE ****************************/
function SockioDevice(showmaster) {
	Device.call(this, showmaster)
	var express  = require('express');
	var app = express();
	var http = require('http').Server(app);
	this.io = require('socket.io')(http);
	app.use(express.static(__dirname + "/www"));

	this.io.on('connection', function(socket){
	  console.log('a user connected');
	  socket.on('disconnect', function(){
	     console.log('user disconnected');
	   });
		 
		socket.on("input", function(message) {
      console.log(" << " , message);
      outputPort = this.outputPorts[message['port']]
      if (outputPort != undefined) {
        outputPort.update( message["value"]);
      }else {
        console.log("Input for undefined outputport " + message['port'])
      };
		}.bind(this))
	}.bind(this));

	http.listen(3000, function(){
	  console.log('listening on *:3000');
	});
}

util.inherits(SockioDevice, Device);

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
}

SockioDevice.prototype.newValue = function(portName, value) {
  var message = {
      "port": portName, 
      "value": value
    };
  console.log(" >> " , message);
 	this.io.emit("output", message);
}



/********************** SHOWMASTER ****************************/
function ShowMaster() {
	events.EventEmitter.call(this)
  this.devices = {}
  
  new Dimmer(this);
	sockio = new SockioDevice(this);
  sockio.setupTestConnections();
}

util.inherits(ShowMaster, events.EventEmitter);

ShowMaster.prototype.getDevice = function(deviceId) {
  return this.devices[deviceId];
}
/********************** INITIALIZE ****************************/

showMaster = new ShowMaster();

