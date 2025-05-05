/**
 * Express Server with Font Support
 * Running on port 3000
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Enable detailed request logging
app.use((req, res, next) => {
  // Log detailed information for font requests, simple logs for other requests
  if (req.url.includes('/fonts/')) {
    console.log(`[${new Date().toISOString()}] FONT REQUEST: ${req.method} ${req.url}`);
  } else {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Serve static files from public directory with special font handling
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    // Set proper MIME types and cache headers for font files
    if (filePath.endsWith('.woff')) {
      res.setHeader('Content-Type', 'font/woff');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
    if (filePath.endsWith('.woff2')) {
      res.setHeader('Content-Type', 'font/woff2');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Status endpoint for checking server health
app.get('/server-status', (req, res) => {
  res.json({
    status: 'running',
    time: new Date().toISOString(),
    fonts: fs.readdirSync(path.join(__dirname, 'public', 'fonts'))
  });
});

// Simple index page to verify application is working
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>DIY Recipes Application</title>
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
        nav a {
          display: inline-block;
          margin-right: 10px;
          padding: 5px 10px;
          background: #f1f1f1;
          text-decoration: none;
          color: #333;
          border-radius: 3px;
        }
      </style>
    </head>
    <body>
      <h1>DIY Recipes Application</h1>
      <p>Welcome to the DIY Recipes application! This server is now properly serving fonts from port 3000.</p>
      
      <nav>
        <a href="/font-test">Font Test Page</a>
        <a href="/server-status">Server Status</a>
      </nav>
      
      <div class="section">
        <h2>Font Support</h2>
        <p>The following fonts are properly served with the correct MIME types:</p>
        <ul>
          ${fs.readdirSync(path.join(__dirname, 'public', 'fonts'))
            .map(font => `<li>${font}</li>`)
            .join('')}
        </ul>
      </div>
    </body>
    </html>
  `);
});

// Create a font test page
app.get('/font-test', (req, res) => {
  res.send(`
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
  `);
});

// Fallback route - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('Error starting server:', err);
    return;
  }
  
  console.log(`
======================================================
🚀 Express server with font support running on http://localhost:${PORT}
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