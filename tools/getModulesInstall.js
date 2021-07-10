const fs = require('fs')

if (!process.argv[2]) {
    console.log("No CSV with modules to install specified.")
    process.exit()
}

if (!process.argv[3]) {
    console.log("No log file specified.")
    process.exit()
}

var modulesInstall = fs.readFileSync(process.argv[2]).toString().split('\n')
var logFile = fs.readFileSync(process.argv[3]).toString().split('\n')
logFileModules = logFile.filter((item) => {
    return item != ''
})
logFileModules = logFileModules.map((item) => {
    return item.split(' - ')[0]
})

modulesInstall = modulesInstall.filter((item) => {
    return !logFileModules.includes(item)
})

modulesInstall.forEach(module => {
    console.log(module);
});