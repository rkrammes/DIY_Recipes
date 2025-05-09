// simple-3000-server.js
import http from 'http';

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  // Set response header
  res.writeHead(200, {'Content-Type': 'text/plain'});
  
  // Send response
  res.end('Hello from port 3000! The server is working.');
});

// Listen on port 3000 on all interfaces (0.0.0.0)
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  console.log(`Process ID: ${process.pid}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please close the application using this port.`);
  }
});