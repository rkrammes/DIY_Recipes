#!/bin/bash

# Start the KRAFT_AI Terminal with Modular Architecture
echo "Starting KRAFT_AI Terminal with Modular Architecture"
echo "Combines original terminal UI with modular system"
echo ""

# Kill any existing processes on port 3000
echo "Checking for existing processes on port 3000..."
lsof -ti :3000 | xargs kill -9 2>/dev/null

# Clean the Next.js cache for a fresh start
echo "Cleaning Next.js cache..."
rm -rf .next

# Make sure logs directory exists
mkdir -p logs

# Start the server with the module system
echo "Starting the server - KRAFT_AI Terminal Modular Interface will appear at http://localhost:3000/kraft-modular"
echo "This will show the original terminal interface with modular architecture"
echo ""

# Start Next.js with the default theme and audio enabled
NEXT_PUBLIC_DEFAULT_THEME=hackers NEXT_PUBLIC_AUDIO_ENABLED=true NEXT_PUBLIC_ENABLE_MODULES=true npx next dev -p 3000

echo "Server stopped."