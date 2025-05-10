/**
 * Ultra minimal test of port 3000 binding
 */

const http = require('http');

// Create a minimal server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Port 3000 test server is working!');
});

// Try to bind to all interfaces
server.listen(3000, '0.0.0.0', () => {
  console.log(`Test server running at http://0.0.0.0:3000/`);
  console.log(`Process ID: ${process.pid}`);
  console.log(`Try accessing: http://localhost:3000/`);
  console.log(`Or try: http://127.0.0.1:3000/`);
  console.log(`Or your network IP: http://192.168.1.148:3000/`);
});

// Handle errors
server.on('error', (e) => {
  console.error(`Server error: ${e.message}`);
  console.error(e);
});