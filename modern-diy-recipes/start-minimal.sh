#!/bin/bash

# Script to start a clean minimal test instance

echo "🧹 Cleaning Next.js cache..."
rm -rf .next

echo "🗑️ Removing node_modules/.cache..."
rm -rf node_modules/.cache

echo "📦 Installing dependencies if needed..."
npm install

echo "🚀 Starting minimal test server..."
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# If server crashes, print message
if [ $? -ne 0 ]; then
  echo "❌ Server crashed. Check the error message above."
  echo "Try navigating to http://localhost:3000/minimal-test if it's still running."
else
  echo "✅ Server started successfully. Navigate to http://localhost:3000/minimal-test"
fi