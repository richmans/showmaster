var socket = io.connect();
console.log("Listening socket");

$(function() {
	$(".dial").knob({
		'change': function(v) {
			myname = this.i[0].id.split("-")[1];
    	socket.emit("input", {"port": myname, "value": v / 100});
		}
	});
  socket.on('output', function(message){
    portName = message["port"]
  	value = Math.round(message["value"] * 100);
  	$("#output-" + portName).val(value).trigger("change");
  });
});




