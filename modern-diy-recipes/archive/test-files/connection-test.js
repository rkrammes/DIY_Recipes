/**
 * Simple connectivity test server that binds to 0.0.0.0
 * This helps diagnose network binding issues
 */

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] Request received: ${req.method} ${req.url}`);
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Connection Test</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; padding: 2rem; }
        .success { color: green; }
        .info { color: blue; }
        pre { background: #f1f1f1; padding: 1rem; border-radius: 4px; }
      </style>
    </head>
    <body>
      <h1>Connection Test Successful</h1>
      <p class="success">✅ If you're seeing this, the server is running correctly and accessible!</p>
      
      <h2>Server Information</h2>
      <ul>
        <li><strong>Time:</strong> ${new Date().toISOString()}</li>
        <li><strong>Node Version:</strong> ${process.version}</li>
        <li><strong>Platform:</strong> ${process.platform}</li>
        <li><strong>Hostname:</strong> ${os.hostname()}</li>
        <li><strong>Network Interfaces:</strong></li>
        <pre>${JSON.stringify(os.networkInterfaces(), null, 2)}</pre>
      </ul>
      
      <h2>Request Information</h2>
      <ul>
        <li><strong>URL:</strong> ${req.url}</li>
        <li><strong>Method:</strong> ${req.method}</li>
        <li><strong>Headers:</strong></li>
        <pre>${JSON.stringify(req.headers, null, 2)}</pre>
      </ul>
      
      <p class="info">This is a diagnostic page to verify network connectivity.</p>
    </body>
    </html>
  `);
});

// Default to port 3000 if not specified
const PORT = process.env.PORT || 3000;

// Explicitly bind to all interfaces (0.0.0.0)
server.listen(PORT, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces();
  console.log('\n==== CONNECTION TEST SERVER ====');
  console.log(`Server running at:`);
  console.log(`- http://localhost:${PORT}/`);
  
  // List all possible URLs to access this server
  Object.keys(interfaces).forEach((ifName) => {
    interfaces[ifName].forEach((iface) => {
      // Skip internal and IPv6 interfaces for simplicity
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`- http://${iface.address}:${PORT}/`);
      }
    });
  });
  
  console.log('\nProcess ID:', process.pid);
  console.log('Press Ctrl+C to stop');
  console.log('================================\n');
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Try a different port.`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});