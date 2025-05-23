#!/bin/bash

# dev.sh - Quick development server start with common options
# This is a convenience wrapper around server.sh for development

# Set development environment
export NODE_ENV=development

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Default to mock data unless explicitly set
if [ -z "$NEXT_PUBLIC_USE_MOCK_DATA" ]; then
  export NEXT_PUBLIC_USE_MOCK_DATA=true
fi

echo "Starting development server..."
echo "Mock data: $NEXT_PUBLIC_USE_MOCK_DATA"
echo "Port: 3000"

# Start with font server by default in dev
./server.sh --port=3000 --with-font-server "$@"