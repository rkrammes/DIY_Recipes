const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a simple HTTP server on port 3000 that serves static files
const server = http.createServer((req, res) => {
  console.log(`Received request for: ${req.url}`);
  
  // Serve index.html for root requests
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    
    // Try to serve the Next.js generated index if it exists
    try {
      if (fs.existsSync(path.join(__dirname, 'out/index.html'))) {
        const content = fs.readFileSync(path.join(__dirname, 'out/index.html'));
        res.end(content);
        return;
      }
    } catch (e) {
      console.log('Error reading Next.js generated index:', e);
    }
    
    // Fallback HTML that demonstrates the terminal layout
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>KRAFT Terminal Interface</title>
      <style>
        body {
          font-family: monospace;
          background-color: #1a1a1a;
          color: #33ff33;
          margin: 0;
          padding: 0;
          overflow: hidden;
          height: 100vh;
        }
        .terminal {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        .terminal-header {
          background-color: #222;
          border-bottom: 1px solid #3a3a3a;
          padding: 10px;
        }
        .terminal-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        .terminal-column {
          border-right: 1px solid #3a3a3a;
          overflow-y: auto;
        }
        .column-1 {
          width: 180px;
          background-color: #1e1e1e;
        }
        .column-2 {
          width: 250px;
          background-color: #252525;
        }
        .column-3 {
          flex: 1;
          background-color: #2a2a2a;
          padding: 15px;
          position: relative;
        }
        .terminal-footer {
          background-color: #222;
          border-top: 1px solid #3a3a3a;
          padding: 5px 10px;
          font-size: 12px;
        }
        .item {
          padding: 8px 12px;
          cursor: pointer;
          border-bottom: 1px solid #333;
        }
        .item:hover {
          background-color: #333;
        }
        .active {
          background-color: #444;
          color: #ffffff;
        }
        .section-header {
          background-color: #2a2a2a;
          padding: 8px 12px;
          font-weight: bold;
          color: #33ff33;
        }
        .status {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 5px 10px;
          background-color: #ff3333;
          color: white;
          border-radius: 3px;
          font-size: 12px;
        }
        .connection-error {
          background-color: rgba(255, 50, 50, 0.1);
          border: 1px solid #ff3333;
          padding: 20px;
          margin: 40px auto;
          max-width: 80%;
          border-radius: 5px;
        }
        .connection-error h2 {
          color: #ff3333;
          margin-top: 0;
        }
        .connection-error pre {
          background-color: rgba(0, 0, 0, 0.3);
          padding: 10px;
          border-radius: 3px;
          overflow: auto;
          color: #ff9999;
        }
      </style>
    </head>
    <body>
      <div class="terminal">
        <div class="terminal-header">
          <div style="display: flex; justify-content: space-between;">
            <div>KRAFT_AI TERMINAL v1.0.2</div>
            <div>Connected: <span style="color: #ff3333;">OFFLINE</span></div>
          </div>
        </div>
        <div class="terminal-content">
          <div class="terminal-column column-1">
            <div class="section-header">CATEGORIES</div>
            <div class="item active">📋 Formulations</div>
            <div class="item">🧪 Ingredients</div>
            <div class="item">🔧 Tools</div>
            <div class="item">📚 Library</div>
          </div>
          <div class="terminal-column column-2">
            <div class="section-header">ITEMS</div>
            <div class="item active">Database Connection Error</div>
          </div>
          <div class="terminal-column column-3">
            <div class="status">DATABASE OFFLINE</div>
            <div class="connection-error">
              <h2>Database Connection Error</h2>
              <p>Unable to connect to the Supabase database. This is required for accessing formulations and ingredients.</p>
              <h3>Error Details:</h3>
              <pre>Connection refused: Could not connect to the Supabase database at the specified URL</pre>
              <p>The application is designed to display real data from the database with no fallback to mock data.</p>
            </div>
          </div>
        </div>
        <div class="terminal-footer">
          <div style="display: flex; justify-content: space-between;">
            <div>Theme: HACKERS | System: OFFLINE | Memory: 78%</div>
            <div>Ready</div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
    
    res.end(html);
    return;
  }
  
  // Serve static files from 'public' directory
  let filePath = path.join(__dirname, 'public', req.url);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist, return 404
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    
    // Determine content type
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
        contentType = 'image/jpg';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.woff':
        contentType = 'font/woff';
        break;
      case '.woff2':
        contentType = 'font/woff2';
        break;
    }
    
    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

const PORT = 3000;

// Ensure port 3000 is available before starting
const net = require('net');
const tester = net.createServer()
  .once('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.log('Port 3000 is in use, attempting to force it closed...');
      require('child_process').exec('kill -9 $(lsof -ti:3000)', (error) => {
        if (error) {
          console.log('Could not free port 3000:', error);
        } else {
          startServer();
        }
      });
    } else {
      console.log('Error checking port:', err);
    }
  })
  .once('listening', () => {
    tester.close(() => {
      startServer();
    });
  })
  .listen(PORT);

function startServer() {
  server.listen(PORT, () => {
    console.log(`
    ======================================================
    |                                                    |
    |  KRAFT Terminal Interface Server                   |
    |  Running at http://localhost:${PORT}/              |
    |                                                    |
    |  This is a static demonstration of the terminal UI |
    |  with the no-mock-data implementation.             |
    |                                                    |
    |  Press Ctrl+C to stop the server                   |
    |                                                    |
    ======================================================
    `);
  });
}