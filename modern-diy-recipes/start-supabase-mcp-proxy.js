const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const MCP_SERVER_PATH = path.resolve(__dirname, '../mcp-servers/supabase-mcp-server.cjs');
const MCP_SERVER_PORT = process.env.MCP_SUPABASE_PORT || 3002;
const PROXY_SERVER_PATH = path.resolve(__dirname, 'supabase-mcp-proxy-server.js');
const PROXY_SERVER_PORT = process.env.PORT || 3000;

// Ensure the Supabase MCP server exists
if (!fs.existsSync(MCP_SERVER_PATH)) {
  console.error(`Error: MCP server file not found at ${MCP_SERVER_PATH}`);
  console.error('Please make sure the Supabase MCP server is installed correctly.');
  process.exit(1);
}

// Function to start a server process
function startServer(serverPath, name, env = {}) {
  console.log(`Starting ${name}...`);
  
  const serverProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      ...env,
    },
    stdio: 'pipe',
  });
  
  serverProcess.stdout.on('data', (data) => {
    console.log(`[${name}] ${data.toString().trim()}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(`[${name} ERROR] ${data.toString().trim()}`);
  });
  
  serverProcess.on('close', (code) => {
    console.log(`[${name}] process exited with code ${code}`);
    
    if (code !== 0) {
      console.error(`${name} crashed. Exiting...`);
      process.exit(1);
    }
  });
  
  return serverProcess;
}

// Set environment variables for MCP server
const mcpEnv = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://moygoxnmomypjlbvobta.supabase.co',
  SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  MCP_SUPABASE_PORT: MCP_SERVER_PORT,
};

// Start MCP server
console.log(`Starting Supabase MCP server on port ${MCP_SERVER_PORT}...`);
const mcpProcess = startServer(MCP_SERVER_PATH, 'Supabase MCP Server', mcpEnv);

// Wait a bit for MCP server to start before starting proxy
setTimeout(() => {
  // Set environment variables for proxy server
  const proxyEnv = {
    PORT: PROXY_SERVER_PORT,
    MCP_SUPABASE_PORT: MCP_SERVER_PORT,
  };
  
  // Start proxy server
  console.log(`Starting Proxy server on port ${PROXY_SERVER_PORT}...`);
  const proxyProcess = startServer(PROXY_SERVER_PATH, 'Proxy Server', proxyEnv);
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down servers...');
    
    mcpProcess.kill('SIGINT');
    proxyProcess.kill('SIGINT');
    
    setTimeout(() => {
      console.log('All servers stopped. Exiting.');
      process.exit(0);
    }, 1000);
  });
  
  console.log(`\nServers started successfully!`);
  console.log(`- Supabase MCP Server: http://localhost:${MCP_SERVER_PORT}`);
  console.log(`- Proxy Server: http://localhost:${PROXY_SERVER_PORT}`);
  console.log(`\nOpen http://localhost:${PROXY_SERVER_PORT} in your browser to test the integration.`);
  console.log(`\nPress Ctrl+C to stop all servers.\n`);
}, 2000);