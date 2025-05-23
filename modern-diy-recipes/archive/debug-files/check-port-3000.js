const http = require('http');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (\!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file path
const logFilePath = path.join(logsDir, `port-3000-check-${Date.now()}.log`);
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  logStream.write(logMessage);
}

log('🔍 Checking if server is running on port 3000...');

// Try to connect to localhost:3000
const req = http.get('http://localhost:3000', (res) => {
  log(`🟢 Connection successful\! Server is running on port 3000.`);
  log(`📝 Status: ${res.statusCode} ${res.statusMessage}`);
  log(`📋 Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    log(`📄 Received ${data.length} bytes of data`);
    log('✅ Port 3000 check completed successfully');
    logStream.end();
    process.exit(0);
  });
});

req.on('error', (error) => {
  log(`❌ Error connecting to port 3000: ${error.message}`);
  log('⚠️ The server does not appear to be running on port 3000');
  logStream.end();
  process.exit(1);
});

// Set a timeout to prevent hanging
req.setTimeout(5000, () => {
  log('⚠️ Connection timeout after 5 seconds');
  req.destroy();
  logStream.end();
  process.exit(1);
});
