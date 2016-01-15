'use strict'
const Device = require("./device.js");
const InputPort = require("./input_port.js");
const OutputPort = require("./output_port.js");

class Dimmer extends Device {
  constructor(showmaster) {
    super(showmaster);
  	this.addInputPort("intensity");
  	this.addInputPort("input");
  	this.addOutputPort("output");
  	this.intensity = 0;
  	this.input = 0;
  }


  newValue(portName, value) {
  	var intensity = this.inputPorts["intensity"].lastValue;
  	var input = this.inputPorts["input"].lastValue;
  	var outputValue = intensity * input;
   	this.outputPorts["output"].update(outputValue);
  }
}
module.exports = Dimmer;