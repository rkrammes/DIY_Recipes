/**
 * Custom Next.js Server
 * Running on port 3000 with enhanced font handling
 */

const express = require('express');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Create Next.js app
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = 3000;

// Prepare the Next.js app
app.prepare()
  .then(() => {
    const server = express();

    // Set up logging
    server.use((req, res, next) => {
      if (req.url.includes('/fonts/')) {
        console.log(`[${new Date().toISOString()}] FONT: ${req.method} ${req.url}`);
      } else if (!req.url.includes('/_next/')) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      }
      next();
    });

    // Serve fonts directly with proper headers
    server.use('/fonts', express.static(path.join(__dirname, 'public/fonts'), {
      setHeaders: (res, filePath) => {
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

    // Serve other static files from public directory
    server.use(express.static(path.join(__dirname, 'public')));

    // Add status endpoint
    server.get('/server-status', (req, res) => {
      res.json({
        status: 'running',
        time: new Date().toISOString(),
        nextjs: true,
        port: PORT,
        fonts: fs.readdirSync(path.join(__dirname, 'public', 'fonts'))
      });
    });

    // Add font test page
    server.get('/font-test', (req, res) => {
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

    // Let Next.js handle all other routes
    server.all('*', async (req, res) => {
      try {
        // Convert URL string to URL object to avoid path-to-regexp errors
        const parsedUrl = new URL(
          req.url, 
          `http://${req.headers.host || 'localhost'}`
        );
        
        return await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', err);
        res.status(500).send('Internal Server Error');
      }
    });

    // Start the server
    server.listen(PORT, '0.0.0.0', err => {
      if (err) throw err;
      console.log(`
======================================================
🚀 Next.js app running on http://localhost:${PORT}
======================================================
- Main application running on port ${PORT}
- Fonts served from: ${path.join(__dirname, 'public/fonts')}
- Visit http://localhost:${PORT}/font-test to test fonts
- Check status at: http://localhost:${PORT}/server-status
      `);
    });
  })
  .catch(err => {
    console.error('Error starting server:', err);
    process.exit(1);
  });