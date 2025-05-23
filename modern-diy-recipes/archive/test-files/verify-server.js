/**
 * Next.js Server Connectivity Verification
 * 
 * This script:
 * 1. Starts the Next.js dev server
 * 2. Waits for it to be ready
 * 3. Attempts to connect to it
 * 4. Reports on success or failure
 */

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create logs directory if needed
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Set up logging
const logFile = path.join(logsDir, 'server-verification.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}`;
  console.log(entry);
  logStream.write(entry + '\n');
}

// Start the Next.js server
function startNextServer() {
  log('Starting Next.js server...');
  
  // Use a specific port for testing
  const port = 3456;
  
  // Start Next.js using npm script
  const serverProcess = spawn('npm', ['run', 'dev', '--', '-p', port.toString()], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
  });
  
  let output = '';
  let serverReady = false;
  let serverUrl = null;
  
  // Save process ID for cleanup
  log(`Server process ID: ${serverProcess.pid}`);
  
  // Monitor stdout
  serverProcess.stdout.on('data', (data) => {
    const chunk = data.toString();
    output += chunk;
    
    // Look for more reliable indicators of server readiness
    // Next.js 15.x has "Ready in Xms" message
    if ((chunk.includes('Ready in') || chunk.includes('ready')) && !serverReady) {
      log(`Server appears ready based on output: ${chunk.trim()}`);
      serverReady = true;
      
      // Extract the URL from Next.js output
      const urlMatch = chunk.match(/http:\/\/localhost:\d+/) || output.match(/http:\/\/localhost:\d+/);
      if (urlMatch) {
        serverUrl = urlMatch[0];
        log(`Server ready at ${serverUrl}`);
        
        // Now test connectivity - add a delay to ensure the server is fully initialized
        setTimeout(() => {
          testServerConnectivity(serverUrl, serverProcess);
        }, 2000);
      } else {
        serverUrl = `http://localhost:${port}`;
        log(`Server appears ready, testing ${serverUrl}`);
        setTimeout(() => {
          testServerConnectivity(serverUrl, serverProcess);
        }, 2000);
      }
    }
  });
  
  // Monitor stderr
  serverProcess.stderr.on('data', (data) => {
    const chunk = data.toString();
    output += chunk;
    
    if (chunk.includes('error')) {
      log(`Server error: ${chunk.trim()}`);
    }
  });
  
  // Set timeout for server startup
  const startupTimeout = setTimeout(() => {
    if (!serverReady) {
      log('ERROR: Server failed to start within 60 seconds');
      log('Last output:');
      log(output.split('\n').slice(-20).join('\n'));
      serverProcess.kill();
      process.exit(1);
    }
  }, 60000);
  
  // Handle process exit
  serverProcess.on('close', (code) => {
    clearTimeout(startupTimeout);
    if (code !== 0 && !serverReady) {
      log(`Server process exited with code ${code} before becoming ready`);
      log('Last output:');
      log(output.split('\n').slice(-20).join('\n'));
      process.exit(1);
    }
  });
  
  // Handle parent process exit
  process.on('SIGINT', () => {
    log('Stopping server due to interrupt...');
    serverProcess.kill();
    logStream.end();
    process.exit(0);
  });
  
  return serverProcess;
}

// Test server connectivity
function testServerConnectivity(url, serverProcess) {
  log(`Testing connectivity to ${url}...`);
  
  // First try normal localhost
  const request = http.get(url, (res) => {
    log(`SUCCESS: Connected to server! Status code: ${res.statusCode}`);
    
    // Read a bit of the response
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
      // Just read a small amount to verify
      if (data.length > 100) {
        res.destroy();
      }
    });
    
    res.on('end', () => {
      log('Successfully received data from server');
      log('Connection verification PASSED!');
      
      // Wait a moment before shutting down
      setTimeout(() => {
        log('Test complete, shutting down server');
        serverProcess.kill();
        logStream.end();
        process.exit(0);
      }, 1000);
    });
  });
  
  request.on('error', (err) => {
    log(`ERROR: Failed to connect to ${url}: ${err.message}`);
    
    // Try with IP address directly
    log('Trying with direct IP address...');
    
    // Convert localhost to 127.0.0.1
    const ipUrl = url.replace('localhost', '127.0.0.1');
    
    http.get(ipUrl, (res) => {
      log(`SUCCESS: Connected via IP address! Status code: ${res.statusCode}`);
      log('Connection verification PASSED with IP address!');
      
      // Wait a moment before shutting down
      setTimeout(() => {
        log('Test complete, shutting down server');
        serverProcess.kill();
        logStream.end();
        process.exit(0);
      }, 1000);
    }).on('error', (ipErr) => {
      log(`ERROR: Failed to connect via IP address: ${ipErr.message}`);
      log('Connection verification FAILED!');
      
      // Try a different approach - create our own test server
      testAlternativeConnectivity(serverProcess);
    });
  });
  
  // Set timeout for request
  request.setTimeout(10000, () => {
    request.destroy(new Error('Request timed out after 10 seconds'));
  });
}

// Test alternative connectivity by creating our own server
function testAlternativeConnectivity(serverProcess) {
  log('Testing alternative connectivity...');
  
  // Create a simple test server
  const testServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Test server is working');
  });
  
  // Try to bind to port 8888
  testServer.listen(8888, '0.0.0.0', () => {
    const testPort = testServer.address().port;
    log(`Test server running on port ${testPort}`);
    
    // Try connecting to ourselves
    http.get(`http://localhost:${testPort}`, (res) => {
      log(`Alternative server test SUCCESS: Status ${res.statusCode}`);
      log('Basic HTTP connectivity works, problem is specific to Next.js server');
      
      // Clean up
      testServer.close();
      serverProcess.kill();
      logStream.end();
      process.exit(1);
    }).on('error', (err) => {
      log(`Alternative server test FAILED: ${err.message}`);
      log('Fundamental connectivity issue detected - check network configuration');
      
      // Clean up
      testServer.close();
      serverProcess.kill();
      logStream.end();
      process.exit(1);
    });
  });
  
  testServer.on('error', (err) => {
    log(`Could not start test server: ${err.message}`);
    log('Alternative connectivity test failed');
    serverProcess.kill();
    logStream.end();
    process.exit(1);
  });
}

// Start the verification process
log('=== Next.js Server Connectivity Verification ===');
const serverProcess = startNextServer();