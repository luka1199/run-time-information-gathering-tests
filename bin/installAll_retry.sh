#!/bin/bash
CURRENT_FOLDER=$(pwd)
MODULES_FOLDER="$(pwd)/$1"
SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
LOG_FILE="$MODULES_FOLDER/../install.log"

cd "$MODULES_FOLDER"
N=4
OIFS="$IFS"
IFS=$'\n'
for LINE in $(cat "$LOG_FILE"); do
    (
        MODULE=$(node $SCRIPT_PATH/../tools/getLogModuleName.js "$LINE")
        LOG_CODE=$(node $SCRIPT_PATH/../tools/getLogCode.js "$LINE")
        if [[ $LOG_CODE == "TIMEOUT" ]]; then

            echo ""
            echo ">> Installing dependencies of $MODULE"
            
            rm -rf "$MODULES_FOLDER/$MODULE/src/node_modules"

            cd "$MODULES_FOLDER/$MODULE/src"
            timeout 250 npm install
            CODE=$?
            if [[ $CODE -eq "0" ]]; then
                LOG_OUTPUT="OK"
                cd "$MODULES_FOLDER"
                rm -rf "$MODULES_FOLDER/$MODULE/lib_instrumented/node_modules"
                timeout 250 cp -r "$MODULES_FOLDER/$MODULE/src/node_modules/" "$MODULES_FOLDER/$MODULE/lib_instrumented"
            else
                if [[ $CODE -eq "124" ]]; then
                    LOG_OUTPUT="TIMEOUT"
                else
                    LOG_OUTPUT="NOK"
                fi
            fi

            sed -i "s/$LINE/$MODULE - $LOG_OUTPUT/" $LOG_FILE
        fi
    ) &

    # allow to execute up to $N jobs in parallel
    if [[ $(jobs -r -p | wc -l) -ge $N ]]; then
        wait -n
    fi
done
IFS="$OIFS"
cd "$CURRENT_FOLDER"
