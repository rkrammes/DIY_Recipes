#!/bin/bash

# Script to start the Next.js application on port 3001
# This works alongside the font server running on port 3000

echo "🚀 Starting Next.js application on port 3001..."

# Check for existing processes on port 3001
echo "🔍 Checking for existing processes on port 3001..."
lsof -i :3001 | grep LISTEN
if [ $? -eq 0 ]; then
  echo "⚠️ Port 3001 is already in use. Attempting to kill the process..."
  lsof -i :3001 -t | xargs kill -9
  sleep 1
  echo "✅ Process killed"
else
  echo "✅ Port 3001 is available"
fi

# Clean Next.js cache
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Create logs directory
mkdir -p logs

# Set the port environment variable
export PORT=3001
export NEXT_PUBLIC_FONT_SERVER_URL="http://localhost:3000"

# Start the Next.js application
echo "🚀 Starting Next.js application on port 3001..."
npx next dev -p 3001 > logs/nextjs.log 2>&1 &

# Store the process ID
echo $! > .nextjs.pid

echo "
============================================================
🚀 Next.js application running on http://localhost:3001
============================================================
- Next.js app is using port 3001
- Fonts are loaded from the font server (http://localhost:3000)
- PID: $(cat .nextjs.pid)
- Log file: logs/nextjs.log

Make sure the font server is running on port 3000 by using:
  ./start-font-server-port-3000.sh

To stop Next.js:
  ./stop-nextjs.sh
"