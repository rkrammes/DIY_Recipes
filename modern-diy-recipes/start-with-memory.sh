#!/bin/bash

# Start the DIY Recipes application with memory agent tracking
# This script integrates the memory agent to track development progress

# Initialize the memory agent
echo "🧠 Initializing memory agent..."
node ../../start-development.js &
MEMORY_PID=$!

# Give memory agent a moment to initialize
sleep 2

# Clean up Next.js cache for a fresh start
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Create log directory
mkdir -p logs

# Record the start of development session
echo "📝 Recording development session start..."
curl -X POST -H "Content-Type: application/json" -d '{
  "task_id": "session-'$(date +%s)'",
  "title": "Development Session - DIY Recipes",
  "description": "Working on DIY Recipes application with fixed providers",
  "status": "in_progress",
  "priority": "high",
  "assigned_to": "'$(whoami)'",
  "tags": ["session", "diy-recipes", "fixed-providers"]
}' http://localhost:3001/memory/recordTask || echo "❌ Failed to record session - Memory agent may not be running"

# Start the Next.js server with debugging enabled
echo "🚀 Starting Next.js development server..."
NODE_OPTIONS="--max-old-space-size=4096" DEBUG=next:* npm run dev > logs/dev-server.log 2>&1 &
DEV_PID=$!

echo "✅ Development environment initialized"
echo "Memory agent running with PID: $MEMORY_PID"
echo "Next.js server running with PID: $DEV_PID"
echo "Navigate to http://localhost:3000 to view the application"
echo "Logs are written to logs/dev-server.log"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to clean up processes on exit
function cleanup {
  echo ""
  echo "Stopping services..."
  
  # Stop Next.js server
  kill $DEV_PID
  
  # Record development session end
  echo "📝 Recording development session end..."
  curl -X POST -H "Content-Type: application/json" -d '{
    "task_id": "session-'$(date +%s)'",
    "status": "completed",
    "completion_date": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }' http://localhost:3001/memory/recordTask || echo "Failed to record session end"
  
  # Stop memory agent
  kill $MEMORY_PID
  
  echo "Services stopped"
  exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup SIGINT

# Wait for processes
wait $DEV_PID