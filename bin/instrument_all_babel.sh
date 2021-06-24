#!/bin/bash
SCRIPT_PATH="$(
    cd "$(dirname "$0")"
    pwd -P
)"

MODULES_FOLDER=$1
LOG_FILE="$MODULES_FOLDER/../instrument_babel.log"
ERROR_LOG_FILE="$MODULES_FOLDER/../instrument_babel_errors.log"
TARGET_DIR_NAME="lib"
OUTPUT_DIR_NAME="lib_instrumented"
rm -f $LOG_FILE
rm -f $ERROR_LOG_FILE

N=4
for MODULE in $MODULES_FOLDER/*; do
    (
        rm -rf "$MODULE/$TARGET_DIR_NAME"
        rm -rf "$MODULE/$OUTPUT_DIR_NAME"
        npx babel -D "$MODULE/src" -d "$MODULE/$TARGET_DIR_NAME" 2>>$ERROR_LOG_FILE || { rm -rf "$MODULE/$TARGET_DIR_NAME"; cp -r "$MODULE/src" "$MODULE/$TARGET_DIR_NAME"; } 
        # npx babel -D "$MODULE/src" -d "$MODULE/$TARGET_DIR_NAME"
        # echo "$BABEL_OUTPUT"
        echo "Instrumenting module '$(basename "$MODULE")' to $MODULE/$OUTPUT_DIR_NAME"
        INSTRUMENT_OUTPUT=$($SCRIPT_PATH/instrument.sh "$MODULE/$TARGET_DIR_NAME" "$MODULE/$OUTPUT_DIR_NAME" 2>>$ERROR_LOG_FILE)
        if [[ ! "$INSTRUMENT_OUTPUT" == *"Failed to instrument"* ]]; then
            LOG_OUTPUT="OK"
        else
            LOG_OUTPUT="NOK"
        fi
        echo "$(basename "$MODULE") - $LOG_OUTPUT" >>$LOG_FILE
    ) &

    # allow to execute up to $N jobs in parallel
    if [[ $(jobs -r -p | wc -l) -ge $N ]]; then
        wait -n
    fi
done
