#!/bin/bash

TARGET=$1
SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH=$SCRIPT_PATH/..

JALANGI_PATH="$ROOT_PATH/node_modules/jalangi2"

node $JALANGI_PATH/src/js/commands/instrument.js --inlineIID --inlineSource \
	-i --inlineJalangi \
    --analysis $ROOT_PATH/analysis/utils/initialize.js \
    --analysis $ROOT_PATH/analysis/utils/functions.js \
    \
    \
    --analysis $ROOT_PATH/analysis/utils/metadataStore.js \
    --analysis $ROOT_PATH/analysis/utils/functionsExecutionStack.js \
    --analysis $ROOT_PATH/analysis/utils/interactionContainerFinder.js \
    --analysis $ROOT_PATH/analysis/utils/objectTraceIdMap.js \
    --analysis $ROOT_PATH/analysis/utils/argumentWrapperObjectBuilder.js \
    --analysis $ROOT_PATH/analysis/utils/functionIdHandler.js \
    --analysis $ROOT_PATH/analysis/utils/argumentProxyBuilder.js \
    --analysis $ROOT_PATH/analysis/utils/interactionWithResultHandler.js \
    --analysis $ROOT_PATH/analysis/utils/wrapperObjectsHandler.js \
    --analysis $ROOT_PATH/analysis/utils/toPrimitive.js \
    --analysis $ROOT_PATH/analysis/utils/operators/relationalComparisonOperatorTypeCoercion.js \
    --analysis $ROOT_PATH/analysis/utils/operators/sumOperatorTypeCoercion.js \
    --analysis $ROOT_PATH/analysis/utils/operators/operatorsTypeCoercionAnalyzer.js \
    \
    --analysis $ROOT_PATH/analysis/utils/argumentContainer.js \
    --analysis $ROOT_PATH/analysis/utils/functionContainer.js \
    \
    \
    --analysis $ROOT_PATH/analysis/utils/interactions/interaction.js \
    --analysis $ROOT_PATH/analysis/utils/interactions/activeInteraction.js \
    --analysis $ROOT_PATH/analysis/utils/interactions/getFieldInteraction.js \
    --analysis $ROOT_PATH/analysis/utils/interactions/inputValueInteraction.js \
    --analysis $ROOT_PATH/analysis/utils/interactions/methodCallInteraction.js \
    --analysis $ROOT_PATH/analysis/utils/interactions/putFieldInteraction.js \
    --analysis $ROOT_PATH/analysis/utils/interactions/usedAsArgumentInteraction.js \
    --analysis $ROOT_PATH/analysis/utils/interactions/convertedToInteraction.js \
    \
    \
    --analysis $ROOT_PATH/analysis/analysis.js \
    --analysis $ROOT_PATH/analysis/callbacks/functionEnter.js \
    --analysis $ROOT_PATH/analysis/callbacks/functionExit.js \
    --analysis $ROOT_PATH/analysis/callbacks/declare.js \
    --analysis $ROOT_PATH/analysis/callbacks/invokeFunPre.js \
    --analysis $ROOT_PATH/analysis/callbacks/invokeFun.js \
    --analysis $ROOT_PATH/analysis/callbacks/getField.js \
    --analysis $ROOT_PATH/analysis/callbacks/putFieldPre.js \
    --analysis $ROOT_PATH/analysis/callbacks/write.js \
    --analysis $ROOT_PATH/analysis/callbacks/binaryPre.js \
    --analysis $ROOT_PATH/analysis/callbacks/unaryPre.js \
    --analysis $ROOT_PATH/analysis/callbacks/conditional.js \
    --analysis $ROOT_PATH/analysis/callbacks/literal.js \
	--outputDir output_browser \
	$TARGET