#!/bin/bash
# Simple script to launch a Python HTTP server
# This is often more reliable than Node.js for simple static serving

echo "Starting Python HTTP server on port 3000..."
echo "You can access it at http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")"
python3 -m http.server 3000

# This script will run in the foreground
# If you want to run it in background, use:
# python3 -m http.server 3000 &