#!/usr/bin/env node
const events = require('events');
const util = require('util');
const ftdi = require('ftdi');

require('lib/input_port.js');
require('lib/output_port.js');

/********************** DEVICE ****************************/

function Device(showmaster) {
	this.inputPorts = {};
	this.outputPorts = {};
  this.attributes = {};
  this.showmaster = showmaster;
  this.id = Device.prototype.nextDeviceId;
  console.log("Registering device " + this.id);
  
  this.showmaster.devices[this.id] = this;
  Device.prototype.nextDeviceId += 1;
}

Device.prototype.nextDeviceId = 0;

Device.prototype.set = function(name, value) {
  this.attributes[name] = value
  this.updateAttribute(name);
}

Device.prototype.get = function(name) {
  return this.attributes[name]
}

// called when an attribute is updated. Override in subclasses
Device.prototype.updateAttribute = function(name) {
  
}
/* Connects the outputport of this device to the inputport of the otherdevice */
Device.prototype.connectTo = function(outputPortName, otherDeviceId, otherPortName) {
  outputPort = this.outputPorts[outputPortName];
  if (outputPort == undefined) {console.log("ct ouputPort " + outputPortName + " not found"); return 1;}
  otherDevice = this.showmaster.getDevice(otherDeviceId);
  if (otherDevice == undefined) {console.log("ct device " + otherDeviceId + " not found"); return 1;}
  otherPort = otherDevice.inputPorts[otherPortName];
  if (otherPort == undefined) {console.log("ct inputPort " + otherPortName + " not found"); return 1;}
  outputPort.connect(otherPort);
  return 0
}

/* Connects the inputport of this device to the outputport of the otherdevice */
Device.prototype.connectFrom = function(inputPortName, otherDeviceId, otherPortName) {
  inputPort = this.inputPorts[inputPortName];
  if (inputPort == undefined) {console.log("cf inputPort " + inputPortName + " not found"); return 1;}
  otherDevice = this.showmaster.getDevice(otherDeviceId);
  if (otherDevice == undefined) {console.log("cf device " + otherDeviceId + " not found"); return 1;}
  otherPort = otherDevice.outputPorts[otherPortName];
  if (otherPort == undefined) {console.log("cf outputPort " + otherPortName + " not found"); return 1;}
  otherPort.connect(inputPort);
  return 0;
}

Device.prototype.nextDevice = 0;

Device.prototype.addInputPort = function(portName) {
	this.inputPorts[portName] = new InputPort(this.newValue.bind(this, portName));
}

Device.prototype.addOutputPort = function(portName) {
	this.outputPorts[portName] = new OutputPort();
}

Device.prototype.newValue = function(portName, value) {
	
}

/********************** DIMMER DEVICE ****************************/
function Dimmer(showmaster) {
	Device.call(this, showmaster)
	this.addInputPort("intensity");
	this.addInputPort("input");
	this.addOutputPort("output");
	this.intensity = 0;
	this.input = 0;
}

util.inherits(Dimmer, Device);

Dimmer.prototype.newValue = function(portName, value) {
	var intensity = this.inputPorts["intensity"].lastValue;
	var input = this.inputPorts["input"].lastValue;
	var outputValue = intensity * input;
 	this.outputPorts["output"].update(outputValue);
}

/********************** LOOPER DEVICE ****************************/
function LooperDevice(showmaster) {
  Device.call(this, showmaster);
  this.set("numOutputs", 3);
  this.index = 0;
  this.createdOutputs = 0;
  this.addInputPort("input")
  this.inputPorts["input"].aggregation = "all";
}

util.inherits(LooperDevice, Device);

LooperDevice.prototype.updateAttribute = function(name) {
  
  if (name == "numOutputs") {
    desiredOutputs = this.get("numOutputs");
    while (desiredOutputs > this.createdOutputs) {
      console.log("Adding looper output " + this.createdOutputs);
      this.addOutputPort(this.createdOutputs);
      this.createdOutputs += 1;
    }
    this.maxOutput = desiredOutputs;
  }
}

LooperDevice.prototype.newValue = function(name, value) {
  this.outputPorts[this.index.toString()].update(0);
  this.index += 1;
  if (this.index >= this.maxOutput) this.index = 0;
  this.outputPorts[this.index.toString()].update(1);
}

/********************** TIMER DEVICE ****************************/
function TimerDevice(showmaster) {
  Device.call(this, showmaster);
  this.addInputPort("frequency");
  this.addOutputPort("output");
}

util.inherits(TimerDevice, Device);

