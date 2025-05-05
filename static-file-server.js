// static-file-server.js
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 9000; // Try a different port

const server = http.createServer((req, res) => {
  // Serve test-page.html for all routes
  const filePath = path.join(__dirname, 'test-page.html');
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end(`Error loading the file: ${err.message}`);
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  });
});

// Add explicit host binding
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}/`);
  console.log(`Server running at http://127.0.0.1:${port}/`);
  console.log(`Server running at http://0.0.0.0:${port}/`);
  console.log(`Server PID: ${process.pid}`);
});