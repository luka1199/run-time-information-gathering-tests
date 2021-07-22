// Dependencies
const assert = require('assert');
const getTestScript = require('../tools/testScriptParser');
const {
    replaceFrameworks,
    cleanupScript
} = require('../tools/cleanupTestScript')
// const getTestFrameworkCommand = require('../tools/testScript.js')
const path = require('path')
const rootPath = path.join(__dirname, '..')
const frameworkCommandPrefix = rootPath + '/bin/test.sh '

it("Parse test script of package.json", async function () {
    var testScript = await getTestScript(path.join(__dirname, 'package.json'))
    assert.strictEqual(testScript, "mocha test1 && mocha test2 && echo ok");
});

it("Cleanup script with jshint", async function () {
    var script = "mocha test.js && jshint test.js"
    assert.strictEqual(cleanupScript(script), 'mocha test.js');
});

it("Don't cleanup normal script", async function () {
    var script = "mocha test.js && echo done!"
    assert.strictEqual(cleanupScript(script), script);
});