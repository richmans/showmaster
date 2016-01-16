function Connection(showmaster, outputDeviceId, outputPortName, inputDeviceId, inputPortName) {
	this.inputDeviceId = inputDeviceId;
	this.inputPortName = inputPortName;
	this.outputDeviceId = outputDeviceId;
	this.outputPortName = outputPortName;
  this.showmaster = showmaster;
  this.setId();
  this.connect();
}

Connection.prototype.setId = function() {
  this.id = Connection.prototype.nextConnectionId;
  console.log("Registering connection " + this.id);
  Connection.prototype.nextConnectionId += 1;  
  this.showmaster.connections[this.id] = this;
}

Connection.prototype.connect = function() {
  this.inputDevice = this.showmaster.getDevice(this.inputDeviceId);
  if (this.inputDevice == undefined) {console.log("connect inputDevice " + this.inputDeviceId + " not found"); return 1;}
  this.outputDevice = this.showmaster.getDevice(this.outputDeviceId);
  if (this.outputDevice == undefined) {console.log("connect inputDevice " + this.outputDeviceId + " not found"); return 1;}
  this.inputPort = this.inputDevice.inputPorts[this.inputPortName];
  if (this.inputPort == undefined) {console.log("connect inputPort " + this.inputPortName + " not found"); return 1;}
  this.outputPort = this.outputDevice.outputPorts[this.outputPortName];
  if (this.outputPort == undefined) {console.log("connect outputPort " + this.outputPortName + " not found"); return 1;}
  this.inputPort.connect(this.outputPort, this.id);
  return 0;
}

Connection.prototype.disconnect = function() {
  this.inputPort.disconnect(this.id);
  delete this.showmaster.connections[this.id]
}
Connection.prototype.nextConnectionId = 0;
module.exports = Connection;