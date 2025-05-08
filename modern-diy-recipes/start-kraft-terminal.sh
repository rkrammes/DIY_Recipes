#!/bin/bash

# Start the KRAFT_AI Terminal Interface
echo "Starting KRAFT_AI Terminal with Themes (hackers, dystopia, neotopia)"
echo ""

# Kill any existing processes on port 3000
echo "Checking for existing processes on port 3000..."
lsof -ti :3000 | xargs kill -9 2>/dev/null

# Clean the Next.js cache for a fresh start
echo "Cleaning Next.js cache..."
rm -rf .next

# Make sure logs directory exists
mkdir -p logs

# Start the server
echo "Starting the server - KRAFT_AI Terminal interface will appear at http://localhost:3000"
echo "This will show the original interface with all three themes"
echo ""

# Start Next.js with the default theme and audio enabled
NEXT_PUBLIC_DEFAULT_THEME=hackers NEXT_PUBLIC_AUDIO_ENABLED=true npx next dev -p 3000

echo "Server stopped."