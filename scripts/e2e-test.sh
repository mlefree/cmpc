#!/bin/bash

BASE_DIR=`dirname $0`

java -jar "$BASE_DIR/../tests/lib/jstestdriver/JsTestDriver-1.3.5.jar" \
     --config "$BASE_DIR/../config/jsTestDriver-scenario.conf" \
     --basePath "$BASE_DIR/.." \
     --tests all --reset
