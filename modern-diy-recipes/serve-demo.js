/**
 * Simple HTTP server to serve the feature toggle demo
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3005;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const filePath = path.join(__dirname, 'feature-toggle-demo.html');
    const content = fs.readFileSync(filePath);
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Demo server running at http://localhost:${port}`);
});