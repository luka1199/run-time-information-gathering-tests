#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH="$( cd "$(dirname "$0")" ; pwd -P )/.."
CURRENT_FOLDER=$(pwd)
MODULES_FOLDER="$(pwd)/$1"
LOG_FILE="$MODULES_FOLDER/../install.log"

cd "$MODULES_FOLDER"
for MODULE in $(node $ROOT_PATH/tools/getModulesInstall.js ../modulesInstall.csv ../install.log); do
    echo ""
    echo ">> Installing dependencies of $MODULE"

    cd "$MODULES_FOLDER/$MODULE/src"
    timeout 100 npm-cache install -d
    if [[ $? -eq 0 ]]; then
        LOG_OUTPUT="OK"
    else
        if [[ $ERROR_CODE -eq 124 ]]; then
            LOG_OUTPUT="TIMEOUT"
        else
            LOG_OUTPUT="NOK"
        fi
    fi
    cd "$MODULES_FOLDER"
    rm -rf "$MODULES_FOLDER/$MODULE/lib_instrumented/node_modules"
    cp -r "$MODULES_FOLDER/$MODULE/src/node_modules/" "$MODULES_FOLDER/$MODULE/lib_instrumented"
    if [[ $? -ne 0 ]]; then
        LOG_OUTPUT="NOK"
    fi

    echo "$MODULE - $LOG_OUTPUT" >>$LOG_FILE
done
cd "$CURRENT_FOLDER"
