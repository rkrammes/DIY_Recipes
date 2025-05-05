#!/bin/bash

# Script to restart API and Next.js servers with the latest changes

# Change directory to the project root
cd "$(dirname "$0")"

# Function to stop all processes on exit
cleanup() {
  echo "Stopping all processes..."
  pkill -P $$
  exit
}

# Set up trap to catch exit signals
trap cleanup EXIT INT TERM

# Kill any existing servers
echo "Killing any existing servers..."
pkill -f "node recipe-api-server.js" || true
pkill -f "next dev" || true

# Wait a moment to ensure servers are stopped
sleep 2

# Start the recipe API server in the background
echo "Starting Recipe API server on port 3005..."
node recipe-api-server.js &
RECIPE_API_PID=$!
echo "Recipe API server started with PID $RECIPE_API_PID"

# Give it a moment to start up
sleep 2

# Test that the API is running
echo "Testing API connection..."
curl -s http://localhost:3005/api/status > /dev/null
if [ $? -ne 0 ]; then
  echo "⚠️ Warning: API server may not be running properly"
else
  echo "✅ API server is running"
fi

# Start the Next.js app
echo "Starting Next.js app on port 3000..."
npm run dev &
NEXT_PID=$!
echo "Next.js app started with PID $NEXT_PID"

# Wait a moment to let Next.js start
sleep 5

# Check if Next.js is running
echo "Testing Next.js connection..."
curl -s http://localhost:3000 > /dev/null
if [ $? -ne 0 ]; then
  echo "⚠️ Warning: Next.js app may not be running properly"
else
  echo "✅ Next.js app is running"
fi

echo ""
echo "Both services are now running:"
echo "- Recipe API: http://localhost:3005/api/recipes"
echo "- Next.js app: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Print some connection stats periodically
while true; do
  sleep 30
  echo "Services status ($(date +%H:%M:%S)):"
  curl -s http://localhost:3005/api/status > /dev/null && echo "- API: ✅ Running" || echo "- API: ❌ Not responding"
  curl -s http://localhost:3000 > /dev/null && echo "- Next.js: ✅ Running" || echo "- Next.js: ❌ Not responding"
done