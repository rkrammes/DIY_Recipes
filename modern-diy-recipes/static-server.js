const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  // Serve the static HTML file
  const filePath = path.join(__dirname, 'static-test.html');
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      res.writeHead(500);
      res.end('Error loading test page');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Static test server running at http://0.0.0.0:${PORT}/`);
  console.log(`Try accessing: http://localhost:${PORT}/`);
  console.log(`Or: http://127.0.0.1:${PORT}/`);
});

console.log(`Server process ID: ${process.pid}`);
console.log(`Working directory: ${process.cwd()}`);
console.log(`Node version: ${process.version}`);
console.log(`Platform: ${process.platform}`);