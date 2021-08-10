#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH="$( cd "$(dirname "$0")" ; pwd -P )/.."
MODULE_NAME=$1
MODULE_URL=$(node $ROOT_PATH/tools/transformRepositoryUrl.js $(npm view $MODULE_NAME repository.url))
# MODULE_URL=$2
DEFAULT_OUTPUT_PATH=$ROOT_PATH/module/output/output.json
OUTPUT_PATH="${2:-$DEFAULT_OUTPUT_PATH}"
CURRENT_DIRECTORY=$(pwd)

cd $ROOT_PATH
npm run cleanup
mkdir -p $SCRIPT_PATH/../module/src/
mkdir -p $SCRIPT_PATH/../module/lib/
mkdir -p $SCRIPT_PATH/../module/instrumented/
mkdir -p $SCRIPT_PATH/../module/output/
# npm --prefix $SCRIPT_PATH/../module/src install --only=dev $MODULE_NAME

echo ""
echo ">> Cloning module..."
git clone $MODULE_URL module/src

echo ""
echo ">> Compiling module with Babel..."
npm run build

echo ""
echo ">> Instrumenting module with Jalangi..."
npm run instrument

echo ""
echo ">> Installing module dependencies..."
cd $ROOT_PATH/module/instrumented
npm install
cd $ROOT_PATH

echo ""
echo ">> Injecting Jalangi"
mkdir "$ROOT_PATH/module/instrumented/node_modules/jalangiExtracted"
cp "$ROOT_PATH/jalangiExtracted/jalangi.js" "$ROOT_PATH/module/instrumented/node_modules/jalangiExtracted/jalangi.js"
jsFiles=$(find ./module/instrumented/ -name '*_orig_.js')
for jsFile in $jsFiles;
do
    instrumentedJsFile="${jsFile/"_orig_"/""}"
    requirePath="jalangiExtracted/jalangi"
    if [[ $(head -n 1 "$instrumentedJsFile") != "require('$requirePath')" ]]; then
        sed -i "1s@^@require('$requirePath')\n@" $instrumentedJsFile
        echo "$instrumentedJsFile"
    fi
done

echo ""
echo ">> Generating test script..."
node $ROOT_PATH/tools/cleanupTestScript.js module/instrumented/package.json

echo ""
echo ">> Running tests..."
cd $ROOT_PATH/module/instrumented
npm run __test__
cd $ROOT_PATH

echo ""
echo ">> Preparing analysis file..."
node $ROOT_PATH/tools/fixAnalysisJson.js $MODULE_NAME module/output/output.json
echo "done!"

if [ $OUTPUT_PATH != $DEFAULT_OUTPUT_PATH ]; then
    echo ""
    echo ">> Copying analysis to $OUTPUT_PATH"
    mkdir -p $(dirname $OUTPUT_PATH)
    cp $ROOT_PATH/module/output/output_fixed.json $(dirname $OUTPUT_PATH)/output.json
fi
if [ $(dirname $OUTPUT_PATH)/output.json != $OUTPUT_PATH ]; then
    mv $(dirname $OUTPUT_PATH)/output.json $OUTPUT_PATH
fi

# cd $CURRENT_DIRECTORY