#!/bin/bash

echo "Starting app with Settings UI integration on port 3000..."

# Stop any existing servers first
if [ -f "./stop-all-servers.sh" ]; then
  ./stop-all-servers.sh
fi

# Set environment variable to prevent mock data
export NEXT_PUBLIC_SUPABASE_NO_MOCK_DATA=true

# Start next.js development server on port 3000
echo "Starting Next.js development server..."
npx next dev -p 3000

echo "Application started. Open http://localhost:3000 in your browser."
echo "Use Ctrl+C to stop the server."