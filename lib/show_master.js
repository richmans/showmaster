var Device = require("./show_master.js");
var Connection = require("./connection.js");
var Dimmer = require("./dimmer.js");
var SockioDevice = require("./sockio_device.js");
var DmxOutputDevice = require("./dmx_output_device.js");
var MidiInputDevice = require("./midi_input_device.js");
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
  this.nextConnectionId = 0;
  this.nextDeviceId = 0;
  // Following section is a test setup. This should be read from
  // some input file: json or database
  dimmer = new Dimmer(this);
  sockio = new SockioDevice(this);
  dmx = new DmxOutputDevice(this);
  timer = new TimerDevice(this);
  looper = new LooperDevice(this);
  midi = new MidiInputDevice(this);
  
  var numLoopOutputs = 25
  looper.set("numOutputs", numLoopOutputs);
  
  // sockio device will be configured either through api or config
  // for now, we hook it up to all the ports of the dimmer device
  sockio.setupTestConnections();
  
  midi.connectTo("0", dimmer.id, "input");
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

ShowMaster.prototype.getNextConnectionId = function() {
  result = this.nextConnectionId;
  this.nextConnectionId += 1;
  return result;
}

ShowMaster.prototype.getNextDeviceId = function() {
  result = this.nextDeviceId;
  this.nextDeviceId += 1;
  return result;
}

ShowMaster.prototype.getDevice = function(deviceId) {
  return this.devices[deviceId];
}

ShowMaster.prototype.getConnection= function(connectionId) {
  return this.connections[connectionId];
}

ShowMaster.prototype.createConnection = function(outputDeviceId, outputPortName, inputDeviceId, inputPortName) {
  var id = this.getNextConnectionId();
  return this.loadConnection(id, outputDeviceId, outputPortName, inputDeviceId, inputPortName);
}

ShowMaster.prototype.loadConnection = function(id, outputDeviceId, outputPortName, inputDeviceId, inputPortName) {
  var con = new Connection(this, id, outputDeviceId, outputPortName, inputDeviceId, inputPortName);
  this.connections[id] = con;
  return con;
}

ShowMaster.prototype.createDevice = function(deviceType, attributes) {
  if (this.deviceTypes[deviceType] == undefined){
    console.log(deviceType + " type not found.");
    return undefined;
  } 
  if (this.deviceTypes[deviceType].super_.name != "Device") {
    console.log(deviceType + " is not a deviceType");
    return undefined;
  }
  var id = this.getNextDeviceId();
  var device = new this.deviceTypes[deviceType](this, id, attributes);
  this.devices[id] = device;
  return device;
}
module.exports = ShowMaster;