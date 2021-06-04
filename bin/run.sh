#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH="$( cd "$(dirname "$0")" ; pwd -P )/.."
MODULE_URL=$1

npm run cleanup
mkdir -p $SCRIPT_PATH/../module/src/
mkdir -p $SCRIPT_PATH/../module/lib/
mkdir -p $SCRIPT_PATH/../module/instrumented/
# npm --prefix $SCRIPT_PATH/../module/src install --only=dev $MODULE_NAME
git clone $MODULE_URL module/src

npm run build
npm run instrument

cd $ROOT_PATH/module/instrumented
npm install
cd $ROOT_PATH

node tools/testScript.js $ROOT_PATH/module/instrumented/package.json

cd $ROOT_PATH/module/instrumented
npm run __test__
cd $ROOT_PATH