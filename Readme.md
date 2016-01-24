# Showmaster
Showmaster is a framework for DMX controllers written in nodejs. Showmaster allows you to build a network of virtual devices. Each device has a number of input and output ports through which messages can be sent. These messages contain floating point values.

> This project is a work in progress. Features mentioned in this readme may not actually be implemented yet.

The goal is to have a service that runs on a computer with a DMX connector, that acts as a programmable DMX controller. 

## Predefined devices
Showmaster provides a number of predefined devices. 

* The *DMX Output Device* has 512 input ports, and writes the values of these ports to a serial connection. The inputs are expected to be floats between 0 and 1, and are multiplied by 255. This has been tested with the [Open DMX USB from Enttec](https://www.enttec.com/?main_menu=Products&pn=70303). It should be adaptable to other products.
* The *Sockio Device* has a variable number of input and output ports and provides a socketio service on which clients can create and destroy ports, and connect them to other ports in the network.
* The *Mixer Device* has 'input' and 'intensity' - inputs. These inputs are multiplied and sent to the 'output'-output. This allows you to have a global 'intensity' value and apply it to all channels.


## License
This work is licensed under the [MIT license](https://tldrlegal.com/license/mit-license)

## FTDI
I had a little trouble getting the ftdi library to work with my current nodejs (0.12). It wouldn't install by default, but i found a git branch that works, forked it and added some functionality. It should install automatically.


## API
The api is used to manipulate the network that is being run by showmaster. This network consists of virtual devices. Each device has input ports and output ports. An output port can be connected up to an input port by creating a connection. So there are two types of resources: Devices and Connections. Each resource can be GETted, POSTed or DELETEd with the expected result.

    GET /api/devices/1 => {id:1, type:LooperDevice, attributes: {numOutputs: 5}}
    GET /api/devices/ => ALL devices
    POST /api/devices {type:LooperDevice}
    DELETE /api/devices/1
    
    GET /api/connections/3 => {id:3, input: {device:3, port:"signal"}, output: {device: 4, port:"4"}}
    GET /api/connections/ => ALL connections
    POST /api/connections {input: {device:3, port:"signal"}, output: {device: 4, port:"4"}}
    DELETE /api/connections/3


In addition, there is the sockio api, which communicates with the sockio device. If you have a sockio device in your network, opening sockio will establish a connection to that device. You will then receive updates for both input and output ports of the device, so you can update your GUI in realtime. You can also emit updates back for outputports.

Messages in the sockio have either 'input' or 'output' as the event name, and the data is a hash containing 'port' and 'value'

    { port: 'output1', value: 0.7457431142388481 }
    
Look in www/js/main.js for examples on how to use this.

## Installation
Assuming you have nodejs 0.12 installed on osx or linux:

    git clone https://github.com/richmans/showmaster.git
    cd showmaster
    npm install . -g
    showmaster
