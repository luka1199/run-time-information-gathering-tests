const getTestScript = require("./testScriptParser");
const path = require('path')
const fs = require('fs');

const rootPath = path.join(__dirname, '..')
const testPath = path.join(rootPath, 'bin/test.sh')
const testFrameworks = {
    'mocha': 'node_modules/mocha/bin/mocha',
    'tap': 'node_modules/tap/bin/run.js',
    "ava": "node_modules/ava/entrypoints/cli.mjs",
    "karma": "node_modules/karma/bin/karma",
    "node": null
}
const cleanupKeywords = ['jshint', 'eslint', 'gjslint', 'jslint', 'standard', 'semistandard']

/* path to your package.json file */
const packageJsonPath = process.argv[2]

getTestScript(packageJsonPath).then((script) => {
    script = cleanupScript(script)
    script = replaceFrameworks(script)

    var packageJson = loadPackageJson(packageJsonPath)
    packageJson['scripts']['__test__'] = script
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));
})

function getTestFrameworkCommand(framework) {
    if (testFrameworks[framework] == null) {
        return `${testPath} null`
    }
    return `${testPath} ${path.join(rootPath, testFrameworks[framework])}`
}

function loadPackageJson(path) {
    var json = JSON.parse(fs.readFileSync(path))
    return json
}
/** 
 * Replaces the framework commands with paths to framework binaries.
 * @param {string} script - A npm script.
 * @return {string} The transformed script with the paths to the framework binaries.
 */
function replaceFrameworks(script) {
    var splitScript = script.split(" ");
    var transformedScript = splitScript.map((x) => {
        var newX
        Object.keys(testFrameworks).forEach(keyword => {
            if (x.includes(keyword)) {
                newX = getTestFrameworkCommand(keyword)
            }
        });
        return newX
    }).join(" ")
    return transformedScript
}


function cleanupScript(script) {
    var splitScript = script.split(" && ")
    var transformedScript

    cleanupKeywords.forEach(keyword => {
        transformedScript = splitScript.filter((x) => {
            return !x.includes(keyword)
        })
    });

    return transformedScript.join(" && ")
}

module.exports = {
    replaceFrameworks,
    cleanupScript
}