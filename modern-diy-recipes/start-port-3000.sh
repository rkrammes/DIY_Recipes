#!/bin/bash

# Start the Next.js application on port 3000 with database connectivity

echo "🚀 Starting Next.js application on port 3000..."

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

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next/cache

# Set environment variables
export PORT=3000
export NEXT_PUBLIC_PORT=3000
export NEXT_PUBLIC_USE_MOCK_DATA=false

# Start the Next.js development server
echo "🔄 Starting Next.js on port 3000..."
NODE_OPTIONS="--max-old-space-size=4096" next dev -p 3000