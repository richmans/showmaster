var Device = require("./device.js");
var util = require('util');

function TimerDevice(showmaster) {
  Device.call(this, showmaster);
  this.addInputPort("frequency");
  this.addOutputPort("output");
}

util.inherits(TimerDevice, Device);

TimerDevice.prototype.newValue = function(portName, value) {
	if (portName == "frequency") {
    if(this.interval != null) clearInterval(this.interval);
    // value 0 turns the timer off
    if (value == 0) return;
	  var frequency = value * 10 // max 10 hz
    var delay = 1000 / frequency;
    this.interval = setInterval(this.beep.bind(this), delay);
	}
}

TimerDevice.prototype.beep = function() {
  this.outputPorts["output"].update(1);
}

module.exports = TimerDevice;