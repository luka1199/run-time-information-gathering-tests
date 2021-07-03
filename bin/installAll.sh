#!/bin/bash
CURRENT_FOLDER=$(pwd)
MODULES_FOLDER="$(pwd)/$1"
LOG_FILE="$MODULES_FOLDER/../install.log"
ERROR_LOG_FILE="$MODULES_FOLDER/../install_errors.log"
rm -f $LOG_FILE
rm -f $ERROR_LOG_FILE

cd "$MODULES_FOLDER"
for MODULE in $(cat "../modulesInstall.csv"); do
    echo ""
    echo ">> Installing dependencies of $MODULE"

    cd "$MODULES_FOLDER/$MODULE/src"
    timeout 60 npm-cache install -d
    if [[ $? -eq 0 ]]; then
        LOG_OUTPUT="OK"
    else
        LOG_OUTPUT="NOK"
    fi
    cd "$MODULES_FOLDER"
    rm -rf "$MODULES_FOLDER/$MODULE/lib_instrumented/node_modules"
    cp -r "$MODULES_FOLDER/$MODULE/src/node_modules/" "$MODULES_FOLDER/$MODULE/lib_instrumented"

    echo "$MODULE - $LOG_OUTPUT" >>$LOG_FILE
done
cd "$CURRENT_FOLDER"