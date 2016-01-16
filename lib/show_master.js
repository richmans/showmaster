var Device = require("./show_master.js");
var Connection = require("./connection.js");
var Dimmer = require("./dimmer.js");
var SockioDevice = require("./sockio_device.js");
var DmxOutputDevice = require("./dmx_output_device.js");
var TimerDevice = require("./timer_device.js");
var LooperDevice = require("./looper_device.js");
var HttpApi = require("./http_api.js");
var util = require('util');
var events = require('events');

function ShowMaster() {
  this.deviceTypes = {
    "Dimmer": Dimmer,
    "SockioDevice": SockioDevice,
    "DmxOutputDevice": DmxOutputDevice,
    "TimerDevice": TimerDevice,
    "LooperDevice": LooperDevice,
  }
	events.EventEmitter.call(this)
  this.devices = {}
  this.connections = {}
  this.api = new HttpApi(this);
  // Following section is a test setup. This should be read from
  // some input file: json or database
  dimmer = new Dimmer(this);
  sockio = new SockioDevice(this);
  dmx = new DmxOutputDevice(this);
  timer = new TimerDevice(this);
  looper = new LooperDevice(this);
  var numLoopOutputs = 25
  looper.set("numOutputs", numLoopOutputs);
  
  // sockio device will be configured either through api or config
  // for now, we hook it up to all the ports of the dimmer device
  sockio.setupTestConnections();
  
  // setup test connection from dimmer output to channel 1  of the dmx
  dimmer.connectTo("output", dmx.id, "0");
  
  // Set up the looper to loop channels 2 through 26
  timer.connectTo("output", looper.id, "input");
  for(var i = 0; i < numLoopOutputs; i++) {
    looper.connectTo(i.toString(), dmx.id, (i+1).toString());
  };
  timer.connectFrom("frequency", sockio.id, "output3");
}

util.inherits(ShowMaster, events.EventEmitter);

ShowMaster.prototype.getDevice = function(deviceId) {
  return this.devices[deviceId];
}

ShowMaster.prototype.getConnection= function(connectionId) {
  return this.connections[connectionId];
}

ShowMaster.prototype.createDevice = function(deviceType) {
  if (this.deviceTypes[deviceType] == undefined){
    console.log(deviceType + " type not found.");
    return undefined;
  } 
  if (this.deviceTypes[deviceType].super_.name != "Device") {
    console.log(deviceType + " is not a deviceType");
    return undefined;
  }
  return new this.deviceTypes[deviceType](this);
}
module.exports = ShowMaster;