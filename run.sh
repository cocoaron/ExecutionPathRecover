#!/bin/bash

CURRENT_DIR=$(pwd)
REQUIREMENTS_FILE="$CURRENT_DIR/PathUp/requirements.txt"
SCRIPT_PATH="$CURRENT_DIR/pathup_run.sh"

# Update and install dependencies
echo "Updating system packages..."
sudo apt update

echo "Installing Python 3.6..."
sudo apt install -y python3.6

echo "Updating system packages..."
sudo apt update

echo "Installing OpenJDK 11..."
sudo apt install -y openjdk-11-jdk

echo "Updating system packages..."
sudo apt update

echo "Installing npm..."
sudo apt install -y npm

if [ -f "$REQUIREMENTS_FILE" ]; then
    echo "Installing Python dependencies from requirements.txt..."
    pip3 install -r "$REQUIREMENTS_FILE"
else
    echo "requirements.txt not found in $CURRENT_DIR/PathUp"
    exit 1
fi

if [ -f "$SCRIPT_PATH" ]; then
    $SCRIPT_PATH
else
    echo "chkup_run.sh not found in $CURRENT_DIR/PathUp"
    exit 1
fi

