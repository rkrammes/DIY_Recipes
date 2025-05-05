/**
 * Simple HTTP server that serves static files from the public directory
 * Running on port 3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Map file extensions to MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// Create the server
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Special case for the root path
  let urlPath = req.url === '/' ? '/index.html' : req.url;
  
  // Handle query parameters by removing them
  urlPath = urlPath.split('?')[0];
  
  // Get the absolute file path
  const filePath = path.join(PUBLIC_DIR, urlPath);
  
  // Get the file extension
  const extname = path.extname(filePath).toLowerCase();
  
  // Get the MIME type based on the file extension
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read the file and serve it
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found - try index.html
        console.error(`File not found: ${filePath}`);
        res.writeHead(404);
        res.end('404 - File Not Found');
      } else {
        // Server error
        console.error(`Server error: ${error.code}`);
        res.writeHead(500);
        res.end(`500 - Server Error: ${error.code}`);
      }
    } else {
      // Success - serve the file
      const headers = {
        'Content-Type': contentType
      };
      
      // Add cache headers for fonts
      if (extname === '.woff' || extname === '.woff2') {
        headers['Cache-Control'] = 'public, max-age=31536000';
      }
      
      res.writeHead(200, headers);
      res.end(content, 'utf-8');
      console.log(`Served: ${filePath} as ${contentType}`);
    }
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
===========================================================
🚀 HTTP Server running at http://localhost:${PORT}
===========================================================
- Serving files from: ${PUBLIC_DIR}
- Available on all network interfaces (0.0.0.0:${PORT})
- Open in your browser: http://localhost:${PORT}
  `);
  
  // List the font files available
  try {
    const fontsDir = path.join(PUBLIC_DIR, 'fonts');
    const fontFiles = fs.readdirSync(fontsDir);
    console.log(`\n📁 Available font files in ${fontsDir}:`);
    fontFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
  } catch (error) {
    console.error(`\n❌ Error listing font files: ${error.message}`);
  }
  
  console.log('\n📋 Press Ctrl+C to stop the server');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Error: Port ${PORT} is already in use. Please close the application using this port and try again.`);
  } else {
    console.error(`❌ Server error: ${error.message}`);
  }
  process.exit(1);
});