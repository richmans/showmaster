'use strict';
const events = require("events");
class OutputPort extends events.EventEmitter {
  constructor() {
    super()
    this.value = 0.0;
    this.outputDestinations = {};
  }

  update(newValue) {
  	this.value = newValue;
  	this.emit("value", this.value);
  }

  connect(inputPort) {
  	connectionId = inputPort.connect(this);
  }

  registerConnection(connectionId, inputPort) {
    console.log("Register connection " + connectionId);
  	this.outputDestinations[connectionId] = inputPort;
  }

  unregisterConnection(connectionId) {
  	delete this.outputDestinations[connectionId];
  }

  disconnect(connectionId) {
  	var destination = this.outputDestinations[connectionId];
  	if (destination == undefined) return;
  	destination.disconnect(connectionId);
  }
}
module.exports = OutputPort;