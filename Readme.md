# Showmaster
Showmaster is a framework for DMX controllers written in nodejs. Showmaster allows you to build a network of virtual devices. Each device has a number of input and output ports through which messages can be sent. These messages contain floating point values.

> This project is a work in progress. Features mentioned in this readme may not actually be implemented yet.

The goal is to have a service that runs on a computer with a DMX connector, that acts as a programmable DMX controller. 

## Predefined devices
Showmaster provides a number of predefined devices. 

* The *DMX Device* has 512 input ports, and writes the values of these ports to a serial connection. The inputs are expected to be floats between 0 and 1, and are multiplied by 255. This has been tested with the [Open DMX USB from Enttec](https://www.enttec.com/?main_menu=Products&pn=70303). It should be adaptable to other products.
* The *Sockio Device* has a variable number of input and output ports and provides a socketio service on which clients can create and destroy ports, and connect them to other ports in the network.
* The *Mixer Device* has 'input' and 'intensity' - inputs. These inputs are multiplied and sent to the 'output'-output. This allows you to have a global 'intensity' value and apply it to all channels.


## License
This work is licensed under the [MIT license](https://tldrlegal.com/license/mit-license)