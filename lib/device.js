'use strict'
let _nextDeviceId = 0;
const InputPort = require("./input_port.js");
const OutputPort = require("./output_port.js");

class Device {
  constructor(showmaster) {
  	this.inputPorts = {};
  	this.outputPorts = {};
    this.attributes = {};
    this.showmaster = showmaster;
    this.id = Device.prototype.nextDeviceId;
    console.log("Registering device " + this.id);
  
    this.showmaster.devices[this.id] = this;
    Device.nextDeviceId += 1;
    
  }

  static get nextDeviceId() { return _nextDeviceId; }
  static set nextDeviceId(value) { _nextDeviceId = value; }
  
  set(name, value) {
    this.attributes[name] = value
    this.updateAttribute(name);
  }

  get(name) {
    return this.attributes[name]
  }

  // called when an attribute is updated. Override in subclasses
  updateAttribute(name) {
  
  }
  /* Connects the outputport of this device to the inputport of the otherdevice */
  connectTo(outputPortName, otherDeviceId, otherPortName) {
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
  connectFrom(inputPortName, otherDeviceId, otherPortName) {
    inputPort = this.inputPorts[inputPortName];
    if (inputPort == undefined) {console.log("cf inputPort " + inputPortName + " not found"); return 1;}
    otherDevice = this.showmaster.getDevice(otherDeviceId);
    if (otherDevice == undefined) {console.log("cf device " + otherDeviceId + " not found"); return 1;}
    otherPort = otherDevice.outputPorts[otherPortName];
    if (otherPort == undefined) {console.log("cf outputPort " + otherPortName + " not found"); return 1;}
    otherPort.connect(inputPort);
    return 0;
  }


  addInputPort(portName) {
  	this.inputPorts[portName] = new InputPort(this.newValue.bind(this, portName));
  }

  addOutputPort(portName) {
  	this.outputPorts[portName] = new OutputPort();
  }

  newValue(portName, value) {
	
  }
}
module.exports = Device;