#!/bin/bash

# Script to start the Next.js application on port 3000
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

# Clean Next.js cache
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Create logs directory
mkdir -p logs

# Set the port environment variable
export PORT=3000

# Start the Next.js application
echo "🚀 Starting Next.js application on port 3000..."
npx next dev -p 3000 -H 0.0.0.0