#!/bin/bash

# Script to start Next.js with font fixes
echo "🚀 Starting Next.js with font handling fixes on port 3000..."

# Check for existing processes on port 3000
echo "🔍 Checking for existing processes on port 3000..."
lsof -i :3000 | grep LISTEN
if [ $? -eq 0 ]; then
  echo "⚠️ Port 3000 is already in use. Killing process..."
  lsof -i :3000 -t | xargs kill -9
  sleep 1
  echo "✅ Process killed"
else
  echo "✅ Port 3000 is available"
fi

# Start the fixed Next.js server
echo "🚀 Starting the fixed Next.js server on port 3000..."
node font-fix.js