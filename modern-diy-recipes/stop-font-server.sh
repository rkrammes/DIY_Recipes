#!/bin/bash

# Stop the font server
echo "🛑 Stopping font server..."

if [ -f .font-server.pid ]; then
  PID=$(cat .font-server.pid)
  if ps -p $PID > /dev/null; then
    kill $PID
    echo "✅ Font server stopped (PID: $PID)"
  else
    echo "⚠️ Font server process not found (PID: $PID)"
  fi
  rm .font-server.pid
else
  echo "⚠️ Font server PID file not found"
  
  # Try to find and kill any process using port 3000
  PORT_PROCESS=$(lsof -i :3000 -t)
  if [ -n "$PORT_PROCESS" ]; then
    echo "🔍 Found process using port 3000: $PORT_PROCESS"
    kill -9 $PORT_PROCESS
    echo "✅ Process killed"
  else
    echo "⚠️ No process found using port 3000"
  fi
fi