#!/usr/bin/env node

var ShowMaster = require("./lib/show_master.js");
input = "genesis";
if (process.argv.length > 2) {
  input = process.argv[2]
}
showMaster = new ShowMaster(input);

