#!/bin/bash

# Start the Express server on port 3000 with font handling
echo "🚀 Starting Express server on port 3000 with font handling..."

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

# Create logs directory
mkdir -p logs

# Start the Express server on port 3000
echo "🚀 Starting Express server on port 3000..."
node express-font-server-3000.js