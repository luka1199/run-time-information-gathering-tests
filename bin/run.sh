#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
MODULE_NAME=$1

npm run cleanup
mkdir $SCRIPT_PATH/module/src/
npm --prefix $SCRIPT_PATH/../module/src install $MODULE_NAME