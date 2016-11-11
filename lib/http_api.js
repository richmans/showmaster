var proxy = require('express-http-proxy');
var express  = require('express');
var bodyParser = require('body-parser');
var Device = require("./device.js");
var Connection = require("./connection.js");

function HttpApi(showmaster) {
  this.showmaster = showmaster;
	var app = express();
  var apiRouter = this.getApiRouter();
	this.http = require('http').Server(app);
  app.use(bodyParser.json());
  app.use('/api', apiRouter);
  app.use('/programs', express.static(__dirname + "/../programs"))
  
  if(showmaster.debug == true) {
    console.log("Debug mode")
    // proxy /react to a local react server (for debugging purposes)
  	app.use('/easylights', proxy('localhost:3000'))
    app.use('/static', proxy('localhost:3000', {
    forwardPath: function(req, res) {
      console.log(require('url').parse(req.url).path)
      return "/static" + require('url').parse(req.url).path;
    }}))
  }else{
    console.log("Production mode")
    app.use('/easylights', express.static(__dirname + "/../www/easylights/build"))
    app.use('/static', express.static(__dirname + "/../www/easylights/build/static"))
  }
	this.http.listen(3030, function(){
	  console.log('listening on *:3030');
	});
}

HttpApi.prototype.getApiRouter = function() {
  var apiRouter = express.Router(); 
  
  apiRouter.route('/devices')
    .get(this.getDevices.bind(this))
    .post(this.createDevice.bind(this));
    
  apiRouter.route('/devices/:device_id')
    .get(this.getDevice.bind(this))
    .delete(this.deleteDevice.bind(this));
  
  apiRouter.route('/connections')
    .get(this.getConnections.bind(this))
    .post(this.createConnection.bind(this));
    
  apiRouter.route('/connections/:connection_id')
    .get(this.getConnection.bind(this))
    .delete(this.deleteConnection.bind(this));
  
  apiRouter.route('/save/:filename')
    .get(this.save.bind(this));
    
  return apiRouter;
}


HttpApi.prototype.save = function(req, res) {
  var filename = req.params.filename
  // Let's check that ths filename has no funny business
  var regex = /^[a-zA-Z0-9_]+$/
  if(filename.match(regex) == null) {
    res.status(404).send("Resource not found.");
  }else {
    this.showmaster.save(filename);
    res.status(200).send("OK");
  }
}

HttpApi.prototype.deleteConnection = function(req,  res) {
  var conn = this.showmaster.getConnection(req.params.connection_id);
  if (conn == undefined) {
    res.status(404).send("Resource not found.");
  } else {
    conn.disconnect();
    res.sendStatus(200);
  }
}

HttpApi.prototype.createConnection = function(req, res) {
  i = req.body;
  console.log(req.body);
  
  conn = this.showmaster.createConnection(i["outputDeviceId"], i["outputPortName"], i["inputDeviceId"], i["inputPortName"]);
  res.json(conn);
}

HttpApi.prototype.getConnections = function(req, res) {
  res.json(this.showmaster.connections);
}

HttpApi.prototype.getConnection = function(req, res) {
  var connection = this.showmaster.getConnection(req.params.connection_id)
  if (connection == undefined) {
    res.status(404).send('Resource not found.');
  } else {
    res.json(connection);
  }
}

HttpApi.prototype.createDevice = function(req, res) {
  var i = req.body;
  device = this.showmaster.createDevice(i['type'], i['attributes']);
  res.json(device);
}

HttpApi.prototype.getDevices = function(req, res) {
  res.json(this.showmaster.devices);
}
HttpApi.prototype.getDevice = function(req, res) {
  var device = this.showmaster.getDevice(req.params.device_id)
  if (device == undefined) {
    res.status(404).send('Resource not found.');
  } else {
    res.json(device);
  }
}

HttpApi.prototype.deleteDevice = function(req,  res) {
  var device = this.showmaster.getDevice(req.params.device_id);
  if (device == undefined) {
    res.status(404).send("Resource not found.");
  } else {
    device.disconnect();
    delete this.showmaster.devices[device.id];
    res.sendStatus(200);
  }
}

module.exports = HttpApi;