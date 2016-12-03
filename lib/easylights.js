function Easylights(showmaster) {
  this.showmaster = showmaster
}

Easylights.prototype.load = function(json) {
  console.log("Loading easylight")
  this.setupBeat()
  this.setupDmx(json.dmx)
  this.loadChannels(json)
  this.loadGroups(json)
  this.loadPrograms(json)
  this.setupSockio(json)
}

Easylights.prototype.setupBeat = function() {
  var attrs={
    frequency: 0.083
  }
  console.log("Starting beat at 100bpm")
  this.showmaster.loadDevice("beat", "TimerDevice", attrs)
  
  attrs={
    frequency: 1 // 20hz
  }
  console.log("Starting tweener timer")
  this.showmaster.loadDevice("tween", "TimerDevice", attrs)
}

Easylights.prototype.setupSockio = function(json) {
  sockio = this.showmaster.loadDevice("sockio", "SockioDevice", {})
  console.log("Setting up sockio")
  for (deviceName in this.showmaster.devices) { 
    var device = this.showmaster.devices[deviceName]
    var controlDevices = ["loop", "set", "group"]
    if(controlDevices.indexOf(device.get("type"))>=0) {
      sockio.addOutputPort(deviceName)
      console.log("Connecting " + deviceName + " to sockio")
      this.showmaster.createConnection("sockio", deviceName, deviceName, "input")
    }
  }
  sockio.addInputPort("beat")
  sockio.addOutputPort("beatTap")
  this.showmaster.createConnection("beat", "output", "sockio", "beat")
  this.showmaster.createConnection("sockio", "beatTap", "beat", "frequency")
  
  sockio.inputPorts["beat"].aggregation = "all"
}

Easylights.prototype.setupDmx = function(json) {
  this.showmaster.loadDevice("dmx", "DmxOutputDevice", json)
}

Easylights.prototype.createLoopConnection = function(program, step, subProgram) {
  var programName = program.id
  var fade = program.attributes.fade
  var attrs = { fade: fade }
  var tweenName = programName + "-tween-" + subProgram
  if (fade == undefined || fade == 0){
    this.showmaster.createConnection(programName, step, subProgram, "input")
  } else {
    console.log("Creating tweener " + tweenName)
    this.showmaster.loadDevice(tweenName, "TweenerDevice", attrs)
    console.log("Connecting " + programName + " to " + tweenName)
    this.showmaster.createConnection(programName, step, tweenName, "input")
    console.log("Connecting " + tweenName + " to " + subProgram)    
    this.showmaster.createConnection(tweenName, "output", subProgram, "input")
  }
}

Easylights.prototype.loadPrograms = function(json) {
  for(programName in json.programs) {
    console.log("Loading program " + programName)
    var program = json.programs[programName]
    var deviceType = "Dimmer"
    if (program.type == "loop") {
      deviceType = "LooperDevice"
    }
    var attrs = {
      type: program.type,
      intensity: 1,
      numOutputs: program.subprograms.length,
      name: programName,
      fade: program.fade
    }
    programDevice = this.showmaster.loadDevice(programName, deviceType, attrs)
    for (step in program.subprograms) {
      subProgram = program.subprograms[step]
      if (program.type == "loop") {
        this.createLoopConnection(programDevice, step, subProgram)        
      } else {
        this.showmaster.createConnection(programName, "output", subProgram, "input")
      }
    }
    if (program.type == "loop") {
      console.log("looper " + programName + " beat hookup")
      this.showmaster.createConnection("beat", "output", programName, "beat")
    }
  }
}


Easylights.prototype.loadGroups = function(json) {
  for(group in json.groups) {
    var channels = json.groups[group]
    var attrs = {
      type: 'group',
      intensity: 1,
    }
    dimmer = this.showmaster.loadDevice(group, "Dimmer", attrs)
    for (channel in channels) {
      channel = channels[channel]
      this.showmaster.createConnection(group, "output", channel, "input")
    }
  }
}

Easylights.prototype.loadChannels = function(json) {
  for(channel in json.channels) {
    var dmxChannel = json.channels[channel]
    var attrs = {
      type: 'channel',
      intensity: 1,
    }
    dimmer = this.showmaster.loadDevice(channel, "Dimmer", attrs)
    this.showmaster.createConnection(channel, "output", "dmx", dmxChannel)
  }
}

module.exports = Easylights