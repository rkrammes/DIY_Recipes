#!/bin/bash

echo "🚀 Starting development environment with dedicated font server"

# 1. Create logs directory if it doesn't exist
mkdir -p logs

# 2. Check and kill any existing processes on port 3000 (font server)
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

# 3. Start font server in the background
echo "🔤 Starting font server on port 3000..."
node font-test-server.js > logs/font-server.log 2>&1 &
FONT_SERVER_PID=$!
echo "✅ Font server started with PID: $FONT_SERVER_PID"

# 4. Wait a moment to ensure font server is ready
sleep 2

# 5. Test font server
echo "🔍 Testing font server..."
curl -s http://localhost:3000/server-status > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Font server is running properly"
else
  echo "❌ Font server failed to start properly"
  echo "📋 Check logs/font-server.log for details"
  exit 1
fi

# 6. Start Next.js app with fixed-server.sh with dedicated ports
echo "🚀 Starting Next.js app on port 3456..."
./start-fixed-server.sh

# 7. Instructions for stopping servers
echo ""
echo "📋 To stop all servers:"
echo "  kill $FONT_SERVER_PID  # Stop font server"
echo "  pkill -f 'next dev'    # Stop Next.js server"