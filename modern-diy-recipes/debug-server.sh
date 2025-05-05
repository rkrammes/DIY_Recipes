#!/bin/bash

# Debug script to start the server with verbose logging

# Kill any existing processes on port 3000
echo "🔍 Checking for processes on port 3000..."
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
  PID=$(netstat -tlnp 2>/dev/null | grep ":3000" | awk '{print $7}' | cut -d'/' -f1)
  if [[ ! -z "$PID" ]]; then
    echo "🛑 Killing process $PID on port 3000"
    kill -9 $PID
    sleep 1
  else
    echo "✅ No processes found on port 3000"
  fi
fi

# Clear Next.js cache
echo "🧹 Cleaning Next.js cache..."
rm -rf .next

# Create debug log file
DEBUG_LOG="logs/debug-server.log"
mkdir -p logs
echo "📝 Debug log file: $DEBUG_LOG"

# Start server with verbose logging
echo "🚀 Starting Next.js server with verbose logging..."
DEBUG=* NODE_OPTIONS="--trace-warnings --max-old-space-size=4096" npx next dev --verbose &> "$DEBUG_LOG" &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 5

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
  echo "✅ Server started successfully with PID: $SERVER_PID"
  echo "🌐 Open your browser to: http://localhost:3000"
  echo "🧪 Test the fixed layout at: http://localhost:3000/test-fixed-layout"
  echo ""
  echo "📊 Server logs are being written to $DEBUG_LOG"
  echo "🔍 To check server status: ps -p $SERVER_PID"
  echo "👀 To view logs in real-time: tail -f $DEBUG_LOG"
  echo "🛑 To stop the server: kill -9 $SERVER_PID"
  
  # Keep script running and monitoring the server process
  echo ""
  echo "📊 Server output:"
  tail -f "$DEBUG_LOG"
else
  echo "❌ Server failed to start. Check logs in $DEBUG_LOG"
  cat "$DEBUG_LOG"
fi