#!/bin/bash

# Robust server startup script with improved stability
# This script ensures clean startup with proper caching and binding

echo "🚀 Starting modern DIY recipes server with maximum stability..."

# Kill any existing processes on port 3000
echo "🔍 Cleaning up existing processes..."
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

# Clean the Next.js cache to prevent stale configuration issues
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Setup logs directory
mkdir -p logs

# Set Node.js options for better performance and debugging
export NODE_OPTIONS="--max-old-space-size=4096"

# Start the Next.js server with explicit binding to all interfaces
echo "🌐 Starting Next.js server on port 3000..."
echo "📝 Logs will be written to logs/stable-server.log"

# Start the server with "0.0.0.0" to bind to all interfaces
npx next dev -p 3000 -H 0.0.0.0 > logs/stable-server.log 2>&1 &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 5

# Check if the server process is still running
if kill -0 $SERVER_PID 2>/dev/null; then
  echo "✅ Server started with PID: $SERVER_PID"
  echo "🌐 Server is available at:"
  echo "  - http://localhost:3000"
  echo "  - http://127.0.0.1:3000"
  
  # Get the local IP for network access
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
  else
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
  fi
  
  if [[ ! -z "$LOCAL_IP" ]]; then
    echo "  - http://$LOCAL_IP:3000"
  fi
  
  echo ""
  echo "📝 To view server logs:"
  echo "  tail -f logs/stable-server.log"
  
  echo ""
  echo "🛑 To stop the server:"
  echo "  kill $SERVER_PID"
else
  echo "❌ Server failed to start. Check logs/stable-server.log for details"
  tail -n 20 logs/stable-server.log
fi