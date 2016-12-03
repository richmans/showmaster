# Showmaster
Showmaster is a framework for DMX controllers written in nodejs. Showmaster allows you to build a network of virtual devices. Each device has a number of input and output ports through which messages can be sent. These messages contain floating point values.

Easylights uses the showmaster framework to implement an intuitive gui to control a 
lightshow. 

> This project is a work in progress. Features mentioned in this readme may not actually be implemented yet.

The goal is to have a service that runs on a computer with a DMX connector, that acts as a programmable DMX controller. 

![Easylights controlpanel](screenshot.png?raw=true "The easylights control panel")

## Predefined devices
Showmaster provides a number of predefined devices. 

* The *DMX Output Device* has 512 input ports, and writes the values of these ports to a serial connection. The inputs are expected to be floats between 0 and 1, and are multiplied by 255. This has been tested with the [Open DMX USB from Enttec](https://www.enttec.com/?main_menu=Products&pn=70303). It should be adaptable to other products.
* The *Sockio Device* has a variable number of input and output ports and provides a socketio service on which clients can create and destroy ports, and connect them to other ports in the network. This can also be used as an api to implement real-time clients.
* The *Mixer Device* has 'input' and 'intensity' - inputs. These inputs are multiplied and sent to the 'output'-output. This allows you to have a global 'intensity' value and apply it to all channels.
* The *Looper Device* has x outputs and 1 input. It activates its outputs 1 by one. When it retrieves a value on the input, it will proceed to the next output.
* The *Timer Device* has a 'frequency' input, and will deliver timed values on its output (hint: use this combined with the looper device!)


## License
This work is licensed under the [MIT license](https://tldrlegal.com/license/mit-license)

## FTDI
The ftdi driver is no longer called directly from the nodejs framework. Instead, showmaster uses the [dmxMaster](https://github.com/richmans/dmxmaster) project to output dmx.

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


In addition, there is the *sockio api*, which communicates with the sockio device. If you have a sockio device in your network, opening sockio will establish a connection to that device. You will then receive updates for both input and output ports of the device, so you can update your GUI in realtime. You can also emit updates back for outputports.

Messages in the sockio have either 'input' or 'output' as the event name, and the data is a hash containing 'port' and 'value'

    { port: 'output1', value: 0.7457431142388481 }
    
Look in www/knobs for examples on how to use this.

## Installation
Assuming you have nodejs installed on osx or linux:

    git clone https://github.com/richmans/showmaster.git
    cd showmaster
    npm install . -g
    showmaster
