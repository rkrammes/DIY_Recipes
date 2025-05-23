/**
 * Real Test and Report
 * 
 * This script provides definitive proof of whether the server is running
 * by continuously testing it and displaying visual progress.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
const PORT = 3000;
const SERVER_URL = `http://localhost:${PORT}`;
const MAX_ATTEMPTS = 30;
const DELAY_BETWEEN_ATTEMPTS = 2000; // 2 seconds
const LOG_FILE = path.join(__dirname, 'logs', `real-test-report-${Date.now()}.log`);

// Ensure logs directory exists
if (!fs.existsSync(path.join(__dirname, 'logs'))) {
  fs.mkdirSync(path.join(__dirname, 'logs'));
}

// Initialize log file
fs.writeFileSync(LOG_FILE, `# Server Test Report - ${new Date().toISOString()}\n\n`);

// Helper function to log messages
function log(message, toConsole = true) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  // Append to log file
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
  
  // Print to console if requested
  if (toConsole) {
    console.log(logMessage);
  }
}

// Function to check if any process is running on port 3000
function checkProcessOnPort() {
  return new Promise((resolve) => {
    exec(`lsof -i :${PORT} | grep LISTEN`, (error, stdout, stderr) => {
      if (error) {
        log(`No process found listening on port ${PORT}`);
        resolve(false);
        return;
      }
      
      if (stdout.trim()) {
        log(`Process found on port ${PORT}: ${stdout.trim()}`);
        resolve(true);
      } else {
        log(`No process found listening on port ${PORT}`);
        resolve(false);
      }
    });
  });
}

// Function to check if server is responding
function checkServerResponse() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/',
        method: 'HEAD',
        timeout: 5000
      },
      (res) => {
        log(`Server responded with status code: ${res.statusCode}`);
        resolve(res.statusCode);
      }
    );
    
    req.on('error', (err) => {
      log(`Server request error: ${err.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      log('Server request timed out');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Function to run a comprehensive test
async function runTest(attemptNumber) {
  log(`\n=== Test Attempt ${attemptNumber}/${MAX_ATTEMPTS} ===`);
  
  // Step 1: Check if a process is listening on the port
  const processRunning = await checkProcessOnPort();
  const statusLine = processRunning 
    ? "✅ Process is running on port 3000"
    : "❌ No process is running on port 3000";
  log(statusLine);
  
  // Step 2: If process is running, check HTTP response
  if (processRunning) {
    const statusCode = await checkServerResponse();
    
    if (statusCode === 200) {
      log("✅ Server is responding with 200 OK");
      return true;
    } else if (statusCode) {
      log(`⚠️ Server is responding with status code: ${statusCode}`);
      return false;
    } else {
      log("❌ Server is not responding to HTTP requests");
      return false;
    }
  }
  
  return false;
}

// Main function to run multiple test attempts
async function main() {
  console.log("===========================================");
  console.log("        REAL SERVER TEST AND REPORT        ");
  console.log("===========================================");
  console.log(`Testing server at: ${SERVER_URL}`);
  console.log(`Will attempt ${MAX_ATTEMPTS} tests over ${MAX_ATTEMPTS * DELAY_BETWEEN_ATTEMPTS / 1000} seconds`);
  console.log("===========================================");
  
  let isRunning = false;
  
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    process.stdout.write(`\rTest ${attempt}/${MAX_ATTEMPTS}... `);
    
    isRunning = await runTest(attempt);
    
    if (isRunning) {
      process.stdout.write("✅ SERVER IS RUNNING AND RESPONDING!\n");
      break;
    } else {
      process.stdout.write("❌ Server not responding properly.\n");
    }
    
    // Wait before next attempt
    if (attempt < MAX_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_ATTEMPTS));
    }
  }
  
  console.log("\n===========================================");
  if (isRunning) {
    console.log(`✅ FINAL RESULT: SERVER IS RUNNING AT ${SERVER_URL}`);
    console.log("✅ The application is accessible in your browser");
  } else {
    console.log(`❌ FINAL RESULT: SERVER IS NOT RUNNING AT ${SERVER_URL}`);
    console.log("❌ The application is NOT accessible");
  }
  console.log("===========================================");
  
  log(`\nFinal result: Server is ${isRunning ? 'RUNNING' : 'NOT RUNNING'}`);
  log(`Test report saved to: ${LOG_FILE}`);
  
  return isRunning;
}

// Run the main function
main().then(isRunning => {
  process.exit(isRunning ? 0 : 1);
});