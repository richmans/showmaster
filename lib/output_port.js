var Device = require("./device.js");
var util = require('util');
var events = require('events');

function OutputPort() {
	events.EventEmitter.call(this)
	this.value = 0.0;
	this.outputDestinations = {}
};

util.inherits(OutputPort, events.EventEmitter);

OutputPort.prototype.update = function(newValue) {
	this.value = newValue;
	this.emit("value", this.value);
}

OutputPort.prototype.registerConnection = function(connectionId, inputPort) {
	this.outputDestinations[connectionId] = inputPort;
}

OutputPort.prototype.unregisterConnection = function(connectionId) {
	delete this.outputDestinations[connectionId];
}

OutputPort.prototype.disconnectAll = function(){
  for(var connectionId in this.outputDestinations) {
    this.disconnect(connectionId);
  }
}

OutputPort.prototype.disconnect = function(connectionId) {
	var destination = this.outputDestinations[connectionId]
	if (destination == undefined) return;
	destination.disconnect(connectionId);
}

module.exports = OutputPort;