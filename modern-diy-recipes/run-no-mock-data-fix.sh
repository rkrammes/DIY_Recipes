#!/bin/bash

# KRAFT_AI Terminal Interface Fix Script for No Mock Data Rule
echo "===== KRAFT_AI Terminal Interface - No Mock Data Supabase Fix ====="
echo "This script will:"
echo "1. Check for Supabase configuration issues"
echo "2. Display any missing tables with transparent errors"
echo "3. Start the application with transparent error handling"
echo "4. Open the Settings page automatically to view Supabase status"
echo ""

# Step 1: Check Supabase configuration
echo "Step 1: Checking Supabase configuration..."
echo "⚠️ IMPORTANT: This will show actual Supabase errors transparently"
node src/Settings/setup-preferences-table.js

# Step 2: Update database schema type in supabase client
echo ""
echo "Step 2: Ensuring Settings database types are defined"
# This was already done in the TypeScript file

# Step 3: Start the application
echo ""
echo "Step 3: Starting application on http://localhost:3000"
echo "The Settings page will open automatically to show Supabase status"
echo "Navigate to the System tab to see connection status and any errors"
echo ""

# Check if there's already a server running
if lsof -i :3000 > /dev/null 2>&1; then
  echo "Error: A server is already running on port 3000"
  echo "Please stop the existing server first with: ./stop-all-servers.sh"
  exit 1
fi

# Function to open browser after server starts
function open_browser {
  # Wait a bit for the server to be ready
  sleep 5

  # Try to detect the OS and open the browser accordingly
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "http://localhost:3000/settings"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "http://localhost:3000/settings" || sensible-browser "http://localhost:3000/settings" || \
    gnome-open "http://localhost:3000/settings" || kde-open "http://localhost:3000/settings"
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows with Git Bash or similar
    start "http://localhost:3000/settings"
  else
    echo ""
    echo "Please open http://localhost:3000/settings in your browser to view the Settings module"
  fi
}

# Start the application with transparent error handling
export NEXT_PUBLIC_SUPABASE_NO_MOCK_DATA=true
open_browser &
npm run dev