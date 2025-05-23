// Simple static server for Formula Database

const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001; // Use a different port to avoid conflict with the main app

// Serve static files
app.use(express.static(__dirname));

// Serve styles directory explicitly
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve the Formula Database HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'formula-database.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  FORMULA DATABASE SERVER RUNNING                           ║
║                                                            ║
║  Access at: http://localhost:${PORT}                         ║
║                                                            ║
║  Press Ctrl+C to stop the server                           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});