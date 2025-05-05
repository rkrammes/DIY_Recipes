const express = require('express');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Create the Express app
const app = express();

// Supabase MCP server settings
const MCP_HOST = 'localhost';
const MCP_PORT = process.env.MCP_SUPABASE_PORT || 3002;

// Web server port
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Server status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    server: 'DIY Recipes Supabase MCP Proxy',
    mcpEndpoint: `http://${MCP_HOST}:${MCP_PORT}`
  });
});

// Dev user login endpoint (for testing)
app.post('/api/dev-login', (req, res) => {
  // Mock response for dev login
  res.json({
    user: {
      id: 'dev-user-id',
      email: 'dev@example.com',
      user_metadata: { name: 'Development User' }
    },
    session: {
      access_token: 'mock-dev-token',
      refresh_token: 'mock-refresh-token',
      expires_at: Date.now() + 3600000 // 1 hour from now
    }
  });
});

// Function to proxy requests to the MCP server
function proxyToMcpServer(req, res) {
  const mcpPath = req.url.replace('/api/mcp', '');
  const options = {
    hostname: MCP_HOST,
    port: MCP_PORT,
    path: mcpPath,
    method: req.method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    let responseData = '';
    
    // Set status code from MCP response
    res.status(proxyRes.statusCode);
    
    // Copy headers from MCP response
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    
    proxyRes.on('data', (chunk) => {
      responseData += chunk;
    });
    
    proxyRes.on('end', () => {
      try {
        // Try to parse JSON response
        const jsonData = JSON.parse(responseData);
        res.json(jsonData);
      } catch (e) {
        // If not valid JSON, send as text
        res.send(responseData);
      }
    });
  });
  
  proxyReq.on('error', (error) => {
    console.error('Error proxying to MCP server:', error);
    res.status(502).json({ 
      error: 'Failed to connect to MCP server',
      details: error.message,
      mcpEndpoint: `${MCP_HOST}:${MCP_PORT}`
    });
  });
  
  // If there's request body data, send it to the MCP server
  if (req.body && Object.keys(req.body).length > 0) {
    proxyReq.write(JSON.stringify(req.body));
  }
  
  proxyReq.end();
}

// Proxy all requests to /api/mcp/* to the MCP server
app.all('/api/mcp/*', proxyToMcpServer);

// Default route - serve the test page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mcp-test.html'));
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Supabase MCP Proxy Server running on port ${PORT}`);
  console.log(`Proxying MCP requests to http://${MCP_HOST}:${MCP_PORT}`);
  console.log(`View the test page at http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try killing existing processes.`);
  } else {
    console.error('Server error:', err);
  }
});

// Log process info
console.log(`Server process ID: ${process.pid}`);
console.log(`Working directory: ${process.cwd()}`);
console.log(`Node version: ${process.version}`);
console.log(`Platform: ${process.platform}`);

// Keep the script running
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});