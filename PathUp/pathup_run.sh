#!/bin/bash 

CURRENT_DIR=$(pwd)

if [[ "$CURRENT_DIR" != *"/PathUp"* ]]; then
    echo "PathUp directory not found in $CURRENT_DIR. Prepending PathUp..."
    CURRENT_DIR="$CURRENT_DIR/PathUp"
else
    echo "PathUp directory found in $CURRENT_DIR."
fi

# Initialize the JavaScript parser
is_npm_script_running() {
    pgrep -fl "node.*$1" > /dev/null
}

SCRIPT_NAME="start"
SCRIPT_PATH="$CURRENT_DIR/exec_pth_rec/jsparse"

cd "$SCRIPT_PATH" || { echo "Failed to navigate to $SCRIPT_PATH"; exit 1; }

# Check if the JavaScript parser is already running
if is_npm_script_running "$SCRIPT_NAME"; then
    echo "JS parser is already running."
else
    echo "JS parser is not running. Starting the script..."
    npm run "$SCRIPT_NAME" > /dev/null 2>&1 &
    disown
fi

# The script runs 3 firmwares consisting of Reolink RLC-410W, TP-Link WA801N, and Netgear WNR1000
file_paths=(
    "$CURRENT_DIR/../firmware/extracted/RLC-410W_extracted"
    "$CURRENT_DIR/../firmware/extracted/wa801nv1_en_3_12_6_up_bin_extracted"
    "$CURRENT_DIR/../firmware/extracted/_WNR1000v2_V1_1_2_60NA_img_extracted"
)

WORKING_DIR="$CURRENT_DIR"
cd "$WORKING_DIR" || { echo "Failed to navigate to $WORKING_DIR"; exit 1; }

RESULTS_DIR="$CURRENT_DIR/results"

# Check if results directory exists and remove its contents
if [ -d "$RESULTS_DIR" ]; then
    echo "Removing old result files from $RESULTS_DIR..."
    rm -rf "$RESULTS_DIR"/*
else
    echo "Results directory not found. Creating $RESULTS_DIR..."
    mkdir -p "$RESULTS_DIR"
fi

for file_path in "${file_paths[@]}"
do
    echo "Running PathUp with firmware at $file_path"
    python3 main.py --firmware_path "$file_path" --results_path "$RESULTS_DIR"
done
