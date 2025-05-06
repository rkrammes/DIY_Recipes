#!/bin/bash

# Start a Next.js server specifically configured for the document-centric interface
# This script ensures the document-centric interface with iterations is available for testing

echo "Starting server in document-centric mode..."

# Create a temporary Next.js config if needed
echo "Setting up document-centric mode configuration..."

# Kill any existing Next.js processes
pkill -f "next dev" || true
sleep 1

# Start the Next.js server with our document test route
echo "Starting Next.js server..."
PORT=3000 npx next dev &
NEXT_PID=$!

echo "Server started with PID: $NEXT_PID"
echo "Document-centric interface will be available at http://localhost:3000/document-test"
echo "Simple document interface is available at http://localhost:3000/simple-doc"
echo ""
echo "Press Ctrl+C to stop the server"

# Save PID for later cleanup
echo $NEXT_PID > .document-mode-pid

# Wait for the server to be killed
wait $NEXT_PID