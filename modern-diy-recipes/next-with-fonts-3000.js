/**
 * Next.js server with built-in font serving support
 * This server runs on port 3000 with enhanced font handling
 */

const express = require('express');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Create Next.js app
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Port configuration - always use 3000
const PORT = 3000;

// Prepare Next.js
app.prepare().then(() => {
  const server = express();
  
  // Custom logging middleware
  server.use((req, res, next) => {
    // Log detailed information for font requests, simple logs for other requests
    if (req.url.includes('/fonts/')) {
      console.log(`[${new Date().toISOString()}] FONT REQUEST: ${req.method} ${req.url}`);
    } else if (!req.url.includes('/_next/')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    }
    next();
  });
  
  // Serve static files from public directory with special font handling
  server.use(express.static(path.join(__dirname, 'public'), {
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
  server.get('/server-status', (req, res) => {
    res.json({
      status: 'running',
      time: new Date().toISOString(),
      fonts: fs.readdirSync(path.join(__dirname, 'public', 'fonts'))
    });
  });
  
  // Let Next.js handle all other routes
  server.all('*', (req, res) => {
    try {
      return handle(req, res);
    } catch (err) {
      console.error('Error handling request:', err);
      res.status(500).send('Internal Server Error');
    }
  });
  
  // Start the server
  server.listen(PORT, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`
======================================================
🚀 Next.js server with enhanced font support running on http://localhost:${PORT}
======================================================
- Server binding to all interfaces (0.0.0.0)
- Static files served from: ${path.join(__dirname, 'public')}
- Fonts directory: ${path.join(__dirname, 'public', 'fonts')}
- Available fonts: ${fs.readdirSync(path.join(__dirname, 'public', 'fonts')).join(', ')}
- Check server status at: http://localhost:${PORT}/server-status
    `);
  });
});