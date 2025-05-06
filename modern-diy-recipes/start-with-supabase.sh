#!/bin/bash

# Stop any running server
echo "Stopping any running servers..."
pkill -f "node.*3000" || true
sleep 2

# Clear cache
echo "Clearing Next.js cache..."
rm -rf .next/cache

# Set environment mode
export UI_MODE="standard"
export USE_TERMINAL_UI="false"
export DEBUG="supabase:*"

# Start the server with the correct configuration
echo "Starting server in standard mode with Supabase..."
NEXT_PUBLIC_UI_MODE=standard USE_TERMINAL_UI=false npm run dev