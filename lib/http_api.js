function HttpApi(showmaster) {
  this.showmaster = showmaster;
	var express  = require('express');
	var app = express();
	this.http = require('http').Server(app);
	app.use(express.static(__dirname + "/../www"));
	this.http.listen(3000, function(){
	  console.log('listening on *:3000');
	});
}
module.exports = HttpApi;