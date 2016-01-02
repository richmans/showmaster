var socket = io.connect();
console.log("Listening socket");

$(function() {
	$(".dial").knob({
		'change': function(v) {
			myname = this.i[0].id;
			socket.emit(myname, v);
		}
	});
  socket.on('output', function(value){
  	value = Math.round(value *100);
  	$("#output1").val(value).trigger("change");
  	$scope.outputValue = value;
  });
});




