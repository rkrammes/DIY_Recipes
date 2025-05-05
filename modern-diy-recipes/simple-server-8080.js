const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Simple Test Server</title>
    </head>
    <body>
      <h1>Test Server Running</h1>
      <p>This is a simple test to verify network connectivity on port 8080.</p>
      <p>Time: ${new Date().toISOString()}</p>
    </body>
    </html>
  `);
});

const PORT = 8080;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try killing existing processes.`);
  } else {
    console.error('Server error:', err);
  }
});

// Log process info
console.log(`Server process ID: ${process.pid}`);
console.log(`Working directory: ${process.cwd()}`);
console.log(`Node version: ${process.version}`);
console.log(`Platform: ${process.platform}`);