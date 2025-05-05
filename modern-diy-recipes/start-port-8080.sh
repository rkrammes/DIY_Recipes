#!/bin/bash

# Start Next.js on port 8080

# Kill any processes on port 8080
echo "🔍 Checking for processes on port 8080..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  PID=$(lsof -i :8080 -t 2>/dev/null)
  if [[ ! -z "$PID" ]]; then
    echo "🛑 Killing process $PID on port 8080"
    kill -9 $PID
    sleep 1
  else
    echo "✅ No processes found on port 8080"
  fi
else
  # Linux
  PID=$(netstat -tlnp 2>/dev/null | grep ":8080" | awk '{print $7}' | cut -d'/' -f1)
  if [[ ! -z "$PID" ]]; then
    echo "🛑 Killing process $PID on port 8080"
    kill -9 $PID
    sleep 1
  else
    echo "✅ No processes found on port 8080"
  fi
fi

# Clean cache
echo "🧹 Cleaning Next.js cache..."
rm -rf .next

# Start server
echo "🚀 Starting Next.js on port 8080..."
npm run dev -- -p 8080