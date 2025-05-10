#!/bin/bash

# Start script with comprehensive error handling and mock data
# This script fixes the issues with missing UI components

echo "🚀 Starting Kraft AI with comprehensive error handling"
echo "This script will:"
echo "1. Verify UI components are properly linked"
echo "2. Start the application with mock data enabled"
echo "3. Use the working port 8080 to avoid port 3000 issues"
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Clean up any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "node.*next" 2>/dev/null
pkill -f "next dev" 2>/dev/null
lsof -ti:8080 | xargs kill -9 2>/dev/null

# Clean cache
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Create logs directory
mkdir -p logs

# Set environment variables for robust operation
export PORT=8080
export NEXT_PUBLIC_PORT=8080
export NEXT_PUBLIC_UI_MODE=terminal
export NEXT_PUBLIC_ENABLE_MODULES=true
export NEXT_PUBLIC_ENABLE_RECIPE_VERSIONING=true
export NEXT_PUBLIC_TERMINAL_UI_ENABLED=true
export NEXT_PUBLIC_USE_MOCK_DATA=true
export NEXT_PUBLIC_SUPABASE_NO_MOCK_DATA=false
export NODE_OPTIONS="--max-old-space-size=4096"

# Run the Node.js verification script to check all UI components
echo "🔍 Verifying UI components..."
node ui-component-check.js
if [ $? -ne 0 ]; then
    echo "⚠️ Warning: Some UI components might be missing. The script will use the fallback implementations."
    node fix-imports.js
fi

# Display the configuration
echo ""
echo "🔧 Configuration:"
echo "- Port: 8080"
echo "- UI Mode: terminal"
echo "- Mock Data: enabled"
echo "- Modules: enabled"
echo "- Recipe Versioning: enabled"
echo ""

# Important message for the user
echo "⚠️ Important: This script uses mock data mode to bypass Supabase issues."
echo "   When Supabase configuration is properly fixed, you can disable mock data"
echo "   by setting NEXT_PUBLIC_USE_MOCK_DATA=false."
echo ""

# Start the Next.js application
echo "🌟 Starting application..."
echo "📱 Access the app at: http://localhost:8080"
echo "⚙️ Settings page: http://localhost:8080/settings"
echo "🖥️ Terminal: http://localhost:8080/terminal"
echo ""

echo "💡 Press Ctrl+C to stop the server"
echo "---------------------------------------------"

# Start Next.js with explicit port setting
npx next dev -p 8080 -H 0.0.0.0 2>&1 | tee logs/fixed-server-$(date +%Y%m%d_%H%M%S).log

# This will only run if the server fails
echo "❌ Server process ended. Check the logs for any errors."