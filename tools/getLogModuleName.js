const fs = require('fs')

if (process.argv[2] == null) {
    console.log("No log line path specified.")
    process.exit()
}

var moduleName = process.argv[2].split(' - ')[0];
console.log(moduleName);