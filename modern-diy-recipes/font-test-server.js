/**
 * Simple Express server specifically for testing font loading
 * Serves only the public directory with detailed logs for debugging
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000; // Using port 3000 to match the expected font URLs

// Enable detailed request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    // Set proper MIME types for font files
    if (filePath.endsWith('.woff')) {
      res.setHeader('Content-Type', 'font/woff');
    }
    if (filePath.endsWith('.woff2')) {
      res.setHeader('Content-Type', 'font/woff2');
    }
    // Add cache control headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// Test endpoint to verify server is running
app.get('/server-status', (req, res) => {
  res.json({
    status: 'running',
    time: new Date().toISOString(),
    publicPath: path.join(__dirname, 'public'),
    fonts: fs.readdirSync(path.join(__dirname, 'public', 'fonts'))
  });
});

// Create a simple test HTML page
app.get('/', (req, res) => {
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

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
======================================================
🚀 Font Test Server running on http://localhost:${PORT}
======================================================
- Public directory: ${path.join(__dirname, 'public')}
- All interfaces (0.0.0.0) bound to port ${PORT}
- Try the test page at: http://localhost:${PORT}/
- Check server status at: http://localhost:${PORT}/server-status
- Font files available: ${fs.readdirSync(path.join(__dirname, 'public', 'fonts')).join(', ')}
  `);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Error: Port ${PORT} is already in use. Try a different port.`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});