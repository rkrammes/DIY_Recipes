// kraft-server.js
// Simple server to directly serve the KRAFT_AI terminal interface

const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files with correct MIME types
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'text/javascript');
    } else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    } else if (path.endsWith('.woff')) {
      res.setHeader('Content-Type', 'font/woff');
    } else if (path.endsWith('.woff2')) {
      res.setHeader('Content-Type', 'font/woff2');
    }
  }
}));

// Ensure paths are correct
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Explicit path for styles
app.get('/styles/retro-terminal.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, 'styles', 'retro-terminal.css'));
});

app.get('/', (req, res) => {
  // Send the index-terminal.html file instead of index.html
  res.sendFile(path.join(__dirname, 'index-terminal.html'));
});

// Serve index-terminal.html directly
app.get('/terminal', (req, res) => {
  res.sendFile(path.join(__dirname, 'index-terminal.html'));
});

// Mock API endpoints for development
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    server: 'kraft-server',
    timestamp: new Date().toISOString(),
    mode: 'development'
  });
});

// Fallback to index-terminal.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index-terminal.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Serving KRAFT_AI terminal interface`);
  console.log(`Access the terminal at http://localhost:${PORT}/terminal`);
});