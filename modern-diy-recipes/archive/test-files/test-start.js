/**
 * Test Start Script
 * This script starts a simple express server that serves the app's static files
 * without requiring the full Next.js framework
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Simple HTML page for testing
const testHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Kraft AI - Test Server</title>
  <style>
    body {
      font-family: monospace;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #222;
      color: #0f0;
    }
    .container {
      border: 1px solid #444;
      padding: 20px;
      border-radius: 4px;
      margin-top: 20px;
    }
    .status-good {
      color: #0f0;
    }
    .status-bad {
      color: #f00;
    }
    h1, h2 {
      border-bottom: 1px solid #333;
      padding-bottom: 10px;
    }
    ul {
      list-style-type: none;
      padding-left: 10px;
    }
    li {
      padding: 5px 0;
    }
    button {
      background-color: #2d2d2d;
      color: #0f0;
      border: 1px solid #444;
      padding: 8px 16px;
      cursor: pointer;
      font-family: monospace;
      margin: 5px;
      border-radius: 4px;
    }
    button:hover {
      background-color: #3d3d3d;
    }
    .nav {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <h1>Kraft AI - Test Server</h1>
  <p>This simplified test server is running on port ${PORT}.</p>
  
  <div class="nav">
    <button onclick="location.href='/'">Home</button>
    <button onclick="location.href='/settings'">Settings</button>
    <button onclick="location.href='/terminal'">Terminal</button>
    <button onclick="location.href='/formulations'">Formulations</button>
  </div>
  
  <div class="container">
    <h2>Server Status</h2>
    <ul>
      <li>Server: <span class="status-good">Running</span></li>
      <li>Port: <span class="status-good">${PORT}</span></li>
      <li>Mode: <span class="status-good">Test</span></li>
      <li>Supabase: <span class="status-bad">Mocked</span></li>
    </ul>
  </div>
  
  <div class="container">
    <h2>Available Components</h2>
    <ul id="components-list">
      <li>Loading components...</li>
    </ul>
  </div>
  
  <script>
    // This would be populated with actual component detection
    document.getElementById('components-list').innerHTML = 
      '<li>Card: <span class="status-good">Available</span></li>' +
      '<li>Progress: <span class="status-good">Available</span></li>' +
      '<li>Tabs: <span class="status-good">Available</span></li>' +
      '<li>RadioGroup: <span class="status-good">Available</span></li>' +
      '<li>Switch: <span class="status-good">Available</span></li>';
  </script>
</body>
</html>
`;

// Routes
app.get('/', (req, res) => {
  res.send(testHtml);
});

app.get('/settings', (req, res) => {
  res.send(testHtml.replace('<h1>Kraft AI - Test Server</h1>', '<h1>Kraft AI - Settings</h1>'));
});

app.get('/terminal', (req, res) => {
  res.send(testHtml.replace('<h1>Kraft AI - Test Server</h1>', '<h1>Kraft AI - Terminal</h1>'));
});

app.get('/formulations', (req, res) => {
  res.send(testHtml.replace('<h1>Kraft AI - Test Server</h1>', '<h1>Kraft AI - Formulations</h1>'));
});

// Check component existence and export a simple status API
app.get('/api/component-status', (req, res) => {
  const UI_COMPONENTS_DIR = path.join(__dirname, 'src/components/ui');
  let components = [];
  
  try {
    const files = fs.readdirSync(UI_COMPONENTS_DIR);
    
    components = files
      .filter(file => file.endsWith('.tsx') || file.endsWith('.jsx'))
      .map(file => ({
        name: file.replace(/\.(tsx|jsx)$/, ''),
        available: true
      }));
      
  } catch (error) {
    console.error('Error reading UI components:', error);
  }
  
  res.json({ components });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`Open your browser to http://localhost:${PORT} to view the test page`);
});