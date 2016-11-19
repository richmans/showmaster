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
var fs = require('fs');
var Easylights = require('./easylights.js');

function ShowMaster(name) {
  this.deviceTypes = {
    "Dimmer": Dimmer,
    "SockioDevice": SockioDevice,
    "DmxOutputDevice": DmxOutputDevice,
    "TimerDevice": TimerDevice,
    "LooperDevice": LooperDevice,
    "MidiInputDevice": MidiInputDevice
  }
	events.EventEmitter.call(this);
  this.debug=true;
  this.devices = {}
  this.connections = {}
  this.api = new HttpApi(this);
  this.nextConnectionId = 0;
  this.nextDeviceId = 0;
  this.json = {}
  result = this.load(name);
 
}

util.inherits(ShowMaster, events.EventEmitter);

ShowMaster.prototype.save = function(name) {
  json = {};
  json['devices'] = {}
  for(deviceId in this.devices) {
    json['devices'][deviceId] = this.devices[deviceId].toJSON();
  }
  json['connections'] = {};
  for(connectionId in this.connections) {
    json['connections'][connectionId] = this.connections[connectionId].toJSON();
  }
  var outputFilename = __dirname + "/../programs/" + name + ".json";
  fs.writeFile(outputFilename, JSON.stringify(json, null, 4), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + outputFilename);
    }
  }); 
}

ShowMaster.prototype.load = function(filename) {
  try {
    json = JSON.parse(require('fs').readFileSync(filename, 'utf8'));
  } catch (err) {
    console.log("Could not load file " + filename);
    return false;
  }
  
  if (json["format"] == undefined || json["format"] == "raw") {
    this.loadRaw(json);
  } else if (json["format"] == "easylights") {
    this.loadEasyLights(json);
  }
  console.log("* Load complete *")
  console.log("Devices: " + Object.keys(this.devices).length)
  console.log("Connections: "+ Object.keys(this.connections).length)
  this.json = json
  return true;
}

ShowMaster.prototype.loadEasyLights = function(json) {
  new Easylights(this).load(json)
}

ShowMaster.prototype.loadRaw = function(json) {
  console.log("Loading raw")
  for(deviceId in json.devices) {
    d = json.devices[deviceId];
    device = this.loadDevice(d["id"], d['type'], d['attributes']);
  }

  for(connectionId in json.connections) {
    c = json.connections[connectionId];
    connection = this.loadConnection(c["id"], c['outputDeviceId'], c['outputPortName'], c['inputDeviceId'], c['inputPortName'])
  }
}

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
  var id = this.getNextDeviceId();
  var device = this.loadDevice(id, deviceType, attributes);
  return device;
}

ShowMaster.prototype.loadDevice = function(deviceName, deviceType, attributes) {
  if (this.deviceTypes[deviceType] == undefined){
    console.log(deviceType + " type not found.");
    return undefined;
  } 
  
  if(deviceName != "" && this.devices[deviceName] != undefined) {
    console.log(deviceName + " is defined twice")
    return
  }
  
  if (this.deviceTypes[deviceType].super_.name != "Device") {
    console.log(deviceType + " is not a deviceType");
    return undefined;
  }
  
  var device = new this.deviceTypes[deviceType](this, attributes);
  device.id = deviceName;
  this.devices[deviceName] = device;
  return device
}
module.exports = ShowMaster;