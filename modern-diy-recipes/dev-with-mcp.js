/**
 * Combined development script for running the app with MCP server
 * 
 * This script sets up and runs both the Supabase MCP server and the Next.js dev server.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// First ensure the MCP server files are copied
console.log('Setting up MCP server files...');
require('./copy-supabase-mcp-server.js');

// Start the Supabase MCP server
console.log('Starting Supabase MCP server...');

const mcpServerProcess = spawn('node', ['start-supabase-mcp.js'], { 
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_PUBLIC_USE_SUPABASE_MCP: 'true'
  }
});

// Give the MCP server a moment to start up
setTimeout(() => {
  // Start the Next.js dev server
  console.log('Starting Next.js development server...');
  
  const nextProcess = spawn('next', ['dev'], { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_PUBLIC_USE_SUPABASE_MCP: 'true'
    }
  });

  // Handle Next.js process events
  nextProcess.on('error', (err) => {
    console.error('Failed to start Next.js dev server:', err);
  });

  nextProcess.on('close', (code) => {
    console.log(`Next.js dev server process exited with code ${code}`);
    // Kill the MCP server when Next.js exits
    mcpServerProcess.kill();
  });

}, 2000); // Wait 2 seconds for MCP server to start

// Handle MCP server process events
mcpServerProcess.on('error', (err) => {
  console.error('Failed to start Supabase MCP server:', err);
});

mcpServerProcess.on('close', (code) => {
  console.log(`Supabase MCP server process exited with code ${code}`);
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down all servers...');
  mcpServerProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down all servers...');
  mcpServerProcess.kill('SIGTERM');
  process.exit(0);
});