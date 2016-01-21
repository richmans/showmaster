var Device = require("./device.js");
var util = require('util');
var midi = require("midi");

function MidiInputDevice(showmaster, attributes) {
	Device.call(this, showmaster, attributes)
  this.input = new midi.input();
  this.addOutputPort("0");
  if(this.input.getPortCount() == 0) {
    console.log("No midi port found, midi device will act as dummy");
    return;
  }
  this.input.on('message', this.onmessage.bind(this));
  this.input.openPort(0);
  
}

util.inherits(MidiInputDevice, Device);

MidiInputDevice.prototype.onmessage = function(deltaTime, midiMessage) {
  channel = midiMessage[1]
  if (this.outputPorts[channel] != undefined) {
    value = midiMessage[2] / 127;
    this.outputPorts[channel].update(value);
  }
}

MidiInputDevice.prototype.close = function() {
  this.input.closePort();
}

module.exports = MidiInputDevice;