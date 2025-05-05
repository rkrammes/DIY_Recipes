const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the public directory
app.use(express.static('public'));
app.use('/styles', express.static(path.join(__dirname, 'src/styles')));

// Redirect root to the demo page
app.get('/', (req, res) => {
  res.redirect('/test-visual.html');
});

// Fallback handler for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test-visual.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  const address = server.address();
  console.log(`Server running on ${address.address}:${address.port}`);
  console.log(`Visit http://localhost:${PORT} to view the theme demo`);
  console.log('Available interfaces:');
  require('os').networkInterfaces()['lo0'].forEach(interface => {
    console.log(`- ${interface.address}`);
  });
});