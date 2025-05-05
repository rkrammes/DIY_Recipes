#!/usr/bin/env node

/**
 * Custom Next.js server with detailed startup information
 * This will help identify issues with the Next.js startup process
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Log with timestamp
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  let prefix = '';
  
  switch (type) {
    case 'error': prefix = '❌ ERROR'; break;
    case 'warn': prefix = '⚠️ WARN '; break;
    case 'success': prefix = '✅ SUCCESS'; break;
    case 'info': default: prefix = 'ℹ️ INFO '; break;
  }
  
  console.log(`[${timestamp}] ${prefix}: ${message}`);
}

// Check for existing servers
async function checkPorts() {
  log('Checking for processes on port 3000...');
  try {
    const { execSync } = require('child_process');
    const command = process.platform === 'win32' 
      ? 'netstat -ano | findstr :3000'
      : 'lsof -i :3000 || echo "No process found"';
    
    const result = execSync(command, { encoding: 'utf8' });
    if (result.includes('No process found')) {
      log('Port 3000 is available', 'success');
    } else {
      log(`Found processes on port 3000:\n${result}`, 'warn');
    }
  } catch (error) {
    log(`Error checking port: ${error.message}`, 'error');
  }
}

// Check node.js installation
function checkNodeVersion() {
  log(`Running on Node.js ${process.version} / ${process.platform}`);
  log(`Working Directory: ${process.cwd()}`);
}

// Main startup function
async function startServer() {
  try {
    // Preliminary checks
    checkNodeVersion();
    await checkPorts();
    
    // Check next.config.js/ts
    const configFiles = ['next.config.js', 'next.config.ts', 'next.config.mjs'];
    let configFound = false;
    
    for (const file of configFiles) {
      const configPath = path.join(process.cwd(), file);
      if (fs.existsSync(configPath)) {
        configFound = true;
        log(`Found Next.js config: ${file}`, 'success');
      }
    }
    
    if (!configFound) {
      log('No Next.js config file found', 'warn');
    }
    
    // Initialize Next.js
    log('Initializing Next.js...');
    const dev = process.env.NODE_ENV !== 'production';
    // Use '0.0.0.0' to bind to all network interfaces, not just localhost
    const hostname = '0.0.0.0';
    const port = parseInt(process.env.PORT || '3000', 10);
    
    // Create Next app with debugging
    const app = next({ 
      dev,
      // Explicitly use 'localhost' here for Next.js internal usage
      // but we'll bind the server to 0.0.0.0 later
      hostname: 'localhost',
      port,
      conf: {
        // Basic config to minimize potential issues
        distDir: '.next',
        images: { unoptimized: true }
      }
    });
    
    const handle = app.getRequestHandler();
    
    // Prepare the app (this is where most initialization happens)
    log('Preparing Next.js app (this may take a moment)...');
    await app.prepare();
    log('Next.js app prepared successfully', 'success');
    
    // Create server with detailed logging
    const server = createServer((req, res) => {
      log(`Request received: ${req.method} ${req.url}`);
      
      try {
        // Parse URL
        const parsedUrl = parse(req.url, true);
        
        // Let Next.js handle the request
        handle(req, res, parsedUrl);
      } catch (err) {
        log(`Error handling request: ${err.message}`, 'error');
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });
    
    // Add error handling to server
    server.on('error', (err) => {
      log(`Server error: ${err.message}`, 'error');
      if (err.code === 'EADDRINUSE') {
        log(`Port ${port} is already in use. Try a different port.`, 'error');
      }
      process.exit(1);
    });
    
    // Start listening - explicitly bind to all interfaces
    log(`Starting HTTP server on ${hostname}:${port}...`);
    server.listen(port, hostname, (err) => {
      if (err) throw err;
      
      // Get network interfaces for display
      const os = require('os');
      const interfaces = os.networkInterfaces();
      
      log(`Ready on http://localhost:${port}`, 'success');
      log('The server is also available at:');
      
      // List all available URLs
      Object.keys(interfaces).forEach((ifname) => {
        interfaces[ifname].forEach((iface) => {
          if (iface.family === 'IPv4' && !iface.internal) {
            log(`  http://${iface.address}:${port}`, 'success');
          }
        });
      });
      
      log('Try opening one of these URLs in your browser');
      
      // Try to make a self-request to verify connectivity using localhost
      setTimeout(() => {
        const http = require('http');
        log('Testing self-connectivity via localhost...');
        
        http.get(`http://localhost:${port}`, (res) => {
          log(`Self-connectivity test successful! Status: ${res.statusCode}`, 'success');
        }).on('error', (e) => {
          log(`Self-connectivity test failed: ${e.message}`, 'error');
          log('This indicates a network configuration issue with localhost', 'warn');
          
          // Try connecting via 127.0.0.1 directly
          log('Testing self-connectivity via IP address (127.0.0.1)...');
          http.get(`http://127.0.0.1:${port}`, (res) => {
            log(`IP address connectivity test successful! Status: ${res.statusCode}`, 'success');
            log('You should use http://127.0.0.1:${port} instead of localhost', 'info');
          }).on('error', (err) => {
            log(`IP address connectivity test also failed: ${err.message}`, 'error');
            log('There appears to be a fundamental issue with loopback connectivity', 'error');
          });
        });
      }, 2000);
    });
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Start the server
startServer();