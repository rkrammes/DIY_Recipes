#!/bin/bash

# Kill all Next.js processes

echo "🔍 Looking for Next.js processes..."

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  PIDS=$(ps aux | grep 'next' | grep -v grep | grep -v 'kill-servers.sh' | awk '{print $2}')
  PORT_PIDS=$(lsof -i :3000 -t 2>/dev/null)
  
  # Combine PIDs from both sources
  ALL_PIDS="$PIDS $PORT_PIDS"
else
  # Linux and other Unix-like systems
  PIDS=$(ps aux | grep 'next' | grep -v grep | grep -v 'kill-servers.sh' | awk '{print $2}')
  PORT_PIDS=$(netstat -tulpn 2>/dev/null | grep ":3000 " | awk '{print $7}' | cut -d'/' -f1)
  
  # Combine PIDs from both sources
  ALL_PIDS="$PIDS $PORT_PIDS"
fi

# Remove duplicates and empty strings
ALL_PIDS=$(echo "$ALL_PIDS" | tr ' ' '\n' | grep -v '^$' | sort -u)

if [[ -z "$ALL_PIDS" ]]; then
  echo "✅ No Next.js processes found"
  exit 0
fi

echo "🛑 Found the following processes to kill:"
for PID in $ALL_PIDS; do
  # Get process info
  if [[ "$OSTYPE" == "darwin"* ]]; then
    PROC_INFO=$(ps -p $PID -o command= 2>/dev/null)
  else
    PROC_INFO=$(ps -p $PID -o cmd= 2>/dev/null)
  fi
  
  if [[ ! -z "$PROC_INFO" ]]; then
    echo "  PID $PID: $PROC_INFO"
    kill -9 $PID 2>/dev/null
    echo "  ✓ Killed"
  fi
done

echo "✅ All Next.js processes killed"

# Check port 3000 to make sure it's free
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  PORT_CHECK=$(lsof -i :3000 -t 2>/dev/null)
else
  # Linux and other Unix-like systems
  PORT_CHECK=$(netstat -tulpn 2>/dev/null | grep ":3000 ")
fi

if [[ -z "$PORT_CHECK" ]]; then
  echo "✅ Port 3000 is now free"
else
  echo "❌ Port 3000 is still in use. You may need to wait a moment or reboot."
fi