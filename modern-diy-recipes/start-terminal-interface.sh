#\!/bin/bash

# Start the KRAFT_AI Terminal with Modular Architecture - Main Entry Point
echo "Starting KRAFT_AI Terminal Interface"
echo "Three-column terminal UI with modular architecture"
echo ""

# Kill any existing processes on port 3000
echo "Checking for existing processes on port 3000..."
lsof -ti :3000 | xargs kill -9 2>/dev/null

# Clean the Next.js cache for a fresh start
echo "Cleaning Next.js cache..."
rm -rf .next

# Make sure logs directory exists
mkdir -p logs

# Set file as the main log file
LOG_FILE="logs/terminal-interface.log"

# Start the server with the module system
echo "Starting the server - KRAFT_AI Terminal Interface will be available at http://localhost:3000"
echo "This interface has three columns:"
echo "  1. First column: Top-level navigation (fixed width)"
echo "  2. Second column: Items within selected category (fixed width)"
echo "  3. Third column: Active document window (flexible width)"
echo ""
echo "Logging to $LOG_FILE"

# Start Next.js with the default theme and audio enabled
NEXT_PUBLIC_DEFAULT_THEME=hackers NEXT_PUBLIC_AUDIO_ENABLED=true NEXT_PUBLIC_ENABLE_MODULES=true npx next dev -p 3000 > "$LOG_FILE" 2>&1

echo "Server stopped."
