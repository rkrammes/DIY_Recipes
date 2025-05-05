#!/bin/bash

# Stop the Next.js application
echo "🛑 Stopping Next.js application..."

if [ -f .nextjs.pid ]; then
  PID=$(cat .nextjs.pid)
  if ps -p $PID > /dev/null; then
    kill $PID
    echo "✅ Next.js stopped (PID: $PID)"
  else
    echo "⚠️ Next.js process not found (PID: $PID)"
  fi
  rm .nextjs.pid
else
  echo "⚠️ Next.js PID file not found"
  
  # Try to find and kill any process using port 3001
  PORT_PROCESS=$(lsof -i :3001 -t)
  if [ -n "$PORT_PROCESS" ]; then
    echo "🔍 Found process using port 3001: $PORT_PROCESS"
    kill -9 $PORT_PROCESS
    echo "✅ Process killed"
  else
    echo "⚠️ No process found using port 3001"
  fi
fi