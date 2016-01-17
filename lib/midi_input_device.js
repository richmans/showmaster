var Device = require("./device.js");
var util = require('util');
var midi = require("midi");

function MidiInputDevice(showmaster) {
	Device.call(this, showmaster)
  this.input = new midi.input();
  this.input.on('message', this.onmessage.bind(this));
  this.input.openPort(0);
  this.addOutputPort("0");
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