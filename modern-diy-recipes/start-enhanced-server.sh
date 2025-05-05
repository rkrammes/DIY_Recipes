#!/bin/bash

# Script to run the enhanced Next.js server with custom binding
# This addresses the server connectivity issues

echo "🔍 Checking and killing any existing processes..."

# Kill any processes on port 3000
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  PID=$(lsof -i :3000 -t 2>/dev/null)
  if [[ ! -z "$PID" ]]; then
    echo "🛑 Killing process $PID on port 3000"
    kill -9 $PID
    sleep 1
  else
    echo "✅ No processes found on port 3000"
  fi
else
  # Linux
  PID=$(netstat -tulpn 2>/dev/null | grep ":3000 " | awk '{print $7}' | cut -d'/' -f1)
  if [[ ! -z "$PID" ]]; then
    echo "🛑 Killing process $PID on port 3000"
    kill -9 $PID
    sleep 1
  else
    echo "✅ No processes found on port 3000"
  fi
fi

# Clean the cache to ensure a fresh start
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Create logs directory if it doesn't exist
mkdir -p logs

# Run the custom server with detailed logging
echo "🚀 Starting enhanced Next.js server..."
NODE_OPTIONS="--max-old-space-size=4096" node custom-next-server.js 2>&1 | tee logs/enhanced-server.log

# This script will continue running until you press Ctrl+C