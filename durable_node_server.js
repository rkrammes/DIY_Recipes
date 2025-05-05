// durable_node_server.js - A more resilient Node.js server
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

// Set up logging
const logFile = path.join(__dirname, 'node_server.log');
fs.writeFileSync(logFile, `Server starting at ${new Date().toISOString()}\nPID: ${process.pid}\n\n`);

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(logMessage.trim());
}

// Create a server
const server = http.createServer((req, res) => {
  const reqTime = new Date().toISOString();
  log(`Received ${req.method} request for ${req.url}`);
  
  res.writeHead(200, {'Content-Type': 'text/html'});
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Node.js Server</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 20px;
          background-color: #f9f9f9;
        }
        h1 { color: #2c3e50; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>DIY Recipes - Node.js Server</h1>
        <p>This server is running on port ${PORT}.</p>
        <p>Server info:</p>
        <ul>
          <li>Node.js version: ${process.version}</li>
          <li>Process ID: ${process.pid}</li>
          <li>Request time: ${reqTime}</li>
          <li>Request URL: ${req.url}</li>
        </ul>
        <p>All requests are being logged to: ${logFile}</p>
      </div>
    </body>
    </html>
  `;
  
  res.end(html);
});

// Add error handling
server.on('error', (error) => {
  log(`ERROR: ${error.message}`);
  if (error.code === 'EADDRINUSE') {
    log(`Port ${PORT} is already in use`);
  }
});

// Start server with explicit binding to all interfaces
try {
  server.listen(PORT, '0.0.0.0', () => {
    log(`Server running at http://localhost:${PORT}/`);
    log(`Server running at http://127.0.0.1:${PORT}/`);
    log(`Server process ID: ${process.pid}`);
  });
  
  // Keep the process alive with interval logging
  const keepAlive = setInterval(() => {
    log('Server still running');
  }, 30000);
  
  // Clean up on exit
  process.on('SIGINT', () => {
    clearInterval(keepAlive);
    log('Server shutting down (SIGINT)');
    server.close();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    clearInterval(keepAlive);
    log('Server shutting down (SIGTERM)');
    server.close();
    process.exit(0);
  });
  
} catch (err) {
  log(`Failed to start server: ${err.message}`);
}