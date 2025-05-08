#!/bin/bash

# Setup script that creates missing tables and starts the app
echo "===== KRAFT_AI Terminal Interface with Database Setup ====="
echo "This script will:"
echo "1. Check for missing tables in Supabase"
echo "2. Create them if necessary"
echo "3. Start the application on port 3000"
echo ""

# Run the database setup script
echo "Checking database tables..."
node create-missing-tables.js

# Start the application regardless of success/failure
echo ""
echo "Starting application on http://localhost:3000"
echo "Navigate to http://localhost:3000/terminal to see the Kraft Terminal Interface"
echo ""

# Start the application on port 3000
npm run dev