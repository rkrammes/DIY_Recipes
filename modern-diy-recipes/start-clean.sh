#!/bin/bash

# Script to kill any processes on port 3000 and start a clean Next.js server

PORT=3000
LOG_FILE="server.log"

echo "🔍 Checking for processes on port $PORT..."

# Function to kill processes on port 3000
kill_port() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    PID=$(lsof -i :$PORT -t 2>/dev/null)
    if [[ ! -z "$PID" ]]; then
      echo "🛑 Killing process $PID on port $PORT"
      kill -9 $PID
      sleep 1
    else
      echo "✅ No processes found on port $PORT"
    fi
  else
    # Linux and other Unix-like systems
    PID=$(netstat -tulpn 2>/dev/null | grep ":$PORT " | awk '{print $7}' | cut -d'/' -f1)
    if [[ ! -z "$PID" ]]; then
      echo "🛑 Killing process $PID on port $PORT"
      kill -9 $PID
      sleep 1
    else
      echo "✅ No processes found on port $PORT"
    fi
  fi
}

# Kill any processes on port 3000
kill_port

echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "📝 Log file: $LOG_FILE"
mkdir -p logs

echo "🚀 Starting Next.js server on port $PORT..."
NODE_OPTIONS="--max-old-space-size=4096" npm run dev > "logs/$LOG_FILE" 2>&1 &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 3

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
  echo "✅ Server started successfully with PID: $SERVER_PID"
  echo "🌐 Open your browser to: http://localhost:$PORT"
  echo "🧪 Test the fixed layout at: http://localhost:$PORT/test-fixed-layout"
  echo ""
  echo "📊 Server logs are being written to logs/$LOG_FILE"
  echo "🛑 Press Ctrl+C to stop the server"
  
  # Wait for user to press Ctrl+C
  trap "echo ''; echo '🛑 Stopping server...'; kill -9 $SERVER_PID; echo '✅ Server stopped'" INT
  wait $SERVER_PID
else
  echo "❌ Server failed to start. Check logs in logs/$LOG_FILE"
  cat "logs/$LOG_FILE" | tail -n 20
fi