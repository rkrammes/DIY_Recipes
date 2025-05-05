#!/bin/bash

# Script to start Next.js application with font support on port 3000
echo "🚀 Starting Next.js application with font support on port 3000..."

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

# Create logs directory if it doesn't exist
mkdir -p logs

# Clean Next.js cache
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Start the app with the font-enabled server on port 3000
echo "🚀 Starting Next.js app with font support on port 3000..."
node next-with-fonts-3000.js