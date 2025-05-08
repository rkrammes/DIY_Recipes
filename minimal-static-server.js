import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert module URL to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Create a server
const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  // Parse the URL
  let filePath = req.url;
  if (filePath === '/') {
    filePath = '/test.html';
  }
  
  // Special handling for DIY test page
  if (filePath === '/test.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DIY Formulations Test Page</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              line-height: 1.5;
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
              color: #333;
              background-color: #f9f9f9;
            }
            h1, h2 { color: #2c3e50; }
            .card {
              background: white;
              border-radius: 8px;
              padding: 1.5rem;
              margin-bottom: 1.5rem;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            button {
              background: #3498db;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              margin-right: 8px;
              font-size: 14px;
            }
            button:hover {
              background: #2980b9;
            }
            .theme-demo {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
              gap: 1rem;
            }
            .theme-sample {
              height: 100px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
            }
            .success { color: #27ae60; font-weight: bold; }
            pre {
              background: #f8f8f8;
              border-left: 4px solid #3498db;
              padding: 1rem;
              overflow: auto;
            }
            .status { font-weight: bold; }
            .status.ok { color: #27ae60; }
            .status.error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <h1>DIY Formulations Test Page</h1>
          <p class="success">✅ Static server is running successfully on port 3000!</p>
          
          <div class="card">
            <h2>Server Status</h2>
            <p>Server time: ${new Date().toISOString()}</p>
            <p>Node.js version: ${process.version}</p>
            <p>Platform: ${process.platform}</p>
          </div>
          
          <div class="card">
            <h2>Theme System Test</h2>
            <div class="theme-demo">
              <div class="theme-sample" style="background-color: #0a0e12; color: #33ff33;">
                Hackers
              </div>
              <div class="theme-sample" style="background-color: #1a1a2e; color: #e94560;">
                Dystopia
              </div>
              <div class="theme-sample" style="background-color: #f5f5f5; color: #121212;">
                Neotopia
              </div>
            </div>
            <p style="margin-top: 1rem;">
              <button id="themeToggle">Toggle Theme</button>
              <span id="currentTheme" class="status">Current: Default</span>
            </p>
          </div>
          
          <div class="card">
            <h2>Module Registry Test</h2>
            <p>
              <button id="testModuleRegistry">Test Module Registry</button>
              <span id="moduleStatus" class="status">Not tested</span>
            </p>
            <pre id="moduleOutput">// Module registry output will appear here</pre>
          </div>
          
          <div class="card">
            <h2>Authentication Test</h2>
            <p>
              <button id="testAuth">Test Authentication</button>
              <span id="authStatus" class="status">Not tested</span>
            </p>
            <pre id="authOutput">// Authentication system output will appear here</pre>
          </div>
          
          <div class="card">
            <h2>Navigation</h2>
            <p>
              <button id="loadNormalApp">Try Normal App</button>
              <button id="loadMinimalApp">Try Minimal App</button>
              <button id="loadDocumentApp">Try Document App</button>
            </p>
          </div>
          
          <script>
            // Theme toggling simulation
            const themeToggle = document.getElementById('themeToggle');
            const currentTheme = document.getElementById('currentTheme');
            const themes = ['Default', 'Hackers', 'Dystopia', 'Neotopia'];
            let themeIndex = 0;
            
            themeToggle.addEventListener('click', () => {
              themeIndex = (themeIndex + 1) % themes.length;
              currentTheme.textContent = 'Current: ' + themes[themeIndex];
              
              // Apply basic styling changes based on theme
              const body = document.body;
              if (themes[themeIndex] === 'Hackers') {
                body.style.backgroundColor = '#0a0e12';
                body.style.color = '#33ff33';
              } else if (themes[themeIndex] === 'Dystopia') {
                body.style.backgroundColor = '#1a1a2e';
                body.style.color = '#e94560';
              } else if (themes[themeIndex] === 'Neotopia') {
                body.style.backgroundColor = '#f5f5f5';
                body.style.color = '#121212';
              } else {
                body.style.backgroundColor = '#f9f9f9';
                body.style.color = '#333';
              }
            });
            
            // Module registry test simulation
            document.getElementById('testModuleRegistry').addEventListener('click', () => {
              const moduleStatus = document.getElementById('moduleStatus');
              const moduleOutput = document.getElementById('moduleOutput');
              
              moduleStatus.className = 'status ok';
              moduleStatus.textContent = 'Success';
              
              moduleOutput.textContent = JSON.stringify({
                modules: [
                  { id: 'formulation', name: 'Formulation', isEnabled: true },
                  { id: 'recipe', name: 'Recipe Management', isEnabled: true },
                  { id: 'ingredients', name: 'Ingredient Library', isEnabled: true }
                ],
                enabledModules: [
                  { id: 'formulation', name: 'Formulation', isEnabled: true },
                  { id: 'recipe', name: 'Recipe Management', isEnabled: true },
                  { id: 'ingredients', name: 'Ingredient Library', isEnabled: true }
                ]
              }, null, 2);
            });
            
            // Authentication test simulation
            document.getElementById('testAuth').addEventListener('click', () => {
              const authStatus = document.getElementById('authStatus');
              const authOutput = document.getElementById('authOutput');
              
              authStatus.className = 'status ok';
              authStatus.textContent = 'Success';
              
              authOutput.textContent = JSON.stringify({
                user: {
                  id: 'dev-user-id-123',
                  email: 'dev@example.com',
                  role: 'authenticated'
                },
                session: {
                  expires_at: Math.floor(Date.now() / 1000) + 3600,
                  token_type: 'bearer'
                },
                isAuthenticated: true
              }, null, 2);
            });
            
            // Navigation buttons
            document.getElementById('loadNormalApp').addEventListener('click', () => {
              window.location.href = '/';
            });
            
            document.getElementById('loadMinimalApp').addEventListener('click', () => {
              window.location.href = '/minimal';
            });
            
            document.getElementById('loadDocumentApp').addEventListener('click', () => {
              window.location.href = '/document';
            });
          </script>
        </body>
      </html>
    `);
    return;
  }
  
  // Resolve the file path relative to the current directory
  filePath = path.join(__dirname, filePath);
  
  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    // Get the file extension and corresponding MIME type
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Read and serve the file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error(`Error reading file: ${err}`);
        res.writeHead(500);
        res.end('Server error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

// Start the server on port 3000
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  console.log(`Process ID: ${process.pid}`);
});