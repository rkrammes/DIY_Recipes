#!/bin/bash

# Start Next.js with Font Server
# This script starts both the font server on port 3000 and the Next.js application on another port

echo "🚀 Starting Next.js with dedicated Font Server"

# Step 1: Start the font server on port 3000
echo "Step 1: Starting Font Server on port 3000..."
./start-font-server-port-3000.sh

# Step 2: Wait for font server to be ready
echo "Waiting for font server to be ready..."
sleep 2

# Step 3: Test if font server is accessible
echo "Testing font server..."
if curl -s http://localhost:3000 > /dev/null; then
  echo "✅ Font server is running on port 3000"
else
  echo "❌ Font server is not responding. Check logs/font-server.log"
  exit 1
fi

# Step 4: Start Next.js on a different port (e.g., 3001)
echo "Step 4: Starting Next.js on port 3001..."

# Make sure port 3001 is available
lsof -i :3001 | grep LISTEN
if [ $? -eq 0 ]; then
  echo "⚠️ Port 3001 is already in use. Killing the process..."
  lsof -i :3001 -t | xargs kill -9
  sleep 1
  echo "✅ Process killed."
else
  echo "✅ Port 3001 is available."
fi

# Clean Next.js cache
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Create logs directory if it doesn't exist
mkdir -p logs

# Start Next.js on port 3001
echo "🚀 Starting Next.js on port 3001..."
PORT=3001 npx next dev -p 3001 > logs/nextjs.log 2>&1 &

# Store the Next.js process ID
echo $! > .nextjs.pid
echo "✅ Next.js started with PID $(cat .nextjs.pid)"
echo "📝 Log file: logs/nextjs.log"

echo "
============================================================
🎉 Your setup is now running!
============================================================

🔤 Font Server: http://localhost:3000
   - Serving font files with correct MIME types
   - Test page: http://localhost:3000/font-test.html

🚀 Next.js App: http://localhost:3001
   - Your application is running with font support
   - Fonts are loaded from the font server

The font-loader.js script is already configured to use the font server
at http://localhost:3000 as a fallback source for fonts.

To stop all servers:
  ./stop-all-servers.sh

To view logs:
  Next.js: tail -f logs/nextjs.log
  Font Server: tail -f logs/font-server.log
"