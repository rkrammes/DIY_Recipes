import http from 'http';

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>DIY Recipes Test Server</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
          }
          h1 { color: #333; }
          .success { color: green; }
        </style>
      </head>
      <body>
        <h1>DIY Recipes Test Server</h1>
        <p class="success">✅ Server is running successfully!</p>
        <p>This is a test server to verify basic connectivity.</p>
        <p>Server time: ${new Date().toISOString()}</p>
        <p>Request URL: ${req.url}</p>
      </body>
    </html>
  `);
});

// Start the server on port 3000 and listen on all interfaces
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Process ID: ${process.pid}`);
  console.log(`Node version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try another port.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});