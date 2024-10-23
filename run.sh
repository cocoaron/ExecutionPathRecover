#!/bin/bash

CURRENT_DIR=$(pwd)
SCRIPT_PATH="$CURRENT_DIR/PathUp/pathup_run.sh"

if [ -f "$SCRIPT_PATH" ]; then
    # Navigate to PathUp and run pathup_run.sh
    cd "$CURRENT_DIR/PathUp" || { echo "Failed to navigate to $CURRENT_DIR/PathUp"; exit 1; }
    ./pathup_run.sh
else
    echo "chkup_run.sh not found in $CURRENT_DIR/PathUp"
    exit 1
fi

