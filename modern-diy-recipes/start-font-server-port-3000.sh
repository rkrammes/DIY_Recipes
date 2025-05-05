#!/bin/bash

# Font Server Launcher - Port 3000
# This script starts a lightweight HTTP server specifically for serving font files on port 3000

echo "🚀 Starting Font Server on port 3000"

# Check if port 3000 is already in use
echo "🔍 Checking if port 3000 is already in use..."
lsof -i :3000 | grep LISTEN
if [ $? -eq 0 ]; then
  echo "⚠️ Port 3000 is already in use. Killing the process..."
  lsof -i :3000 -t | xargs kill -9
  sleep 1
  echo "✅ Process killed."
else
  echo "✅ Port 3000 is available."
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the HTTP server
echo "🚀 Starting font server on port 3000..."
node http-server-3000.js > logs/font-server.log 2>&1 &

# Store the process ID
echo $! > .font-server.pid
echo "✅ Font server started with PID $(cat .font-server.pid)"
echo "📝 Log file: logs/font-server.log"

# Verify the server is running
echo "🔍 Verifying server..."
sleep 2
curl -s http://localhost:3000/server-status 2>/dev/null || echo "Server is running but /server-status endpoint not found"

echo "
============================================================
🎉 Font server is now running on http://localhost:3000
============================================================
- Font files are served from: $(pwd)/public/fonts
- MIME types configured for .woff and .woff2 files
- Cache headers set for optimal font loading

To stop the server:
  ./stop-font-server.sh

To view the logs:
  tail -f logs/font-server.log
"