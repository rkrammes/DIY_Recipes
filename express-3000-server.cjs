// express-3000-server.cjs
const express = require('express');
const app = express();
const PORT = 3000;

// Basic route
app.get('/', (req, res) => {
  console.log('Received request for /');
  res.send('Hello from Express server on port 3000!');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running at http://0.0.0.0:${PORT}/`);
  console.log(`Process ID: ${process.pid}`);
});