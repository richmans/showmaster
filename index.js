#!/usr/bin/env node

var ShowMaster = require("./lib/show_master.js");
var input = __dirname + "/programs/genesis.json";
if (process.argv.length > 2) {
  input = process.argv[2]
}
showMaster = new ShowMaster(input);

