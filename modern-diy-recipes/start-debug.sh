#!/bin/bash

# Enhanced debug script that tries to start the app with detailed logging

# Kill any existing processes that might be using the ports
echo "Stopping any existing processes on common ports..."
lsof -i :3000 -t | xargs kill -9 2>/dev/null || true
lsof -i :3001 -t | xargs kill -9 2>/dev/null || true
sleep 2

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next/cache
rm -rf node_modules/.cache

# Create logs directory
mkdir -p logs

echo "Setting up environment..."
export DEBUG=*
export NODE_ENV=development
export PORT=3001
export NEXT_PUBLIC_UI_MODE=standard
export USE_TERMINAL_UI=false

# Create a timestamp for log files
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/debug-start-${TIMESTAMP}.log"

echo "Starting Next.js app with debug output to ${LOG_FILE}..."
echo "This will run in the foreground. Press Ctrl+C to stop."
echo ""
echo "To check if the app is running, open a new terminal and try:"
echo "  curl http://localhost:3001"
echo ""

# Start Next.js with debug output
npx next dev -p 3001 -H localhost | tee "${LOG_FILE}"