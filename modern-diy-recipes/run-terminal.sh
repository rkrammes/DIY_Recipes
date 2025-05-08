#!/bin/bash

# KRAFT Terminal Interface Runner
echo "===== KRAFT Terminal Interface ====="
echo "This script will:"
echo "1. Attempt to fix database tables (if possible)"
echo "2. Start the application on port 3000"
echo "3. Show instructions for accessing the terminal interface"
echo ""

# Run the database setup script
echo "Checking database tables..."
node simple-db-setup.js

# Check if the app is already running on port 3000
if lsof -i :3000 > /dev/null 2>&1; then
  echo ""
  echo "An application is already running on port 3000."
  echo "You can access the terminal interface at: http://localhost:3000/terminal"
  echo ""
  exit 0
fi

# Start the application
echo ""
echo "Starting the application..."
echo "Once it's running, you can access the terminal interface at: http://localhost:3000/terminal"
echo ""
echo "To stop the application, press Ctrl+C"
echo ""

npm run dev