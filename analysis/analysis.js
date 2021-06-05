/* global J$ */

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

"use strict";

(function (sandbox) {
    function Analysis() {
        this.addAnalysis = function (analysis) {
            if (analysis.callbackName) {
                this[analysis.callbackName] = analysis.callback;
            }
        };

        this.endExecution = function () {
            var fs = require('fs')
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
        };
    }

    var thisAnalysis = new Analysis();
    Object.defineProperty(sandbox, 'analysis', {
        get: function () {
            return thisAnalysis;
        },
        set: function (a) {
            thisAnalysis.addAnalysis(a);
        }
    });

    if (sandbox.Constants.isBrowser) {
        window.addEventListener('keydown', function (e) {
            // keyboard shortcut is Alt-Shift-T for now
            if (e.altKey && e.shiftKey && e.keyCode === 84) {
                sandbox.analysis.endExecution();
            }
        });
    }
}(J$));