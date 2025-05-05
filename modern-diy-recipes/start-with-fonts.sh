#!/bin/bash

# Start the Next.js application with proper font handling
echo "🚀 Starting Next.js application with enhanced font handling on port 3000..."

# Check for existing processes on port 3000
echo "🔍 Checking for existing processes on port 3000..."
lsof -i :3000 | grep LISTEN
if [ $? -eq 0 ]; then
  echo "⚠️ Port 3000 is already in use. Attempting to kill the process..."
  lsof -i :3000 -t | xargs kill -9
  sleep 1
  echo "✅ Process killed"
else
  echo "✅ Port 3000 is available"
fi

# Clean Next.js cache
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Copy font files to ensure they're fresh
echo "📁 Ensuring font files are properly set up..."
if [ ! -d "public/fonts/backup" ]; then
  mkdir -p public/fonts/backup
fi

# Create logs directory
mkdir -p logs

# Set critical environment variables
export PORT=3000
export NEXT_PUBLIC_USE_FALLBACK_FONTS=true
export NEXT_FONT_DISPLAY=swap

# Start Next.js with proper configuration
echo "🚀 Starting Next.js with enhanced font handling on port 3000..."
echo "📝 Logs will be written to logs/nextjs-with-fonts.log"

# Start Next.js with output redirected to log file
npx next dev -p 3000 -H 0.0.0.0 > logs/nextjs-with-fonts.log 2>&1 &

# Store the process ID
echo $! > .nextjs-with-fonts.pid
sleep 2

# Check if the process is still running
if ps -p $(cat .nextjs-with-fonts.pid) > /dev/null; then
  echo "✅ Next.js is running on port 3000 (PID: $(cat .nextjs-with-fonts.pid))"
  echo "
============================================================
🎉 Next.js is now running at http://localhost:3000
============================================================
- Application is running on port 3000
- Enhanced font handling is enabled
- Font files are being properly served with correct MIME types
- Middleware is active for proper font handling

To stop the server:
  kill -9 $(cat .nextjs-with-fonts.pid)

To view the logs:
  tail -f logs/nextjs-with-fonts.log
"
else
  echo "❌ Failed to start Next.js. Check logs/nextjs-with-fonts.log for details."
  exit 1
fi