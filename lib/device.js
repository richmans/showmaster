var InputPort = require("./input_port.js");
var OutputPort = require("./output_port.js");
var Connection = require("./connection.js");
var util = require('util');

function Device(showmaster, attributes) {
	this.inputPorts = {};
	this.outputPorts = {};
  if (attributes == undefined) attributes = {};
  this.attributes = attributes;
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
  this.showmaster.createConnection(this.id, outputPortName, otherDeviceId, otherPortName);
}

/* Connects the inputport of this device to the outputport of the otherdevice */
Device.prototype.connectFrom = function(inputPortName, otherDeviceId, otherPortName) {
  this.showmaster.createConnection(otherDeviceId, otherPortName, this.id, inputPortName);
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

Device.prototype.disconnect = function() {
  for (var portName in this.inputPorts) {
    this.inputPorts[portName].disconnectAll();
  }
  for (var portName in this.outputPorts) {
    this.outputPorts[portName].disconnectAll();
  }
}

Device.prototype.toJSON = function() {
  return {
    "id": this.id,
    "attributes": this.attributes,
    "type": this.constructor.name,
  };
}

module.exports = Device;