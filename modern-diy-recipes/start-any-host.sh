#!/bin/bash

# Start Next.js binding to all interfaces with verbose logging
# This addresses connectivity issues by ensuring proper network binding

# Kill any processes on port 3000
echo "🔍 Checking for processes on port 3000..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  PID=$(lsof -i :3000 -t 2>/dev/null)
  if [[ ! -z "$PID" ]]; then
    echo "🛑 Killing process $PID on port 3000"
    kill -9 $PID
    sleep 1
  else
    echo "✅ No processes found on port 3000"
  fi
else
  # Linux
  PID=$(netstat -tlnp 2>/dev/null | grep ":3000" | awk '{print $7}' | cut -d'/' -f1)
  if [[ ! -z "$PID" ]]; then
    echo "🛑 Killing process $PID on port 3000"
    kill -9 $PID
    sleep 1
  else
    echo "✅ No processes found on port 3000"
  fi
fi

# Clean cache
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Test localhost connectivity
echo "🔄 Testing localhost connectivity..."
node -e "
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Connectivity test successful');
});
server.listen(9999, '0.0.0.0', () => {
  console.log('Test server running on http://0.0.0.0:9999');
  
  // Test self-connection
  http.get('http://localhost:9999', (res) => {
    console.log('✅ Self-connection test successful: Status ' + res.statusCode);
    server.close(() => {
      console.log('Test server closed');
    });
  }).on('error', (err) => {
    console.error('❌ Self-connection test failed: ' + err.message);
    process.exit(1);
  });
});" || echo "❌ Localhost connectivity test failed"

# Start server on all interfaces with DEBUG
echo "🚀 Starting Next.js on 0.0.0.0:3000 with verbose logging..."
DEBUG=* NODE_OPTIONS="--max-old-space-size=4096" npm run dev -- -p 3000 -H 0.0.0.0