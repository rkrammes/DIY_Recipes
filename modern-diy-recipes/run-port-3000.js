// Very simple HTTP server on port 3000
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>App Running on Port 3000</title>
      <style>
        body {
          font-family: system-ui, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
        }
        .success {
          color: green;
          font-weight: bold;
        }
        h1 {
          border-bottom: 2px solid #eee;
        }
      </style>
    </head>
    <body>
      <h1>App Successfully Running on Port 3000</h1>
      <p class="success">✅ The server is running properly on port 3000!</p>
      <p>Server details:</p>
      <ul>
        <li>URL: <a href="http://localhost:3000">http://localhost:3000</a></li>
        <li>Port: ${PORT}</li>
        <li>Time: ${new Date().toLocaleString()}</li>
        <li>Node version: ${process.version}</li>
      </ul>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Server process ID: ${process.pid}`);
});