'use strict';
const Device  = require('./device.js');
class TimerDevice extends Device {
  constructor(showmaster) {
    super(showmaster);
    this.addInputPort("frequency");
    this.addOutputPort("output");
  }

  newValue(portName, value) {
  	if (portName == "frequency") {
      if(this.interval != null) clearInterval(this.interval);
      // value 0 turns the timer off
      if (value == 0) return;
  	  var frequency = value * 10 // max 10 hz
      var delay = 1000 / frequency;
      this.interval = setInterval(this.beep.bind(this), delay);
  	}
  }

  beep() {
    this.outputPorts["output"].update(1);
  }
}
module.exports = TimerDevice;