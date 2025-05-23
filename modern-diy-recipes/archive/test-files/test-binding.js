/**
 * Test script to verify if the server is binding correctly
 */

const http = require('http');
const PORT = 3005; // Use a different port to avoid conflicts

// Create a simple test server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Test server is running correctly');
});

// Try to bind to all interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Test with: curl http://localhost:${PORT}`);
  
  // Print out networking information
  console.log('\nNetwork interface information:');
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal interfaces
      if (net.internal) continue;
      
      if (net.family === 'IPv4') {
        console.log(`  Interface: ${name}, IP: ${net.address}`);
        console.log(`  Test URL: http://${net.address}:${PORT}`);
      }
    }
  }
});

// Handle errors
server.on('error', (err) => {
  console.error(`Error starting server: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else if (err.code === 'EACCES') {
    console.error(`Insufficient permissions to bind to port ${PORT}`);
  }
  process.exit(1);
});

// Keep the server running until killed
console.log('Press Ctrl+C to stop the server');