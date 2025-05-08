#!/bin/bash

# KRAFT Terminal Interface with Secure Supabase Config
echo "===== KRAFT Terminal Interface with Secure Supabase Config ====="
echo "This script will start the application with the updated Supabase configuration"
echo "using the correct anon key for client-side operations."
echo ""

# Check if the app is already running
if lsof -i :3000 > /dev/null 2>&1; then
  echo "There's already an application running on port 3000."
  echo "Please stop it first with: kill $(lsof -t -i:3000)"
  exit 1
fi

# Start the app
echo "Starting the application with secure Supabase configuration..."
echo "You can access the terminal interface at: http://localhost:3000/terminal"
echo ""
echo "Note: The KraftTerminalModularLayout component has been updated to handle"
echo "missing tables gracefully. If you see error messages about missing tables,"
echo "you'll need to create them using the Supabase SQL Editor."
echo ""

npm run dev