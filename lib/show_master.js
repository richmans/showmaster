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
	events.EventEmitter.call(this)
  this.devices = {}
  this.connections = {}
  this.api = new HttpApi(this);
  // Following section is a test setup. This should be read from
  // some input file: json or database
  dimmer = new Dimmer(this);
  sockio = new SockioDevice(this, this.api);
  dmx = new DmxOutputDevice(this);
  timer = new TimerDevice(this);
  looper = new LooperDevice(this);
  looper.set("numOutputs", 4);
  
  // sockio device will be configured either through api or config
  // for now, we hook it up to all the ports of the dimmer device
  sockio.setupTestConnections();
  
  // setup test connection from dimmer output to channel 2  of the dmx
  dimmer.connectTo("output", dmx.id, "1");
  
  // Set up the looper to loop channels 3 through 6
  timer.connectTo("output", looper.id, "input");
  looper.connectTo("0", dmx.id, "2");
  looper.connectTo("1", dmx.id, "3");
  looper.connectTo("2", dmx.id, "4");
  looper.connectTo("3", dmx.id, "5");
  timer.connectFrom("frequency", sockio.id, "output3");
}

util.inherits(ShowMaster, events.EventEmitter);

ShowMaster.prototype.getDevice = function(deviceId) {
  return this.devices[deviceId];
}

ShowMaster.prototype.getConnection= function(connectionId) {
  return this.connections[connectionId];
}
module.exports = ShowMaster;