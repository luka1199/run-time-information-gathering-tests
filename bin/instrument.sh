#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH="$( cd "$(dirname "$0")" ; pwd -P )/.."
TARGET_DIR=$1
OUTPUT_DIR=$2

node $ROOT_PATH/node_modules/jalangi2/src/js/commands/instrument.js -d --outputDir $ROOT_PATH/$OUTPUT_DIR $ROOT_PATH/$TARGET_DIR
