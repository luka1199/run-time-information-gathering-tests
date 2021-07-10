const fs = require('fs')

if (process.argv[2] == null) {
    console.log("No log line path specified.")
    process.exit()
}

var code = process.argv[2].split(' - ')[1];
console.log(code);