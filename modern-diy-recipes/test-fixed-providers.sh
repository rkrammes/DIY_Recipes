#!/bin/bash

# Script to test the fixed providers implementation

echo "🧹 Cleaning Next.js cache..."
rm -rf .next

echo "🗑️ Removing node_modules/.cache..."
rm -rf node_modules/.cache

echo "📝 Creating debug log location..."
mkdir -p logs

echo "🚀 Starting Next.js with fixed providers..."
NODE_OPTIONS="--max-old-space-size=4096 --trace-warnings" DEBUG=next:* npm run dev > logs/fixed-providers.log 2>&1 &
PID=$!

echo "✅ Development server started with PID: $PID"
echo "Navigate to http://localhost:3000/test-fixed-layout to view the test page"
echo "Log is being written to logs/fixed-providers.log"
echo ""
echo "Press Ctrl+C to stop the server and view the log"

# Wait for user to press Ctrl+C
trap "kill $PID; echo ''; echo 'Server stopped'; echo 'Last 20 lines of the log:'; tail -n 20 logs/fixed-providers.log" INT
wait $PID