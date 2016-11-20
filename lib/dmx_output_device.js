var Device = require("./device.js");
var util = require('util');
const dgram = require('dgram');



function DmxOutputDevice(showmaster, attributes) {
  Device.call(this, showmaster, attributes)
  for(var i = 0; i<512 ; i++) {
    this.addInputPort(i.toString());
  }
  this.universe = new Buffer(512, "binary")
	this.universe.fill(0)
  
 	this.tryConnect();
}

util.inherits(DmxOutputDevice, Device);


DmxOutputDevice.prototype.error = function(e) {
  if (this.device != undefined) {
    this.device.close();
    this.device = undefined;
  }
  this.stopOutput();
  console.log("Error on dmx output (Device " + this.id + " will act as dummy): " + e);
  if (this.retryTimeout == undefined) {
    this.retryTimeout = setTimeout(this.tryConnect.bind(this), 10000);
  }
}

DmxOutputDevice.prototype.tryConnect = function() {
  this.retryTimeout = undefined;
  console.log("Starting dmx port");
  this.client = dgram.createSocket('udp4');
  this.startOutput();
}

DmxOutputDevice.prototype.startOutput = function() {
  console.log("Starting DMX output on device " + this.id + ".");
  this.interval = setInterval(this.writeUniverse.bind(this), 30);
}

DmxOutputDevice.prototype.stopOutput = function() {
  if (this.interval != undefined) {
    clearInterval(this.interval);
    this.interval = undefined;
  }
}

DmxOutputDevice.prototype.writeUniverse = function() {
  this.client.send(this.universe, 0, 512, this.attributes.port, this.attributes.host)
}

DmxOutputDevice.prototype.disconnect = function() {
  Device.super_.prototype.disconnect.apply(this);
  this.close();
}


DmxOutputDevice.prototype.newValue = function(portName, value) {
  this.universe[parseInt(portName)-1] = value * 255;
}

module.exports = DmxOutputDevice;