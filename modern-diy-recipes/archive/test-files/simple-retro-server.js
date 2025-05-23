const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Redirect root to our retro terminal
app.get('/', (req, res) => {
  res.redirect('/retro-terminal.html');
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Retro terminal server running at http://localhost:${port}`);
  console.log(`💻 Open http://localhost:${port}/retro-terminal.html in your browser`);
  
  // Create logs directory if it doesn't exist
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Write to log file
  const logFilePath = path.join(logsDir, `retro-terminal-server-${Date.now()}.log`);
  const logMessage = `Retro terminal server started at ${new Date().toISOString()} on port ${port}\n`;
  fs.writeFileSync(logFilePath, logMessage);
});