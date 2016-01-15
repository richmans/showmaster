'use strict';
const Device = require("./device.js");
const InputPort = require("./input_port.js");
const OutputPort = require("./output_port.js");
const ftdi = require("ftdi");
class DmxOutputDevice extends Device {
  constructor(showmaster) {
    super(showmaster);
    for(var i = 0; i<512 ; i++) {
      this.addInputPort(i.toString());
    }
    this.startSerial();
  }

  startSerial() {
    this.universe = new Buffer(513, "binary")
  	this.universe.fill(0)
    console.log("Starting ftdi port");
    this.device = new ftdi.FtdiDevice(0);
    this.device.on('error', this.error.bind(this));
    this.device.open({
      baudrate: 250000,
      databits: 8,
      stopbits: 2,
      parity: 'none',
    },
    this.startOutput.bind(this));

  }

  error(e) {
    console.log("Error opening dmx output (Device " + this.id + " will act as dummy): " + e);
  }

  startOutput(err) {
    console.log("Starting DMX output on device " + this.id + ".");
    this.interval = setInterval(this.writeUniverse.bind(this), 30);
  }

  stopOutput() {
    clearInterval(this.interval);
  }

  writeUniverse() {
    // this is a great example of why js is not my favorite language
    this.device.setBreak(function() {
        this.device.clearBreak(function() {
            this.device.write(this.universe);
        }.bind(this));

    }.bind(this));
    //console.log(this.universe);  
  }

  newValue(portName, value) {
    //console.log("DMX port " + portName + " to value " + value * 255);
    this.universe[parseInt(portName)+1] = value * 255;
  }
}
module.exports = DmxOutputDevice;