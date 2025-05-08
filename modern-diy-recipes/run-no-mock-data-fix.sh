#!/bin/bash

# KRAFT_AI Terminal Interface Fix Script for No Mock Data Rule
echo "===== KRAFT_AI Terminal Interface - No Mock Data Rule Fix ====="
echo "This script will:"
echo "1. Check for missing tables in the database"
echo "2. Create any missing tables with sample data"
echo "3. Start the application with proper configuration"
echo ""

# Step 1: Check database tables
echo "Step 1: Checking database tables..."
node create-missing-tables.js

# Step 2: Start the application
echo ""
echo "Step 2: Starting application on http://localhost:3000"
echo "Navigate to http://localhost:3000/terminal to see the Kraft Terminal Interface"
echo ""

# Check if there's already a server running
if lsof -i :3000 > /dev/null 2>&1; then
  echo "Error: A server is already running on port 3000"
  echo "Please stop the existing server first with: ./stop-all-servers.sh"
  exit 1
fi

# Start the application
npm run dev