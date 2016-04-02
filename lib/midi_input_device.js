var Device = require("./device.js");
var util = require('util');
var midi = require("midi");

function MidiInputDevice(showmaster, attributes) {
	Device.call(this, showmaster, attributes)
  for (i=0; i< 128; i++) {
      this.addOutputPort(i.toString());
  }
  this.portNumber = this.attributes["port"] || 0;
  this.input = new midi.input();
  this.tryConnect();
  this.input.on('message', this.onmessage.bind(this));
  this.input.on("error", this.error.bind(this));
  
}

util.inherits(MidiInputDevice, Device);

MidiInputDevice.prototype.error = function() {
  console.log("Midi input lost, will try to reconnect");
  this.tryConnect();
}

MidiInputDevice.prototype.tryConnect = function() {
  if(this.input.getPortCount() == 0) {
    setTimeout(this.tryConnect.bind(this), 10000);
    return;
  }
  this.input.openPort(this.portNumber);
  console.log("Midi port connected");
}

MidiInputDevice.prototype.onmessage = function(deltaTime, midiMessage) {
  if (this.attributes['debug'] == true) console.log(midiMessage);
  channel = midiMessage[1]
  if (this.outputPorts[channel] != undefined) {
    value = midiMessage[2] / 127;
    this.outputPorts[channel].update(value);
  }
}

MidiInputDevice.prototype.disconnect = function() {
  Device.super_.prototype.disconnect.apply(this);
  this.close();
}

MidiInputDevice.prototype.close = function() {
  this.input.closePort();
}

module.exports = MidiInputDevice;