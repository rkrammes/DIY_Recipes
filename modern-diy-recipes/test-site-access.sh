#!/bin/bash

# Script to test if the site is accessible
echo "Testing if the Kraft Terminal Interface is accessible..."
echo "Checking for server on port 3000..."

# Check if there's a server running on port 3000
if ! lsof -i :3000 >/dev/null 2>&1; then
  echo "❌ No server running on port 3000"
  echo "Please start the server with: npm run dev"
  exit 1
fi

echo "✅ Server is running on port 3000"
echo "Testing access to the home page..."

# Try to access the homepage
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)

if [ "$RESPONSE" = "200" ]; then
  echo "✅ Homepage is accessible!"
  echo "KraftTerminalModularLayout should be visible at http://localhost:3000/"
  echo ""
  echo "The application is working with the secure Supabase configuration."
  echo "If you see errors about missing tables, you need to run the SQL commands"
  echo "in the Supabase SQL Editor as described in supabase-sql-commands.md"
else
  echo "❌ Could not access the homepage (HTTP code: $RESPONSE)"
  echo "There might be an issue with the application or the server."
  echo "Check the server logs for more details."
fi