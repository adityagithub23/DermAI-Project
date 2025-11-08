#!/bin/bash

# Simple script to start the mock ML backend

echo "Starting SkinSense Mock ML Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv_simple" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv_simple
    source venv_simple/bin/activate
    echo "Installing required Python packages..."
    pip install flask flask-cors pillow
else
    source venv_simple/bin/activate
fi

# Start the backend
echo "Starting backend on http://localhost:5002"
python app_simple.py

