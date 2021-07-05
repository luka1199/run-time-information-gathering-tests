#!/bin/bash
CURRENT_FOLDER=$(pwd)
MODULES_FOLDER="$(pwd)/$1"

cd "$MODULES_FOLDER"
N=4
OIFS="$IFS"
IFS=$'\n'
for MODULE in $(cat "../modulesInstall.csv"); do
    (
        echo ""
        echo ">> Injecting Jalangi into module $MODULE"

        jsFiles=$(find ./$MODULE/lib_instrumented/ -name '*_orig_.js')

        for jsFile in $jsFiles; do
            instrumentedJsFile="${jsFile/"_orig_"/""}"
            requirePath="jalangiExtracted/jalangi"
            if [[ $(head -n 1 "$instrumentedJsFile") != "require('$requirePath')" ]]; then
                sed -i "1s@^@require('$requirePath')\n@" $instrumentedJsFile
                echo "$instrumentedJsFile"
            fi
        done
    ) &

    # allow to execute up to $N jobs in parallel
    if [[ $(jobs -r -p | wc -l) -ge $N ]]; then
        wait -n
    fi
done
IFS="$OIFS"
        
cd "$CURRENT_FOLDER"
