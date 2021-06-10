const fs = require('fs')

if (!process.argv[2]) {
    console.log("No module name specified.")
    process.exit()
}
if (!process.argv[3]) {
    console.log("No analysis path specified.")
    process.exit()
}

const moduleName = process.argv[2]
const analysisPath = process.argv[3]
var analysis = fs.readFileSync(analysisPath).toString()
var regex = /\"requiredModule\": \"\..*\"/i
var newAnalysis = analysis.replace(regex, `\"requiredModule\": \"${moduleName}\"`)

fs.writeFileSync(analysisPath, newAnalysis)
