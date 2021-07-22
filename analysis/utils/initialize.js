/* global J$ */

"use strict";

(function (sandbox) {
	var fs = require('fs')
	sandbox.runTimeInfo = {};

	process.on('exit', (code) => {
		var output = JSON.stringify(sandbox.runTimeInfo, null, 4)
		// Check if analysis json path is set
		if (J$.initParams['jsonOutputPath']) {
			console.log(`>> Saving analysis to ${J$.initParams['jsonOutputPath']}...`);
			fs.writeFileSync(J$.initParams['jsonOutputPath'], output)
			console.log('done!');
		} else {
			console.log("");
			console.log(output);
		}
	})
}(J$));