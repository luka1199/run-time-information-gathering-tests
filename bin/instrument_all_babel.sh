#!/bin/bash
SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"

MODULES_FOLDER=$1
LOG_FILE="$MODULES_FOLDER/../instrument_babel.log"
TARGET_DIR_NAME="lib"
OUTPUT_DIR_NAME="lib_instrumented"
rm -f $LOG_FILE

for MODULE in $MODULES_FOLDER/*;
do  
    echo ""
    rm -rf $MODULE/$TARGET_DIR_NAME
    rm -rf $MODULE/$OUTPUT_DIR_NAME
    
    echo "Compiling module '$(basename "$MODULE")' to $MODULE/$TARGET_DIR_NAME"
    BABEL_ERROR=$(npx babel -D $MODULE/src -d $MODULE/$TARGET_DIR_NAME 2>&1 >/dev/null)
    if [[ $BABEL_ERROR != "" ]];
    then
        echo "ERROR"
        LOG_OUTPUT="NOK"
    else
        echo "Instrumenting module '$(basename "$MODULE")' to $MODULE/$OUTPUT_DIR_NAME"
        INSTRUMENT_OUTPUT=$($SCRIPT_PATH/instrument.sh "$MODULE/$TARGET_DIR_NAME" "$MODULE/$OUTPUT_DIR_NAME")
        if [[ ! "$INSTRUMENT_OUTPUT" == *"Failed to instrument"* ]];
        then 
            LOG_OUTPUT="OK"
        else 
            LOG_OUTPUT="NOK"
        fi
    fi
    echo "$(basename "$MODULE") - $LOG_OUTPUT" >> $LOG_FILE
done