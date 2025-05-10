#!/bin/bash

# Script to start the application on port 3000 with mock data
# This bypasses the Supabase issues until the database schema is fixed

echo "🚀 Starting Kraft AI on port 3000 with mock data"
echo "This is a temporary solution until the database schema is fixed"
echo ""

# Clean up existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "node.*next" 2>/dev/null
pkill -f "next dev" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Clean Next.js cache for a fresh start
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Ensure logs directory exists
mkdir -p logs

# Set environment variables for mock data mode
export PORT=3000
export NEXT_PUBLIC_PORT=3000
export NEXT_PUBLIC_UI_MODE=terminal
export NEXT_PUBLIC_ENABLE_MODULES=true
export NEXT_PUBLIC_TERMINAL_UI_ENABLED=true
export NEXT_PUBLIC_USE_MOCK_DATA=true
export NEXT_PUBLIC_SUPABASE_NO_MOCK_DATA=false
export NODE_OPTIONS="--max-old-space-size=4096"

echo ""
echo "⚠️ IMPORTANT: The following database issues need to be fixed:"
echo "   1. Missing tables: iterations, users"
echo "   2. Missing function: exec_sql"
echo ""
echo "   See create-missing-schema.sql for the SQL code to fix these issues"
echo ""

echo "⚡ Starting application with mock data..."
echo "📱 Application will be available at: http://localhost:3000"
echo "⚙️ Settings page: http://localhost:3000/settings"
echo "🖥️ Terminal interface: http://localhost:3000/terminal"
echo ""

# Start Next.js and log output
npx next dev -p 3000 2>&1 | tee logs/mock-data-server-$(date +%Y%m%d_%H%M%S).log