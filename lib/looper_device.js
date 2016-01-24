var Device = require("./device.js");
var util = require('util');

function LooperDevice(showmaster, attributes) {
  Device.call(this, showmaster, attributes);
  this.createdOutputs = 0;
  if (attributes["numOutputs"] == undefined){
    this.set("numOutputs", 3);
  }else {
    this.updateAttribute("numOutputs");
  }
  this.index = 0;
  this.addInputPort("input")
  this.inputPorts["input"].aggregation = "all";

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

LooperDevice.prototype.newValue = function(name, value) {
  this.outputPorts[this.index.toString()].update(0);
  this.index += 1;
  if (this.index >= this.maxOutput) this.index = 0;
  this.outputPorts[this.index.toString()].update(1);
}

module.exports = LooperDevice;