const fs = require('fs')


if (process.argv[2] == null) {
    console.log("No log file path specified.")
    process.exit()
}

var logFile = fs.readFileSync(process.argv[2]).toString()
// console.log(logFile);
var lines = logFile.split('\n')
var codeCounter = {}
lines.forEach(line => {
    if (line == "") {
        return
    }
    var result = line.split(' - ')[1];
    if (!Object.keys(codeCounter).includes(result)) {
        codeCounter[result] = 0
    }
    codeCounter[result]++
});
console.log(codeCounter);