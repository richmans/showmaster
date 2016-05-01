minPort = 0;
maxPort = 45;
inputDevice = 1;
outputDevice = 2;
outputOffset = 0;
a = {}

for(i =minPort; i <= maxPort; i++){
  a[i] = {
    "id":i, 
    "outputDeviceId": outputDevice, 
    "outputPortName": (i+outputOffset).toString(), 
    "inputDeviceId": inputDevice, 
    "inputPortName": i.toString()
  };
}

console.log(JSON.stringify(a, null, 2))