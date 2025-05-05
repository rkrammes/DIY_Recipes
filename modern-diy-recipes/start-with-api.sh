#!/bin/bash

# Start both the Next.js app and our recipe API server

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

# Start the recipe API server in the background
echo "Starting Recipe API server on port 3005..."
node recipe-api-server.js &
RECIPE_API_PID=$!
echo "Recipe API server started with PID $RECIPE_API_PID"

# Give it a moment to start up
sleep 2

# Start the Next.js app
echo "Starting Next.js app on port 3000..."
npm run dev &
NEXT_PID=$!
echo "Next.js app started with PID $NEXT_PID"

# Keep the script running until interrupted
echo ""
echo "Both services are now running:"
echo "- Recipe API: http://localhost:3005/api/recipes"
echo "- Next.js app: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for any process to exit
wait