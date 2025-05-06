#!/bin/bash

# Script to run the feature toggle demo and test
echo "🚀 Feature Toggle Demo Test Script"

# Check if the demo server is already running
PORT_IN_USE=$(lsof -i :3005 -t 2>/dev/null)
if [ -n "$PORT_IN_USE" ]; then
  echo "✅ Demo server is already running on port 3005"
else
  echo "🚀 Starting demo server..."
  node serve-demo.js &
  SERVER_PID=$!
  echo "✅ Demo server started with PID: $SERVER_PID"
  
  # Give the server time to start
  sleep 2
fi

# Run the test
echo "🧪 Running feature toggle test..."
node test-demo.js

# Clean up
if [ -n "$SERVER_PID" ]; then
  echo "🛑 Stopping demo server (PID: $SERVER_PID)..."
  kill $SERVER_PID
  echo "✅ Server stopped"
fi

echo "✨ Done!"