TimerDevice.prototype.newValue = function(portName, value) {
	if (portName == "frequency") {
    if(this.interval != null) clearInterval(this.interval);
    // value 0 turns the timer off
    if (value == 0) return;
	  var frequency = value * 10 // max 10 hz
    var delay = 1000 / frequency;
    this.interval = setInterval(this.beep.bind(this), delay);
	}
}

TimerDevice.prototype.beep = function() {
  this.outputPorts["output"].update(1);
}
/********************** DMX DEVICE ****************************/
function DmxOutputDevice(showmaster) {
  Device.call(this, showmaster)
  for(var i = 0; i<512 ; i++) {
    this.addInputPort(i.toString());
  }
  this.startSerial();
	
}

util.inherits(DmxOutputDevice, Device);

DmxOutputDevice.prototype.startSerial = function() {
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

DmxOutputDevice.prototype.error = function(e) {
  console.log("Error opening dmx output (Device " + this.id + " will act as dummy): " + e);
}

DmxOutputDevice.prototype.startOutput = function(err) {
  console.log("Starting DMX output on device " + this.id + ".");
  this.interval = setInterval(this.writeUniverse.bind(this), 30);
}

DmxOutputDevice.prototype.stopOutput = function() {
  clearInterval(this.interval);
}

DmxOutputDevice.prototype.writeUniverse = function() {
  // this is a great example of why js is not my favorite language
  this.device.setBreak(function() {
      this.device.clearBreak(function() {
          this.device.write(this.universe);
      }.bind(this));

  }.bind(this));
  //console.log(this.universe);  
}

DmxOutputDevice.prototype.newValue = function(portName, value) {
  //console.log("DMX port " + portName + " to value " + value * 255);
  this.universe[parseInt(portName)+1] = value * 255;
}

/********************** SOCKIO DEVICE ****************************/
function SockioDevice(showmaster) {
	Device.call(this, showmaster)
	var express  = require('express');
	var app = express();
	var http = require('http').Server(app);
	this.io = require('socket.io')(http);
	app.use(express.static(__dirname + "/www"));

	this.io.on('connection', function(socket){
	  console.log('a user connected');
    this.sendInitialValues();
	  socket.on('disconnect', function(){
	     console.log('user disconnected');
	   });
		 
		socket.on("output", function(message) {
      console.log(" << " , message);
      socket.broadcast.emit("output", {"port": message["port"], "value": message["value"]});
      outputPort = this.outputPorts[message['port']]
      if (outputPort != undefined) {
        outputPort.update( message["value"]);
      }else {
        console.log("Input for undefined outputport " + message['port'])
      };
		}.bind(this))
	}.bind(this));

	http.listen(3000, function(){
	  console.log('listening on *:3000');
	});
}

util.inherits(SockioDevice, Device);

SockioDevice.prototype.sendInitialValues = function() {
  for (var key in this.outputPorts) {
    this.sendOutputValue(key, this.outputPorts[key].value);
  }
  for (var key in this.inputPorts) {
    this.newValue(key, this.inputPorts[key].lastValue);
  }
}
// this sets up some connections to a mixer device for testing
// In the future, these ports are created and connected by api calls
SockioDevice.prototype.setupTestConnections = function() {
  // create an outputport on this device
  this.addOutputPort("output1");
  // send the data to the input port of the mixer device
  this.connectTo("output1", 0, "input");
  // create an outputport on this device
  this.addOutputPort("output2");
  // send the data to the intensity port of the mixer device
  this.connectTo("output2", 0, "intensity");
  // create an input port of this device
  this.addInputPort("input1");
  // retrieve the data from the mixer output port
  this.connectFrom("input1", 0, "output");
  // add an extra output port
  this.addOutputPort("output3");
}


SockioDevice.prototype.sendOutputValue = function(portName, value) {
  var message = {
      "port": portName, 
      "value": value
    };
  console.log(" >> " , message);
 	this.io.emit("output", message);
}

SockioDevice.prototype.newValue = function(portName, value) {
  var message = {
      "port": portName, 
      "value": value
    };
  console.log(" >> " , message);
 	this.io.emit("input", message);
}



/********************** SHOWMASTER ****************************/
function ShowMaster() {
	events.EventEmitter.call(this)
  this.devices = {}
  
  // Following section is a test setup. This should be read from
  // some input file: json or database
  dimmer = new Dimmer(this);
  sockio = new SockioDevice(this);
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
/********************** INITIALIZE ****************************/

showMaster = new ShowMaster();

