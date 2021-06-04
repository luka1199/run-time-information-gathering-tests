// Dependencies
const assert = require('assert');
const getTestScript = require('../tools/testScriptParser');
// const getTestFrameworkCommand = require('../tools/testScript.js')
const path = require('path')
const rootPath = path.join(__dirname, '..')

it("Parse test script of package.json", async function () {
    var testScript = await getTestScript(path.join(__dirname, 'package.json'))
    assert.equal(testScript, "mocha test1 && mocha test2 && echo ok");
});