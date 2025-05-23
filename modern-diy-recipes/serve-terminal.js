const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the terminal UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`
========================================================
  KRAFT TERMINAL UI SERVER STARTED ON PORT ${PORT}
--------------------------------------------------------
  URL: http://localhost:${PORT}
  
  The original terminal UI has been restored!
  Press Ctrl+C to stop the server.
========================================================
  `);
  
  // Save the PID to a file for easy termination
  fs.writeFileSync(path.join(__dirname, '.kraft-terminal.pid'), `${process.pid}`);
});