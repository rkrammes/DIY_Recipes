/**
 * Absolute simplest server possible on port 3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Create the server
http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Special case for fonts
  if (req.url.startsWith('/fonts/')) {
    const fontPath = path.join(__dirname, 'public', req.url);
    console.log(`Serving font: ${fontPath}`);
    
    fs.readFile(fontPath, (err, data) => {
      if (err) {
        console.error(`Font not found: ${err.message}`);
        res.writeHead(404);
        res.end('Font not found');
        return;
      }
      
      const ext = path.extname(fontPath).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.woff') contentType = 'font/woff';
      if (ext === '.woff2') contentType = 'font/woff2';
      
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*'
      });
      
      res.end(data);
      console.log(`Successfully served font: ${req.url}`);
    });
    return;
  }
  
  // Home page
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Server</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
        </style>
      </head>
      <body>
        <h1>Server is running on port 3000</h1>
        <p>Current time: ${new Date().toISOString()}</p>
        <p>To test font loading, visit <a href="/fonts/IBMPlexMono-Regular.woff2">/fonts/IBMPlexMono-Regular.woff2</a></p>
        <p>Available fonts:</p>
        <ul>
          ${fs.readdirSync(path.join(__dirname, 'public', 'fonts'))
            .map(font => `<li><a href="/fonts/${font}">${font}</a></li>`)
            .join('')}
        </ul>
      </body>
      </html>
    `);
    return;
  }
  
  // 404 for everything else
  res.writeHead(404);
  res.end('Not found');
  
}).listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://localhost:3000');
  console.log(`Available fonts in ${path.join(__dirname, 'public', 'fonts')}:`);
  try {
    const fonts = fs.readdirSync(path.join(__dirname, 'public', 'fonts'));
    fonts.forEach(font => console.log(`  - ${font}`));
  } catch (err) {
    console.error(`Error reading fonts: ${err.message}`);
  }
});