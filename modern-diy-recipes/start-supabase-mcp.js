/**
 * Start the Supabase MCP server
 * 
 * This script starts the Supabase MCP server with the correct environment variables.
 */

const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables from .env.supabase-mcp
dotenv.config({ path: '.env.supabase-mcp' });

// Path to the Supabase MCP server
const supabaseMcpServerPath = path.join(__dirname, 'mcp-servers', 'supabase-mcp-server.cjs');

// Check if server file exists
if (!fs.existsSync(supabaseMcpServerPath)) {
  console.error(`Error: Supabase MCP server file not found at ${supabaseMcpServerPath}`);
  process.exit(1);
}

// Start the Supabase MCP server
console.log(`Starting Supabase MCP server from ${supabaseMcpServerPath}...`);

const env = {
  ...process.env,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY,
  MCP_SUPABASE_PORT: process.env.MCP_SUPABASE_PORT || '3002'
};

// Start the server process
const server = spawn('node', [supabaseMcpServerPath], {
  env,
  stdio: 'inherit'
});

// Handle server process events
server.on('error', (err) => {
  console.error('Failed to start Supabase MCP server:', err);
});

server.on('close', (code) => {
  console.log(`Supabase MCP server process exited with code ${code}`);
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down Supabase MCP server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down Supabase MCP server...');
  server.kill('SIGTERM');
});

console.log(`Supabase MCP server started on port ${process.env.MCP_SUPABASE_PORT || 3002}`);