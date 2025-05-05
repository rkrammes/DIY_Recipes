#!/bin/bash

# Start only the recipe API server

# Change directory to the project root
cd "$(dirname "$0")"

# Function to stop all processes on exit
cleanup() {
  echo "Stopping API server..."
  pkill -P $$
  exit
}

# Set up trap to catch exit signals
trap cleanup EXIT INT TERM

# Start the recipe API server
echo "Starting Recipe API server on port 3005..."
node recipe-api-server.js &
RECIPE_API_PID=$!
echo "Recipe API server started with PID $RECIPE_API_PID"

# Keep the script running until interrupted
echo ""
echo "API server is now running:"
echo "- Recipe API: http://localhost:3005/api/recipes"
echo ""
echo "Press Ctrl+C to stop the server"

# Wait for any process to exit
wait