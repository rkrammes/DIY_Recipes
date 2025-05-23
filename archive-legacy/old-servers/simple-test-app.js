// simple-test-app.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8080;
const logFile = path.join(__dirname, 'server-log.txt');

// Initialize log file
fs.writeFileSync(logFile, `Server started at ${new Date().toISOString()}\n`);

// Add middleware to log all requests
app.use((req, res, next) => {
  const logMessage = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
  console.log(logMessage);
  fs.appendFileSync(logFile, logMessage);
  next();
});

app.get('/', (req, res) => {
  const message = 'Root route accessed';
  console.log(message);
  fs.appendFileSync(logFile, message + '\n');
  res.send(`
    <html>
      <head>
        <title>Simple Test App</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
          }
          h1 {
            color: #2c3e50;
          }
          .container {
            background-color: white;
            border-radius: 5px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            max-width: 800px;
            margin: 0 auto;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>DIY Recipes - Test Page</h1>
          <p>This is a simple test page to confirm the server is running properly on port 3000.</p>
          <p>App is working correctly!</p>
          <p>Current time: ${new Date().toISOString()}</p>
        </div>
      </body>
    </html>
  `);
});

// Add a test endpoint
app.get('/ping', (req, res) => {
  const message = 'Ping endpoint accessed';
  console.log(message);
  fs.appendFileSync(logFile, message + '\n');
  res.send('pong');
});

// Explicitly bind to all network interfaces
const server = app.listen(port, '0.0.0.0', () => {
  const startMessage = `Server started on port ${port} at ${new Date().toISOString()}`;
  console.log(startMessage);
  fs.appendFileSync(logFile, startMessage + '\n');
  console.log(`Test app running at http://localhost:${port}`);
  console.log(`Also accessible at http://127.0.0.1:${port}`);
  
  // Write server info to file
  const info = {
    port: port,
    pid: process.pid,
    timestamp: new Date().toISOString(),
    node_version: process.version
  };
  fs.writeFileSync(path.join(__dirname, 'server-info.json'), JSON.stringify(info, null, 2));
});

// Add error handling
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Try using a different port.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});