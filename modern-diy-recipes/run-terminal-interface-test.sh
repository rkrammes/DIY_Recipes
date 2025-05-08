#!/bin/bash

# KRAFT_AI Terminal Interface Test Script with Database Setup
echo "===== KRAFT_AI Terminal Interface Test ====="
echo "This script will:"
echo "1. Check Supabase connection"
echo "2. Create missing tables if needed"
echo "3. Start the application"
echo "4. Run automated UI tests"
echo ""

# Check if the database needs setup
echo "Step 1: Checking database tables..."
node create-missing-tables.js

# Create screenshots directory if it doesn't exist
mkdir -p ui-verification/terminal-interface

# Check if there's already a server running
if lsof -i :3000 > /dev/null 2>&1; then
  echo "A server is already running on port 3000"
  echo "Using existing server for tests"
  USE_EXISTING_SERVER=true
else
  echo ""
  echo "Step 2: Starting application on http://localhost:3000..."
  npm run dev > /dev/null 2>&1 &
  APP_PID=$!

  # Wait for app to start
  echo "Waiting for app to start (10 seconds)..."
  sleep 10
fi

# Run the test
echo ""
echo "Step 3: Running automated UI tests..."
node test-terminal-interface.js

# Kill the app if we started it
if [ -z "$USE_EXISTING_SERVER" ]; then
  echo ""
  echo "Step 4: Cleaning up..."
  kill $APP_PID
fi

echo ""
echo "Test complete! Check ui-verification/terminal-interface/ for screenshots and test report."
echo "To view the report, you can use:"
echo "  open ui-verification/terminal-interface/test-report.md"
echo ""