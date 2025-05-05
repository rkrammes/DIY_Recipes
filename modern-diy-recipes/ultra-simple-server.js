// The simplest possible HTTP server
const http = require('http');

// Create a minimal server that responds with plain text
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Ultra simple server is working');
});

// Use a non-standard port (54321)
const PORT = 54321;

// Listen on all interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Also accessible at http://0.0.0.0:${PORT}/`);
  console.log(`Process ID: ${process.pid}`);
  
  // Test self-connection
  console.log('Testing self-connection...');
  setTimeout(() => {
    http.get(`http://localhost:${PORT}/`, (res) => {
      console.log(`Self-connection successful! Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`Self-connection failed: ${err.message}`);
    });
  }, 500);
});

// Log any errors
server.on('error', (err) => {
  console.error('Server error:', err);
});