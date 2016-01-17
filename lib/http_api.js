var express  = require('express');
function HttpApi(showmaster) {
  this.showmaster = showmaster;
	var app = express();
  var apiRouter = this.getApiRouter();
	this.http = require('http').Server(app);
  app.use('/api', apiRouter);
	app.use(express.static(__dirname + "/../www"));
	this.http.listen(3000, function(){
	  console.log('listening on *:3000');
	});
}

HttpApi.prototype.getApiRouter = function() {
  var apiRouter = express.Router(); 
  apiRouter.route('/devices')
    .get(this.getDevices.bind(this));
    
  apiRouter.route('/devices/:device_id')
    .get(this.getDevice.bind(this));
  
  apiRouter.route('/connections')
    .get(this.getConnections.bind(this));
    
  apiRouter.route('/connections/:connection_id')
    .get(this.getConnection.bind(this));
  return apiRouter;
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

module.exports = HttpApi;