// Comprehensive test script for port 3000
const http = require('http');
const { spawn } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const net = require('net');

const sleep = promisify(setTimeout);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.cyan}PORT 3000 CONNECTIVITY TEST${colors.reset}\n`);

// Check if port 3000 is already in use
async function checkPort() {
  console.log(`${colors.blue}Checking if port 3000 is already in use...${colors.reset}`);
  
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`${colors.red}Port 3000 is already in use!${colors.reset}`);
        resolve(true);
      } else {
        console.log(`${colors.yellow}Error checking port: ${err.message}${colors.reset}`);
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      console.log(`${colors.green}Port 3000 is available${colors.reset}`);
      server.close();
      resolve(false);
    });
    
    server.listen(3000);
  });
}

// Create a simple HTTP server
async function createServer() {
  console.log(`${colors.blue}Creating a simple HTTP server on port 3000...${colors.reset}`);
  
  const server = http.createServer((req, res) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Test server running on port 3000');
  });
  
  return new Promise((resolve) => {
    server.on('error', (err) => {
      console.log(`${colors.red}Failed to start server: ${err.message}${colors.reset}`);
      resolve(null);
    });
    
    server.listen(3000, '0.0.0.0', () => {
      console.log(`${colors.green}Server started on http://0.0.0.0:3000/${colors.reset}`);
      resolve(server);
    });
  });
}

// Test connection to the server
async function testConnection() {
  console.log(`${colors.blue}Testing connection to localhost:3000...${colors.reset}`);
  
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`${colors.green}Successfully connected to server!${colors.reset}`);
        console.log(`${colors.green}Status code: ${res.statusCode}${colors.reset}`);
        console.log(`${colors.green}Response: ${data}${colors.reset}`);
        resolve(true);
      });
    });
    
    req.on('error', (err) => {
      console.log(`${colors.red}Failed to connect: ${err.message}${colors.reset}`);
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log(`${colors.red}Connection timed out${colors.reset}`);
      req.destroy();
      resolve(false);
    });
  });
}

// Main test function
async function runTests() {
  try {
    // Check if port is already in use
    const portInUse = await checkPort();
    
    if (portInUse) {
      console.log(`${colors.yellow}Port 3000 appears to be in use, but let's test if it's accessible...${colors.reset}`);
      const accessible = await testConnection();
      
      if (accessible) {
        console.log(`${colors.green}${colors.bold}SUCCESS: A server is already running on port 3000 and it's accessible.${colors.reset}`);
      } else {
        console.log(`${colors.red}${colors.bold}ERROR: Port 3000 appears to be in use, but the server is not accessible.${colors.reset}`);
        console.log(`${colors.yellow}This could indicate a zombie process or a server that's not responding.${colors.reset}`);
        console.log(`${colors.yellow}Try running: lsof -i :3000 -t | xargs kill -9${colors.reset}`);
      }
      
      return;
    }
    
    // No server running, let's start one
    console.log(`${colors.blue}Starting a test server...${colors.reset}`);
    const server = await createServer();
    
    if (!server) {
      console.log(`${colors.red}${colors.bold}ERROR: Failed to start test server on port 3000${colors.reset}`);
      console.log(`${colors.yellow}This could indicate permission issues or a hidden process.${colors.reset}`);
      return;
    }
    
    // Server started, now test connection
    console.log(`${colors.blue}Waiting a moment for server to initialize...${colors.reset}`);
    await sleep(1000);
    
    const accessible = await testConnection();
    
    if (accessible) {
      console.log(`${colors.green}${colors.bold}SUCCESS: Server on port 3000 is accessible!${colors.reset}`);
    } else {
      console.log(`${colors.red}${colors.bold}ERROR: Server started but is not accessible. This suggests a network issue.${colors.reset}`);
      console.log(`${colors.yellow}Check for firewall settings or proxy configurations.${colors.reset}`);
    }
    
    // Shutdown the server
    console.log(`${colors.blue}Shutting down test server...${colors.reset}`);
    server.close();
    
  } catch (err) {
    console.error(`${colors.red}${colors.bold}Unexpected error:${colors.reset}`, err);
  }
}

// Run the tests
runTests().then(() => {
  console.log(`${colors.bold}${colors.cyan}Test completed${colors.reset}`);
});