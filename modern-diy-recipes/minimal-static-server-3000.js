/**
 * Minimal HTTP server that just serves static files
 * Running on port 3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Port to run on
const PORT = 3000;

// Map file extensions to MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// Create a server
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Parse URL
  const parsedUrl = url.parse(req.url);
  
  // Extract path from URL
  let pathname = parsedUrl.pathname;
  
  // Normalize the path and map root to index.html
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Special route for server status
  if (pathname === '/server-status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      time: new Date().toISOString(),
      fonts: fs.readdirSync(path.join(__dirname, 'public', 'fonts'))
    }));
    return;
  }
  
  // Special route for font test page
  if (pathname === '/font-test') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Font Test Page</title>
        <script src="/font-loader.js"></script>
        <style>
          body {
            font-family: 'IBM Plex Mono', monospace;
            padding: 30px;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.6;
          }
          h1 { font-family: 'IBM Plex Mono', monospace; font-weight: 700; }
          h2 { font-family: 'IBM Plex Mono', monospace; font-weight: 500; }
          p { font-family: 'IBM Plex Mono', monospace; font-weight: 400; }
          .vga { font-family: 'VGA', monospace; }
          .jetbrains { font-family: 'JetBrains Mono', monospace; }
          .sharetech { font-family: 'Share Tech Mono', monospace; }
          .section {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ccc;
          }
        </style>
      </head>
      <body>
        <h1>Font Loading Test Page</h1>
        
        <div class="section">
          <h2>IBM Plex Mono Bold (700)</h2>
          <p style="font-weight: 700">This text should be in IBM Plex Mono Bold.</p>
        </div>
        
        <div class="section">
          <h2>IBM Plex Mono Medium (500)</h2>
          <p style="font-weight: 500">This text should be in IBM Plex Mono Medium.</p>
        </div>
        
        <div class="section">
          <h2>IBM Plex Mono Regular (400)</h2>
          <p>This text should be in IBM Plex Mono Regular.</p>
        </div>
        
        <div class="section">
          <h2>JetBrains Mono</h2>
          <p class="jetbrains">This text should be in JetBrains Mono.</p>
        </div>
        
        <div class="section">
          <h2>VGA Font</h2>
          <p class="vga">This text should be in VGA font.</p>
        </div>
        
        <div class="section">
          <h2>Share Tech Mono</h2>
          <p class="sharetech">This text should be in Share Tech Mono.</p>
        </div>
        
        <script>
          // Check which fonts are loaded successfully
          window.addEventListener('load', () => {
            console.log('Page loaded. Checking font status...');
            
            // Log fonts loaded status
            if (document.documentElement.classList.contains('fonts-loaded')) {
              console.log('✅ HTML element has fonts-loaded class');
            } else {
              console.log('❌ HTML element missing fonts-loaded class');
            }
            
            // Display network requests for fonts
            if (window.performance) {
              const resources = performance.getEntriesByType('resource');
              const fontRequests = resources.filter(r => r.name.includes('/fonts/'));
              
              console.log('Font network requests:');
              fontRequests.forEach(request => {
                console.log(
                  request.name, 
                  request.duration > 0 ? '✅ loaded' : '❌ failed',
                  'Duration:', Math.round(request.duration) + 'ms'
                );
              });
            }
          });
        </script>
      </body>
      </html>
    `;
    res.end(html);
    return;
  }
  
  // Map public URLs to the public folder
  const filePath = path.join(__dirname, 'public', pathname);
  
  // Get the file extension
  const extname = path.extname(filePath);
  let contentType = mimeTypes[extname] || 'application/octet-stream';
  
  // Read the file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found - try sending index.html as fallback
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, indexContent) => {
          if (err) {
            // Can't even find index.html
            res.writeHead(404);
            res.end('File not found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexContent, 'utf-8');
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Set proper headers for fonts
      if (extname === '.woff' || extname === '.woff2') {
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000'
        });
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
      }
      res.end(content, 'utf-8');
    }
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
======================================================
🚀 Minimal static server running on http://localhost:${PORT}
======================================================
- Binding to all interfaces (0.0.0.0)
- Static files served from: ${path.join(__dirname, 'public')}
- Fonts directory: ${path.join(__dirname, 'public', 'fonts')}
- Available fonts: ${fs.readdirSync(path.join(__dirname, 'public', 'fonts')).join(', ')}
- Visit http://localhost:${PORT} for homepage
- Visit http://localhost:${PORT}/font-test to test fonts
- Check status at: http://localhost:${PORT}/server-status
  `);
});