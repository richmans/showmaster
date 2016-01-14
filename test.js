var ftdi = require("ftdi");

var device = new ftdi.FtdiDevice(0);


var universe = new Buffer(513, "binary");
universe.fill(0);
universe[1] = 255;

device.on("error", function(error) {
  console.log("Got an error :-(");
})


function startBreak() {
    console.log("Start Break");
    device.setBreak(function(err, something) {
      stopBreak();
  });
}
function stopBreak() {
    console.log("Stop Break");
     device.clearBreak(function(err, something) {
       write();
  });
}

function write() {
  console.log("Write");
  device.write(universe, function(err, results) {
     setTimeout(startBreak, 30);
  });
}

device.open({
  baudrate: 250000,
  databits: 8,
  stopbits: 2,
  parity: 'none',
}, function(error) {
  if ( error ) {
    console.log('failed to open: '+error);
  } else {
    console.log('open');
   startBreak();    
  }
});


