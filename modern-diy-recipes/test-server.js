#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Log file path
const LOG_FILE = path.join(__dirname, 'server-test.log');
console.log(`Writing logs to ${LOG_FILE}`);
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'w' });

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

// Find an available port starting from 3000
async function findAvailablePort(startPort) {
  let port = startPort;
  while (await isPortInUse(port)) {
    console.log(`Port ${port} is in use, trying next...`);
    port++;
  }
  return port;
}

// Start Next.js server
async function startServer() {
  // Clear .next cache
  try {
    const nextCachePath = path.join(__dirname, '.next');
    if (fs.existsSync(nextCachePath)) {
      console.log('Clearing Next.js cache...');
      fs.rmSync(nextCachePath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error('Error clearing cache:', error.message);
  }

  // Find available port
  const port = await findAvailablePort(3000);
  console.log(`Starting Next.js on port ${port}...`);

  // Start Next.js
  const serverProcess = spawn('npx', ['next', 'dev', '--port', port], {
    cwd: __dirname,
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096',
    }
  });

  // Log output
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);
    logStream.write(output);
  });

  serverProcess.stderr.on('data', (data) => {
    const output = data.toString();
    process.stderr.write(`ERROR: ${output}`);
    logStream.write(`ERROR: ${output}`);
  });

  serverProcess.on('error', (error) => {
    console.error('Failed to start Next.js:', error.message);
    logStream.write(`PROCESS ERROR: ${error.message}\n`);
  });

  // Handle server process exit
  serverProcess.on('close', (code) => {
    const message = `Next.js process exited with code ${code}`;
    console.log(message);
    logStream.write(`${message}\n`);
    logStream.end();
  });

  // Return info
  return {
    port,
    process: serverProcess
  };
}

// Main function
async function main() {
  try {
    const server = await startServer();
    console.log(`\nServer started successfully!`);
    console.log(`Open your browser to: http://localhost:${server.port}\n`);
    console.log(`Test the fixed layout at: http://localhost:${server.port}/test-fixed-layout\n`);
    
    // Keep the script running
    process.on('SIGINT', () => {
      console.log('\nShutting down server...');
      server.process.kill();
      logStream.end();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
  }
}

// Run the main function
main();