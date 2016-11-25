var Device = require("./device.js");
var util = require('util');

function LooperDevice(showmaster, attributes) {
  this.createdOutputs = 0;
  this.index = 0;
  Device.call(this, showmaster, attributes);
  if (attributes["numOutputs"] == undefined){
    this.set("numOutputs", 3);
  }else {
    //this.updateAttribute("numOutputs");
  }

  this.addInputPort("input")
  this.addInputPort("beat")
  this.inputPorts["beat"].aggregation = "all";
}

util.inherits(LooperDevice, Device);

LooperDevice.prototype.updateAttribute = function(name) {
  
  if (name == "numOutputs") {
    desiredOutputs = this.get("numOutputs");
    while (desiredOutputs > this.createdOutputs) {
      this.addOutputPort(this.createdOutputs);
      this.createdOutputs += 1;
    }
    this.maxOutput = desiredOutputs;
  }
}

LooperDevice.prototype.handleBeat = function() {
  var dimValue = this.inputPorts["input"].lastValue;
  if (dimValue == 0) return 0;
  this.outputPorts[this.index.toString()].update(0);
  this.index += 1;
  if (this.index >= this.maxOutput) this.index = 0;
  return dimValue;
}

LooperDevice.prototype.handleInput = function(value)  {
  this.outputPorts[this.index.toString()].update(value);
}

LooperDevice.prototype.newValue = function(name, value) {
  var dimValue = value;
  if (name == "beat") dimValue = this.handleBeat()
  this.handleInput(dimValue)
}

module.exports = LooperDevice;