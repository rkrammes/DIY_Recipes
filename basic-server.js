// basic-server.js
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, 'basic-server-log.txt');

// Initialize log file
fs.writeFileSync(logFile, `Server started at ${new Date().toISOString()}\n`);

// Create a very basic HTTP server
const server = http.createServer((req, res) => {
  // Log request to file
  fs.appendFileSync(logFile, `${new Date().toISOString()} - ${req.method} ${req.url}\n`);
  
  // Set response header
  res.writeHead(200, {'Content-Type': 'text/plain'});
  
  // Send response
  res.end('Hello, World! The server is working.');
});

// Listen on port 8000 on all interfaces
server.listen(8000, '0.0.0.0', () => {
  const message = `Server running at http://localhost:8000/ (PID: ${process.pid})`;
  console.log(message);
  fs.appendFileSync(logFile, message + '\n');
  
  // Write server info to file
  const info = {
    port: 8000,
    pid: process.pid,
    timestamp: new Date().toISOString(),
    node_version: process.version
  };
  fs.writeFileSync(path.join(__dirname, 'basic-server-info.json'), JSON.stringify(info, null, 2));
});

// Handle server errors
server.on('error', (err) => {
  fs.appendFileSync(logFile, `ERROR: ${err.message}\n`);
  console.error('Server error:', err);
});