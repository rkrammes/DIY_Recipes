#!/bin/bash

echo "Starting UI test for Settings integration..."

# Ensure the test-screenshots directory exists
mkdir -p test-screenshots

# Run the test script
node test-settings-in-ui.js

echo "Test completed. Check the test-screenshots directory for visual verification."