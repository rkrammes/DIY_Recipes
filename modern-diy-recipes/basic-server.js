/**
 * Basic Development Server
 * 
 * A simple Express server that serves static files and proxies API requests to the Supabase MCP server.
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 5000;

// Assuming your Next.js app is built to the 'out' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create a proxy for supabase MCP server
const SUPABASE_MCP_PORT = process.env.MCP_SUPABASE_PORT || 3002;
app.use('/api/mcp', createProxyMiddleware({ 
  target: `http://localhost:${SUPABASE_MCP_PORT}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/mcp': '/'
  }
}));

// Mock API endpoints - replace with real implementation as needed
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    mcp_enabled: process.env.NEXT_PUBLIC_USE_SUPABASE_MCP === 'true',
    timestamp: new Date().toISOString()
  });
});

// Dev login endpoint
app.post('/api/dev-login', (req, res) => {
  // Return a mock successful login response
  res.json({
    user: {
      id: 'dev-user-id',
      email: process.env.NEXT_PUBLIC_DEV_USER_EMAIL || 'dev@example.com',
      user_metadata: { name: 'Development User' }
    },
    session: {
      access_token: 'mock-access-token'
    }
  });
});

// Fallback route - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Basic development server running on http://localhost:${PORT}`);
  console.log(`Proxying MCP requests to http://localhost:${SUPABASE_MCP_PORT}`);
});