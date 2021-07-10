#!/bin/bash
CURRENT_FOLDER=$(pwd)
MODULES_FOLDER="$(pwd)/$1"
LOG_FILE="$MODULES_FOLDER/../install.log"
rm -f $LOG_FILE

cd "$MODULES_FOLDER"
N=4
for MODULE in $(cat "../modulesWithTestScript.csv"); do
    (
        echo ""
        echo ">> Installing dependencies of $MODULE"

        cd "$MODULES_FOLDER/$MODULE/src"
        timeout 100 npm install
        CODE=$?
        if [[ $CODE -eq "0" ]]; then
            LOG_OUTPUT="OK"
            cd "$MODULES_FOLDER"
            rm -rf "$MODULES_FOLDER/$MODULE/lib_instrumented/node_modules"
            timeout 100 cp -r "$MODULES_FOLDER/$MODULE/src/node_modules/" "$MODULES_FOLDER/$MODULE/lib_instrumented"
        else
            if [[ $CODE -eq "124" ]]; then
                LOG_OUTPUT="TIMEOUT"
            else
                LOG_OUTPUT="NOK"
            fi
        fi
        
        echo "$MODULE - $LOG_OUTPUT" >>$LOG_FILE
    ) &

    # allow to execute up to $N jobs in parallel
    if [[ $(jobs -r -p | wc -l) -ge $N ]]; then
        wait -n
    fi
done
cd "$CURRENT_FOLDER"
