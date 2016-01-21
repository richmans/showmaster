var util = require('util');

function InputPort(callback, aggregation) {
	this.callback = callback;
	this.inputs = {};
	this.inputSources = {};
	this.lastValue = 0;
	this.aggregation = aggregation;
}

InputPort.prototype.disconnectAll = function(){
  for(var connectionId in this.inputs) {
    this.disconnect(connectionId);
  }
}

InputPort.prototype.connect = function(outputPort, connectionId) {
	var subscriber =  this.newValue.bind(this, connectionId);
	this.inputs[connectionId] = 0;
	this.inputSources[connectionId] = [outputPort, subscriber];
	outputPort.on("value", subscriber);
  outputPort.registerConnection(this, connectionId);
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
  //console.log("Inputport value " + connectionId + ": " + newValue)
	if (this.aggregation == "latest"){
		resultValue = newValue;
  } else if (this.aggregation == "all") {
    this.callback(resultValue);
    return;
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

module.exports = InputPort;