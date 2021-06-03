#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH="$( cd "$(dirname "$0")" ; pwd -P )/.."
JALANGI_PATH="$ROOT_PATH/node_modules/jalangi2"
TEST_FRAMEWORK_PATH=$1
TEST_FRAMEWORK_TARGET=$2

node $JALANGI_JS_PATH/commands/direct.js \
    --analysis utils/initialize.js \
    --analysis utils/sMemory/sMemory.js \
    --analysis utils/functions.js \
    \
    \
    --analysis utils/functionsExecutionStack.js \
    --analysis utils/sMemoryInterface.js \
    --analysis utils/objectSerializer.js \
    --analysis utils/interactionSerializer.js \
    --analysis utils/interactionContainerFinder.js \
    --analysis utils/objectTraceIdMap.js \
    --analysis utils/recursiveInteractionsHandler.js \
    --analysis utils/argumentWrapperObjectBuilder.js \
    --analysis utils/functionIdHandler.js \
    --analysis utils/argumentProxyBuilder.js \
    --analysis utils/interactionWithResultHandler.js \
    --analysis utils/wrapperObjectsHandler.js \
    --analysis utils/toPrimitive.js \
    --analysis utils/operators/relationalComparisonOperatorTypeCoercion.js \
    --analysis utils/operators/sumOperatorTypeCoercion.js \
    --analysis utils/operators/operatorsTypeCoercionAnalyzer.js \
    \
    --analysis utils/argumentContainer.js \
    --analysis utils/functionContainer.js \
    \
    \
    --analysis utils/interactions/interaction.js \
    --analysis utils/interactions/activeInteraction.js \
    --analysis utils/interactions/getFieldInteraction.js \
    --analysis utils/interactions/inputValueInteraction.js \
    --analysis utils/interactions/methodCallInteraction.js \
    --analysis utils/interactions/putFieldInteraction.js \
    --analysis utils/interactions/usedAsArgumentInteraction.js \
    --analysis utils/interactions/convertedToInteraction.js \
    --analysis utils/interactions/operatorInteraction.js \
    \
    \
    --analysis utils/operators/operatorInteractionBuilder.js \
    \
    \
    --analysis analysis/analysis.js \
    --analysis analysis/callbacks/functionEnter.js \
    --analysis analysis/callbacks/functionExit.js \
    --analysis analysis/callbacks/declare.js \
    --analysis analysis/callbacks/invokeFunPre.js \
    --analysis analysis/callbacks/invokeFun.js \
    --analysis analysis/callbacks/getField.js \
    --analysis analysis/callbacks/putFieldPre.js \
    --analysis analysis/callbacks/write.js \
    --analysis analysis/callbacks/binaryPre.js \
    --analysis analysis/callbacks/unaryPre.js \
    --analysis analysis/callbacks/conditional.js \
    --analysis analysis/callbacks/literal.js \
    $TEST_FRAMEWORK_PATH $TEST_FRAMEWORK_TARGET