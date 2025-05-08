const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a very simple HTTP server on port 8080
const server = http.createServer((req, res) => {
  console.log(`Received request for: ${req.url}`);
  
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><body><h1>KRAFT Terminal Interface Test</h1><p>Server is running successfully!</p></body></html>');
    return;
  }
  
  // Return 404 for anything else
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

const PORT = 8080;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Use Ctrl+C to stop the server');
});