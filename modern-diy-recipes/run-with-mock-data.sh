#!/bin/bash

# KRAFT_AI Terminal Interface with Mock Data Mode
echo "===== KRAFT_AI Terminal Interface - Mock Data Mode ====="
echo "This script will:"
echo "1. Enable mock data mode to avoid Supabase issues"
echo "2. Start the application with mock data"
echo "3. Open the application in your browser"
echo ""

# Kill any existing processes on port 3000
echo "Checking for existing processes on port 3000..."
lsof -ti :3000 | xargs kill -9 2>/dev/null

# Clean the Next.js cache for a fresh start
echo "Cleaning Next.js cache..."
rm -rf .next

# Start the application with mock data mode
echo ""
echo "Starting the application with mock data mode enabled..."
echo "The application will be available at http://localhost:3000"
echo ""

# Function to open browser after server starts
function open_browser {
  # Wait a bit for the server to be ready
  sleep 5

  # Try to detect the OS and open the browser accordingly
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "http://localhost:3000"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "http://localhost:3000" || sensible-browser "http://localhost:3000" || \
    gnome-open "http://localhost:3000" || kde-open "http://localhost:3000"
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows with Git Bash or similar
    start "http://localhost:3000"
  else
    echo ""
    echo "Please open http://localhost:3000 in your browser"
  fi
}

# Start the application with mock data mode
export NEXT_PUBLIC_USE_MOCK_DATA=true
export NEXT_PUBLIC_DEFAULT_THEME=hackers
export NEXT_PUBLIC_AUDIO_ENABLED=true
open_browser &
npx next dev -p 3000