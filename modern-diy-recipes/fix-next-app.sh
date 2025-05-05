#!/bin/bash

# Fix Next.js app script
echo "🔧 Fixing Next.js application and font loading issues..."

# 1. Stop any running processes on port 3000
echo "🛑 Stopping any processes on port 3000..."
lsof -i :3000 | grep LISTEN
if [ $? -eq 0 ]; then
  echo "⚠️ Found process on port 3000. Killing it..."
  lsof -i :3000 -t | xargs kill -9
  sleep 1
else
  echo "✅ No processes running on port 3000"
fi

# 2. Clean the Next.js cache
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache
npm cache clean --force

# 3. Install dependencies again
echo "📦 Reinstalling dependencies..."
npm install

# 4. Create simple production build
echo "🏗️ Creating production build..."
npm run build

# 5. Start the production build on port 3000
echo "🚀 Starting Next.js app on port 3000..."
PORT=3000 npm start