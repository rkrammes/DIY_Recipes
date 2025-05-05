#!/bin/bash

# Improved server start script based on diagnostic findings
# Addresses circular dependencies, SSR issues, and startup performance

echo "🚀 Starting fixed Next.js server..."

# 1. Kill any existing Next.js processes
echo "🔍 Checking for existing Next.js processes..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  pgrep -f "next dev" | xargs kill -9 2>/dev/null || echo "No Next.js processes found"
else
  # Linux
  pkill -f "next dev" 2>/dev/null || echo "No Next.js processes found"
fi

# 2. Clean Next.js cache to ensure clean start
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# 3. Create logs directory
mkdir -p logs

# 4. Verify network connectivity
echo "🌐 Verifying network connectivity..."
node -e "
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200); 
  res.end('OK');
});
server.listen(0, '0.0.0.0', () => {
  const port = server.address().port;
  console.log('Test server running on port ' + port);
  http.get('http://localhost:' + port, (res) => {
    console.log('✅ Network connectivity verified');
    server.close();
  }).on('error', (err) => {
    console.error('❌ Network connectivity test failed: ' + err.message);
    process.exit(1);
  });
});"

# 5. Set Node.js options for better performance and debugging
export NODE_OPTIONS="--max-old-space-size=4096"

# 6. Use a specific port and bind to all interfaces
PORT=3456
echo "🔌 Using port $PORT and binding to all interfaces (0.0.0.0)"

# 7. Start Next.js with specific flags
echo "📝 Starting Next.js with enhanced logging..."
npx next dev -p $PORT -H 0.0.0.0 > logs/fixed-server.log 2>&1 &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 5

# 8. Verify the server is running
if kill -0 $SERVER_PID 2>/dev/null; then
  echo "✅ Server started with PID: $SERVER_PID"
  echo "🌐 Available at:"
  echo "  - http://localhost:$PORT"
  echo "  - http://127.0.0.1:$PORT"
  
  # 9. Try to get the server's response
  echo "🔄 Testing server connectivity..."
  curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:$PORT >/dev/null 2>&1
  CURL_STATUS=$?
  
  if [ $CURL_STATUS -eq 0 ]; then
    echo "✅ Server is accessible!"
  else
    echo "⚠️ Could not connect to server with curl. The server is running but might not be accessible."
    echo "📋 Possible reasons:"
    echo "  - Firewall blocking connections"
    echo "  - Server still initializing"
    echo "  - Next.js configuration issues"
    echo ""
    echo "📝 Check logs/fixed-server.log for details"
  fi
  
  echo ""
  echo "🔍 To monitor the server log:"
  echo "  tail -f logs/fixed-server.log"
  
  echo ""
  echo "🛑 To stop the server:"
  echo "  kill $SERVER_PID"
else
  echo "❌ Server failed to start. Check logs/fixed-server.log for details"
  tail -n 20 logs/fixed-server.log
fi