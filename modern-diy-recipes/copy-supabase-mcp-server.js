/**
 * Copy Supabase MCP Server
 * 
 * This script copies the Supabase MCP server from the parent directory
 * to the project directory if it doesn't exist.
 */

const fs = require('fs');
const path = require('path');

// Paths
let SOURCE_SERVER_PATH = path.resolve(__dirname, '..', 'mcp-servers', 'supabase-mcp-server.cjs');
const SOURCE_CONFIG_PATH = path.resolve(__dirname, '..', 'supabase_mcp_config.toml');
const DEST_SERVER_PATH = path.resolve(__dirname, 'supabase-mcp-server.cjs');
const DEST_CONFIG_PATH = path.resolve(__dirname, 'supabase_mcp_config.toml');

// Check if source files exist
console.log(`Looking for MCP server at: ${SOURCE_SERVER_PATH}`);

if (!fs.existsSync(SOURCE_SERVER_PATH)) {
  console.error(`Source server file not found: ${SOURCE_SERVER_PATH}`);
  console.log('Checking for alternative location...');
  
  // Try an alternative path
  const ALT_SOURCE_PATH = path.resolve(__dirname, '..', 'mcp-servers', 'supabase-mcp-server.cjs');
  
  if (fs.existsSync(ALT_SOURCE_PATH)) {
    console.log(`Found alternative server at: ${ALT_SOURCE_PATH}`);
    SOURCE_SERVER_PATH = ALT_SOURCE_PATH;
  } else {
    console.error('Supabase MCP server not found in any location.');
    process.exit(1);
  }
}

// Copy the server file if it doesn't exist
if (!fs.existsSync(DEST_SERVER_PATH)) {
  console.log(`Copying Supabase MCP server to ${DEST_SERVER_PATH}`);
  
  try {
    fs.copyFileSync(SOURCE_SERVER_PATH, DEST_SERVER_PATH);
    console.log('Server file copied successfully');
  } catch (err) {
    console.error('Error copying server file:', err);
  }
} else {
  console.log(`Supabase MCP server already exists at ${DEST_SERVER_PATH}`);
}

// Check if config file exists and create if not
if (!fs.existsSync(DEST_CONFIG_PATH)) {
  console.log(`Creating Supabase MCP config at ${DEST_CONFIG_PATH}`);
  
  // Try to copy from source if it exists
  if (fs.existsSync(SOURCE_CONFIG_PATH)) {
    try {
      fs.copyFileSync(SOURCE_CONFIG_PATH, DEST_CONFIG_PATH);
      console.log('Config file copied successfully from source');
    } catch (err) {
      console.error('Error copying config file:', err);
    }
  } else {
    // Create a new config file
    const configContent = `
# Supabase MCP Config

[server]
# The port to run the MCP server on
port = 3002

[supabase]
# Supabase project URL
url = "${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://moygoxnmomypjlbvobta.supabase.co'}"
# Supabase anonymous key
anon_key = "${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}"

[development]
# Development user credentials
dev_user_email = "${process.env.NEXT_PUBLIC_DEV_USER_EMAIL || 'dev@example.com'}"
dev_user_password = "${process.env.NEXT_PUBLIC_DEV_USER_PASSWORD || 'devpass123'}"
`;

    try {
      fs.writeFileSync(DEST_CONFIG_PATH, configContent);
      console.log('New config file created successfully');
    } catch (err) {
      console.error('Error creating config file:', err);
    }
  }
} else {
  console.log(`Supabase MCP config already exists at ${DEST_CONFIG_PATH}`);
}

console.log('Supabase MCP server setup complete!');
console.log('You can now start the server with: npm run start-mcp-proxy');