const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    time: new Date().toISOString(),
    port: PORT
  });
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mcp-test.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`Server time: ${new Date().toISOString()}`);
  console.log(`Server process ID: ${process.pid}`);
});