/**
 * Specialized Next.js server setup that properly serves fonts
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Configure Next.js app
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Font MIME types
const FONT_MIME_TYPES = {
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// Port
const PORT = 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    // Parse the request URL
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;
    
    // Log font requests
    if (pathname.startsWith('/fonts/')) {
      console.log(`[FONT REQUEST] ${req.method} ${pathname}`);
    }
    
    // Special handling for font files
    if (pathname.startsWith('/fonts/')) {
      const fontPath = path.join(__dirname, 'public', pathname);
      const ext = path.extname(fontPath).toLowerCase();
      
      // Check if the file exists
      fs.access(fontPath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error(`Font file not found: ${fontPath}`);
          handle(req, res, parsedUrl);
          return;
        }
        
        // Read and serve the font file
        fs.readFile(fontPath, (err, data) => {
          if (err) {
            console.error(`Error reading font file: ${err.message}`);
            handle(req, res, parsedUrl);
            return;
          }
          
          // Set proper MIME type and cache headers
          res.setHeader('Content-Type', FONT_MIME_TYPES[ext] || 'application/octet-stream');
          res.setHeader('Cache-Control', 'public, max-age=31536000');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(data);
          console.log(`✅ Served font: ${pathname}`);
        });
      });
      return;
    }
    
    // Let Next.js handle all other requests
    handle(req, res, parsedUrl);
  }).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`
=================================================================
🚀 Next.js app with enhanced font handling running on port ${PORT}
=================================================================
🔗 http://localhost:${PORT}
📁 Font directory: ${path.join(__dirname, 'public', 'fonts')}
🔤 Available fonts: 
${fs.readdirSync(path.join(__dirname, 'public', 'fonts')).map(font => `   - ${font}`).join('\n')}
`);
  });
});