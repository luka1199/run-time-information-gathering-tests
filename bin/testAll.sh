#!/bin/bash
CURRENT_FOLDER=$(pwd)
MODULES_FOLDER="$(pwd)/$1"
LOG_FILE="$MODULES_FOLDER/../test.log"
ERROR_LOG_FILE="$MODULES_FOLDER/../test_errors.log"
rm -f $LOG_FILE
rm -f $ERROR_LOG_FILE

cd "$MODULES_FOLDER"
for MODULE in $(cat "../modulesWithTestScript.csv"); do
    echo ""
    echo ">> Testing $MODULE"

    cd "$MODULES_FOLDER/$MODULE/src"
    timeout 60 npm run test
    if [[ $? -eq 0 ]]; then
        LOG_OUTPUT="OK"
    else
        if [ $ERROR_CODE -eq 124 ]
        then
            LOG_OUTPUT="TIMEOUT"
        else
            LOG_OUTPUT="NOK"
        fi
    fi
    cd "$MODULES_FOLDER"

    echo "$MODULE - $LOG_OUTPUT" >>$LOG_FILE
done
cd "$CURRENT_FOLDER"