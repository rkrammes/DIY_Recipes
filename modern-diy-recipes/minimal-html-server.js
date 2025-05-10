// Minimal HTML server with no dependencies
const http = require('http');
const fs = require('fs');
const path = require('path');

// HTML content for the page
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Kraft AI - Minimal Server</title>
  <style>
    body {
      font-family: monospace;
      background-color: #222;
      color: #0f0;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1, h2 { 
      border-bottom: 1px solid #444; 
      padding-bottom: 10px;
    }
    .container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .box {
      border: 1px solid #444;
      padding: 15px;
      border-radius: 4px;
    }
    button {
      background-color: #333;
      color: #0f0;
      border: 1px solid #0f0;
      padding: 8px 16px;
      margin: 5px;
      cursor: pointer;
      font-family: monospace;
    }
    button:hover {
      background-color: #444;
    }
    .theme-hackers { color: #0f0; }
    .theme-dystopia { color: #f80; }
    .theme-neotopia { color: #0cf; }
  </style>
</head>
<body>
  <h1>KRAFT AI Terminal Interface</h1>
  <p>This minimal server is running on port 7777</p>
  
  <div>
    <button onclick="document.body.className = 'theme-hackers'">Hackers Theme</button>
    <button onclick="document.body.className = 'theme-dystopia'">Dystopia Theme</button>
    <button onclick="document.body.className = 'theme-neotopia'">Neotopia Theme</button>
  </div>
  
  <div class="container">
    <div class="box">
      <h2>Terminal Interface</h2>
      <pre id="terminal">
Loading Kraft Terminal...
> Ready
      </pre>
      <input type="text" id="command" placeholder="Type command..." style="width: 100%; background: #333; color: #0f0; border: 1px solid #444; padding: 5px; font-family: monospace;">
    </div>
    
    <div class="box">
      <h2>System Status</h2>
      <p>Server: <span style="color: #0f0;">Running</span></p>
      <p>Port: 7777</p>
      <p>Mode: Terminal</p>
      <p>Data: Mock</p>
      <p>Server Time: <span id="server-time"></span></p>
    </div>
  </div>
  
  <script>
    // Update server time
    setInterval(() => {
      document.getElementById('server-time').textContent = new Date().toLocaleTimeString();
    }, 1000);
    
    // Handle terminal input
    document.getElementById('command').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const cmd = this.value;
        const terminal = document.getElementById('terminal');
        terminal.textContent += '\\n> ' + cmd;
        
        // Simple command responses
        if (cmd === 'help') {
          terminal.textContent += '\\n  Available commands: help, status, clear, theme';
        } else if (cmd === 'status') {
          terminal.textContent += '\\n  Server status: Running on port 7777\\n  Mode: Terminal\\n  Data: Mock';
        } else if (cmd === 'clear') {
          terminal.textContent = '> Terminal cleared\\n> ';
        } else if (cmd === 'theme') {
          terminal.textContent += '\\n  Available themes: hackers, dystopia, neotopia\\n  Use theme [name] to change';
        } else if (cmd.startsWith('theme ')) {
          const theme = cmd.split(' ')[1];
          document.body.className = 'theme-' + theme;
          terminal.textContent += '\\n  Theme set to: ' + theme;
        } else {
          terminal.textContent += '\\n  Unknown command: ' + cmd + '\\n  Type "help" for available commands';
        }
        
        this.value = '';
        terminal.scrollTop = terminal.scrollHeight;
      }
    });
  </script>
</body>
</html>
`;

// Create HTML file
const htmlPath = path.join(__dirname, 'minimal-terminal.html');
fs.writeFileSync(htmlPath, htmlContent);
console.log(`Created HTML file: ${htmlPath}`);

// Create server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(htmlContent);
});

// Listen on port 7777
const PORT = 7777;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`HTML file also available at: ${htmlPath}`);
});

console.log("Press Ctrl+C to stop the server");

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', err);
  }
});