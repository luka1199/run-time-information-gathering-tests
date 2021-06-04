const getTestScript = require("./testScriptParser");
const path = require('path')
const fs = require('fs');

const rootPath = path.join(__dirname, '..')
const testPath = path.join(rootPath, 'bin/test.sh')
const testFrameworks = {
    'mocha': 'node_modules/mocha/bin/mocha',
    'tap': 'node_modules/tap/bin/run.js',
    "ava": "node_modules/ava/entrypoints/cli.mjs",
    "karma": "node_modules/karma/bin/karma"
}

/* path to your package.json file */
const packageJsonPath = process.argv[2]

getTestScript(packageJsonPath).then((script) => {
    var splitScript = script.split(" ");
    var transformedScript = splitScript.map((x) => {
        Object.keys(testFrameworks).forEach(keyword => {
            if (x.includes(keyword)) {
                x = getTestFrameworkCommand(keyword)
            }
        });
        
        return x
    }).join(" ")
    
    var packageJson = loadPackageJson(packageJsonPath)
    packageJson['scripts']['__test__'] = transformedScript
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));
})

function getTestFrameworkCommand(framework) {
    return `${testPath} ${path.join(rootPath, testFrameworks[framework])}`
}

function loadPackageJson(path) {
    var json = JSON.parse(fs.readFileSync(path))
    return json
}

module.exports = getTestFrameworkCommand