#!/bin/bash

# Direct Next.js startup script for port 3000
echo "🚀 Starting Next.js directly on port 3000..."

# Kill any existing processes on port 3000
echo "🔍 Checking for processes on port 3000..."
PORT_PROCESS=$(lsof -i :3000 -t)
if [ -n "$PORT_PROCESS" ]; then
  echo "⚠️ Port 3000 is in use. Killing process..."
  kill -9 $PORT_PROCESS
  sleep 1
else
  echo "✅ Port 3000 is available"
fi

# Set port
export PORT=3000
export NODE_OPTIONS="--max-old-space-size=4096"

# Start Next.js in development mode
echo "🚀 Starting Next.js on port 3000..."
cd "/Users/ryankrammes/Kraft_AI (App)/DIY_Recipes/modern-diy-recipes"
npx next dev -p 3000