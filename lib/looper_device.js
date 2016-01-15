'use strict';
const Device = require("./device.js");

class LooperDevice extends Device {
  constructor(showmaster) {
    super(showmaster);
    this.set("numOutputs", 3);
    this.index = 0;
    this.createdOutputs = 0;
    this.addInputPort("input")
    this.inputPorts["input"].aggregation = "all";
  }

  updateAttribute(name) {
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

  newValue(name, value) {
    this.outputPorts[this.index.toString()].update(0);
    this.index += 1;
    if (this.index >= this.maxOutput) this.index = 0;
    this.outputPorts[this.index.toString()].update(1);
  }
}
module.exports = LooperDevice;