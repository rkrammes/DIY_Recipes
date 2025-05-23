/**
 * Super simple HTTP server for testing
 */
const http = require('http');
const PORT = 3005;

// Create a minimal server
const server = http.createServer((req, res) => {
  console.log(`Received request for ${req.url}`);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
});

// Attempt to listen on localhost only
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
});