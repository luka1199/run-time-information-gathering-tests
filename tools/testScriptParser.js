const parse = require('parse-npm-script')
 
async function getTestScript(path) {
  return (await parse(path, 'npm run test')).combined
}

module.exports = getTestScript;