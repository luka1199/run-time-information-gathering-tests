const getTestScript = require("./testScriptParser");
const path = require('path')
const fs = require('fs');

const cleanupKeywords = ['eslint', 'xo', 'jshint', 'jslint', 'dtslint', 'standard', 'semistandard', 'c8', 'coffeelint']

/* path to your package.json file */
const packageJsonPath = process.argv[2]

getTestScript(packageJsonPath).then((script) => {
    script = cleanupScript(script)

    var packageJson = loadPackageJson(packageJsonPath)
    packageJson['scripts']['__test__'] = script
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
})

function loadPackageJson(path) {
    var json = JSON.parse(fs.readFileSync(path))
    return json
}

function cleanupScript(script) {
    var splitScript = script.split(" && ")
    var transformedScript = splitScript
    cleanupKeywords.forEach(keyword => {
        transformedScript = transformedScript.filter((x) => {
            return !(x.toLowerCase().includes(keyword))
        })
    });

    return transformedScript.join(" && ")
}

module.exports = {
    cleanupScript
}