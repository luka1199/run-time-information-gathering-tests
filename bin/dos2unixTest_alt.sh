
#!/bin/bash
CURRENT_FOLDER=$(pwd)
MODULES_FOLDER="$(pwd)/$1"

cd "$MODULES_FOLDER"
N=4
for MODULE in $(sed -n '1658,1922p' "../modulesTest.csv"); do
    echo ""
    echo ">> dos2unix $MODULE"

    cd "$MODULES_FOLDER/$MODULE"

    find . -type f -not -path "./*/node_modules/*" -not -path "./*/tmp-*/*" -not -path "./*/.git/*" -print0 | xargs -0 -n 1 -P 4 dos2unix
done
cd "$CURRENT_FOLDER"