#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH=$SCRIPT_PATH/..

mkdir $ROOT_PATH/tmp
touch $ROOT_PATH/tmp/tmp.html

$ROOT_PATH/bin/runBrowser.sh $ROOT_PATH/tmp

mkdir -p $ROOT_PATH/jalangi

cat $ROOT_PATH/output_browser/tmp/tmp.html | node $ROOT_PATH/tools/extractJavascriptContent.js > $ROOT_PATH/jalangi/jalangi.js

rm -R $ROOT_PATH/tmp