/**
 * Extremely simple HTTP server to serve the feature toggle demo on port 3010
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3010;
const demoFile = path.join(__dirname, 'feature-toggle-demo.html');

// Create server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.url}`);
  
  // Read the demo file
  fs.readFile(demoFile, (err, content) => {
    if (err) {
      console.error(`Error reading file: ${err.message}`);
      res.writeHead(500);
      res.end('Error loading demo');
      return;
    }
    
    // Serve the file
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
    console.log('Demo file served successfully');
  });
});

// Start server
server.listen(port, '127.0.0.1', () => {
  console.log(`Demo server running at http://127.0.0.1:${port}`);
});