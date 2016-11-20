var Device = require("./device.js");
var util = require('util');

function TimerDevice(showmaster, attributes) {
  Device.call(this, showmaster, attributes);
  this.addInputPort("frequency");
  this.addOutputPort("output");
  if (attributes.frequency != undefined) {
    this.setFrequency(attributes.frequency)
  }
}

util.inherits(TimerDevice, Device);

TimerDevice.prototype.newValue = function(portName, value) {
	if (portName == "frequency") {
    this.setFrequency(value)
	}
}

TimerDevice.prototype.setFrequency = function(value) {
  if(this.interval != null) clearInterval(this.interval);
  // value 0 turns the timer off
  this.frequency = value
  if (value == 0) return;
  frequency = value * 20 // max 20 hz
  var delay = 1000 / frequency;
  this.interval = setInterval(this.beep.bind(this), delay);
}

TimerDevice.prototype.beep = function() {
  this.outputPorts["output"].update(this.frequency);
}

TimerDevice.prototype.stop = function() {
  if(this.interval != null) clearInterval(this.interval);
}

module.exports = TimerDevice;