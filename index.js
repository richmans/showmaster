const events = require('events');
const util = require('util');

function OutputPort() {
	events.EventEmitter.call(this)
	this.value = 0.0;
	this.outputDestinations = {}
};

util.inherits(OutputPort, events.EventEmitter);

OutputPort.prototype.increment = function() {
	this.value += 1;
	this.emit("value", this.value);
};

OutputPort.prototype.update = function(newValue) {
	this.value = newValue;
	this.emit("value", this.value);
}

OutputPort.prototype.connect = function(inputPort) {
	connectionId = inputPort.connect(this);
}

OutputPort.prototype.registerConnection = function(connectionId, inputPort) {
	this.outputDestinations[connectionId] = inputPort;
}

OutputPort.prototype.unregisterConnection = function(connectionId) {
	delete this.outputDestinations[connectionId];
}

OutputPort.prototype.disconnect = function(connectionId) {
	var destination = this.outputDestinations[connectionId]
	if (destination == undefined) return;
	destination.disconnect(connectionId);
}

function InputPort(callback, aggregation) {
	this.callback = callback;
	this.inputs = {};
	this.inputSources = {};
	this.lastValue = 0;
	this.aggregation = aggregation;
}

InputPort.prototype.nextConnectionId = 0;

InputPort.prototype.connect = function(outputPort) {
	connectionId = InputPort.prototype.nextConnectionId;
	InputPort.prototype.nextConnectionId += 1;
	var subscriber =  this.newValue.bind(this, connectionId);
	this.inputs[connectionId] = 0;
	this.inputSources[connectionId] = [outputPort, subscriber];
	outputPort.on("value", subscriber);
	return connectionId;
}

InputPort.prototype.disconnect = function(connectionId) {
	var source = this.inputSources[connectionId][0];
	var subscriber = this.inputSources[connectionId][1];
	source.removeListener("value", subscriber)
	source.unregisterConnection(connectionId);
	delete this.inputs[connectionId];
	delete this.inputSources[connectionId];
}

InputPort.prototype.newValue = function(connectionId, newValue) {
	if (this.aggregation == "latest"){
		resultValue = newValue
	} else {
		resultValue = this.inputs[connectionId] = newValue;
		for (id in this.inputs) { 
			if (this.inputs[id] > resultValue) resultValue = this.inputs[id];
		}
	}
	if (resultValue != this.lastValue) {
		this.lastValue = resultValue;
		this.callback(resultValue);
	}
}



function Device() {
	this.inputPorts = {};
	this.outputPorts = {};
  this.id = Device.prototype.nextDeviceId;
  Device.prototype.nextDeviceId += 1;
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

function Dimmer() {
	Device.call(this)
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

function ShowMaster() {
	events.EventEmitter.call(this)
	mycallback = function(newValue) {
		this.emit("value", newValue);
	}.bind(this);

	mydimmer = new Dimmer();
	
	//dummy port to receive output from dimmer
	myresult  = new InputPort(mycallback, "latest");
	
	//get the dimmer ports
	dimmerintensity = mydimmer.inputPorts["intensity"];
	dimmerinput = mydimmer.inputPorts["input"];
	
	//dummy ports to provide input to dimmer
	this.dummyIntensity = new OutputPort();
	this.dummyInput = new OutputPort();
	
	// link up the dimmer with dummyports
	this.dummyIntensity.connect(mydimmer.inputPorts["intensity"]);
	this.dummyInput.connect(mydimmer.inputPorts["input"]);
	myresult.connect(mydimmer.outputPorts["output"]);

	// initial inputs
	this.dummyIntensity.update(0);
	this.dummyInput.update(0);
	

}
util.inherits(ShowMaster, events.EventEmitter);

function setupServer(showMaster) {
	var express  = require('express');
	var app = express();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);

	app.use(express.static(__dirname + "/www"));

	showMaster.on("value", function(value) {
		io.emit("output", value);
	})	

	io.on('connection', function(socket){
	  console.log('a user connected');
	  socket.on('disconnect', function(){
	     console.log('user disconnected');
	   });
		 
		socket.on("input1", function(v) {
			showMaster.dummyIntensity.update(v / 100);
		})
		socket.on("input2", function(v) {
			showMaster.dummyInput.update(v / 100);
		})
	});

	http.listen(3000, function(){
	  console.log('listening on *:3000');
	});
}

showMaster = new ShowMaster();
setupServer(showMaster);
