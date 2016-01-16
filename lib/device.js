var InputPort = require("./input_port.js");
var OutputPort = require("./output_port.js");
var util = require('util');

function Device(showmaster) {
	this.inputPorts = {};
	this.outputPorts = {};
  this.attributes = {};
  this.showmaster = showmaster;
  this.id = Device.prototype.nextDeviceId;
  console.log("Registering device " + this.id);
  
  this.showmaster.devices[this.id] = this;
  Device.prototype.nextDeviceId += 1;
}

Device.prototype.nextDeviceId = 0;

Device.prototype.set = function(name, value) {
  this.attributes[name] = value
  this.updateAttribute(name);
}

Device.prototype.get = function(name) {
  return this.attributes[name]
}

// called when an attribute is updated. Override in subclasses
Device.prototype.updateAttribute = function(name) {
  
}
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

module.exports = Device;