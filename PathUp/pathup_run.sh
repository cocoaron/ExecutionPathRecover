#!/bin/bash 

# Get the current working directory
CURRENT_DIR=$(pwd)

# Initialize the JavaScript parser
is_npm_script_running() {
    pgrep -fl "node.*$1" > /dev/null
}

SCRIPT_NAME="start"
SCRIPT_PATH="$CURRENT_DIR/exec_pth_rec/jsparse"

cd "$SCRIPT_PATH" || { echo "Failed to navigate to $SCRIPT_PATH"; exit 1; }

if is_npm_script_running "$SCRIPT_NAME"; then
    echo "JS parser is already running."
else
    echo "JS parser is not running. Starting the script..."
    npm run "$SCRIPT_NAME" > /dev/null 2>&1 &
    disown
fi

# Define an array of testing firmware paths
file_paths=(
    "$CURRENT_DIR/firmware/extracted/RLC-410W_extracted"
    "$CURRENT_DIR/firmware/extracted/wa801nv1_en_3_12_6_up_bin_extracted"
    "$CURRENT_DIR/firmware/extracted/_WNR1000v2_V1_1_2_60NA_img_extracted"
)

# Loop through the array of file paths
WORKING_DIR="$CURRENT_DIR/PathUp"
cd "$WORKING_DIR" || { echo "Failed to navigate to $WORKING_DIR"; exit 1; }

for file_path in "${file_paths[@]}"
do
    python3 main.py --firmware_path "$file_path" --results_path "$CURRENT_DIR/results"
done
