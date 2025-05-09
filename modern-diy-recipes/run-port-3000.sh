#!/bin/bash

# Super simple script to run a server on port 3000
echo "🚀 Starting simple server on port 3000..."

# Kill any process on port 3000
echo "🔍 Checking for processes on port 3000..."
PORT_PROCESS=$(lsof -i :3000 -t)
if [ -n "$PORT_PROCESS" ]; then
  echo "⚠️ Port 3000 is in use. Killing process..."
  kill -9 $PORT_PROCESS
  sleep 1
else
  echo "✅ Port 3000 is available"
fi

# Run the server
echo "🚀 Starting server on port 3000..."
node run-port-3000.js