#!/bin/bash

# KRAFT Terminal Interface - Fixed Supabase Config Loader
echo "===== KRAFT Terminal Interface with Fixed Supabase Config ====="
echo "This script will:"
echo "1. Check if tables exist and recommend fixes"
echo "2. Start the application with proper configuration"
echo "3. Show security recommendations"
echo ""

# Display current configuration status
echo "Analyzing Supabase configuration..."
node fix-supabase-config.js

# Check tables
echo ""
echo "Checking tables with service role key..."
node create-tables-fixed.js

# Reminders about security
echo ""
echo "SECURITY REMINDER"
echo "================="
echo "Running with current configuration may expose admin permissions to the client."
echo "Please fix your configuration as described in FIX_SUPABASE_CONFIG.md"
echo ""

# Start the application
echo "Starting the application..."
echo "Access the terminal interface at: http://localhost:3000/terminal"
echo ""

npm run dev