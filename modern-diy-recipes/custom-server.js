#!/usr/bin/env node

// A custom server script that serves a simple HTML page on multiple ports
// This will help us determine if there's a network accessibility issue

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ports = [3000, 3001, 8000, 8080];

// Get local IP address
function getLocalIP() {
  try {
    // Different commands for different OS
    let cmd;
    if (process.platform === 'darwin') { // macOS
      cmd = "ipconfig getifaddr en0 || ipconfig getifaddr en1";
    } else if (process.platform === 'linux') {
      cmd = "hostname -I | awk '{print $1}'";
    } else if (process.platform === 'win32') {
      cmd = "ipconfig | findstr /i \"IPv4\" | findstr /v \"10.0.0.0-10.255.255.255\" | head -1";
    }
    
    // Execute the command
    return execSync(cmd).toString().trim();
  } catch (e) {
    console.error('Error getting local IP:', e.message);
    return 'unknown';
  }
}

// Create a simple HTML page
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Network Test Page</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 2em; }
    .success { color: green; }
    .info { color: blue; }
    code { background-color: #f0f0f0; padding: 2px 4px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Network Test Page</h1>
  <p class="success">✅ The server is running and accessible.</p>
  
  <h2>Server Information</h2>
  <ul>
    <li>Time: <span id="server-time">${new Date().toLocaleString()}</span></li>
    <li>Server: Node.js ${process.version}</li>
    <li>Platform: ${process.platform}</li>
    <li>Local IP: ${getLocalIP()}</li>
  </ul>
  
  <h2>Try Other Ports</h2>
  <ul>
    ${ports.map(port => `<li><a href="http://localhost:${port}">localhost:${port}</a></li>`).join('\n    ')}
  </ul>
  
  <h2>Try Different Hostnames</h2>
  <ul>
    <li><a href="http://localhost:3000">localhost:3000</a></li>
    <li><a href="http://127.0.0.1:3000">127.0.0.1:3000</a></li>
    <li><a href="http://${getLocalIP()}:3000">${getLocalIP()}:3000</a></li>
  </ul>
  
  <h2>Troubleshooting</h2>
  <p>If you can see this page, but not the Next.js app:</p>
  <ol>
    <li>Check for missing environment variables</li>
    <li>Look for error messages in the terminal</li>
    <li>Check application dependencies</li>
    <li>Verify browser console for errors</li>
  </ol>
  
  <script>
    // Update time every second
    setInterval(() => {
      document.getElementById('server-time').textContent = new Date().toLocaleString();
    }, 1000);
  </script>
</body>
</html>
`;

// Create servers on multiple ports
ports.forEach(port => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
    console.log(`[${new Date().toLocaleTimeString()}] Request received on port ${port}: ${req.url}`);
  });
  
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`- http://localhost:${port}`);
    console.log(`- http://127.0.0.1:${port}`);
    console.log(`- http://${getLocalIP()}:${port}`);
    console.log('---');
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use.`);
    } else {
      console.error(`Error on port ${port}:`, err.message);
    }
  });
});

console.log(`Server process ID: ${process.pid}`);
console.log(`Working directory: ${process.cwd()}`);

// Keep the script running until manually terminated
console.log('\nPress Ctrl+C to stop the servers');
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  process.exit(0);
});