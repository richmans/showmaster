var Device = require("./device.js");
var util = require('util');

function TweenerDevice(showmaster, attributes) {
  this.tweenConnection = undefined
  Device.call(this, showmaster, attributes);
  this.addInputPort("input")
  this.addInputPort("tween")
  this.inputPorts["tween"].aggregation = "all"
  this.addOutputPort("output")
  this.targetValue = 0
}

util.inherits(TweenerDevice, Device);

TweenerDevice.prototype.updateAttribute = function(name) {
  if (name == "fade") {
    if (this.attributes.fade != undefined && this.attributes.fade != 0){
      this.tweenIncrements = 50.0 / this.attributes.fade
    } else {
      this.tweenIncrements = 0
    }
  }
}

TweenerDevice.prototype.activateTweener = function() {
  if(this.tweenConnection ==  undefined) {
    this.tweenConnection = this.showmaster.createConnection("tween", "output", this.id, "tween")
  }
}

TweenerDevice.prototype.deactivateTweener = function() {
  if(this.tweenConnection !=  undefined) {
    this.tweenConnection.disconnect()
    this.tweenConnection = undefined
  }
}

TweenerDevice.prototype.handleInput = function(value)  {
  this.targetValue = this.inputPorts["input"].lastValue;
  if (this.tweenIncrements == 0) {
    // no tweening
    this.outputPorts["output"].update(this.targetValue)
  } else if (this.targetValue != this.outputPorts["output"].value) {
    this.activateTweener()
  }
}

TweenerDevice.prototype.handleTween = function(value) {
  var currentValue = this.outputPorts["output"].value
  var newValue
  //console.log("TWEEEN " + this.id + " VAL " + currentValue + " TO " + this.targetValue)
  if (currentValue > this.targetValue) {
    newValue = Math.max(currentValue - this.tweenIncrements, this.targetValue)
  } else if (currentValue < this.targetValue) {
    newValue = Math.min(currentValue + this.tweenIncrements, this.targetValue)
  } else {
    this.deactivateTweener()
  }
  if(newValue == undefined) newValue = 0
  this.outputPorts["output"].update(newValue)
}

TweenerDevice.prototype.newValue = function(name, value) {
  if (name == "input") this.handleInput(value)
  if (name == "tween") this.handleTween(value)    
}

module.exports = TweenerDevice;