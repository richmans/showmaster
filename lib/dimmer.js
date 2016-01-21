var Device = require("./device.js");
var util = require('util');

function Dimmer(showmaster, attributes) {
	Device.call(this, showmaster, attributes)
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
module.exports = Dimmer;