#!/bin/bash

# Script to start the simplified font server on port 3000
echo "🚀 Starting font server on port 3000..."

# Check for existing processes on port 3000
echo "🔍 Checking for existing processes on port 3000..."
lsof -i :3000 | grep LISTEN
if [ $? -eq 0 ]; then
  echo "⚠️ Port 3000 is already in use. Attempting to kill the process..."
  lsof -i :3000 -t | xargs kill -9
  sleep 1
  echo "✅ Process killed"
else
  echo "✅ Port 3000 is available"
fi

# Start the simple font server
echo "🚀 Starting font server..."
node simple-font-server-3000.js