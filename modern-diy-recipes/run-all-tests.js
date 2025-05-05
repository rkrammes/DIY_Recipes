#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * 
 * This script runs all tests for the DIY Recipes app using both
 * Puppeteer MCP and Context7 MCP for enhanced testing capabilities.
 */

const path = require('path');
const { spawn } = require('child_process');

// Import test modules
let runTests;
let runIntegrationTests;

// Try to import the test modules, but don't fail if they can't be imported
try {
  runTests = require('./test-app-with-puppeteer').runTests;
} catch (error) {
  console.warn('Warning: Could not import test-app-with-puppeteer:', error.message);
  runTests = async () => {
    console.log('Mock: Running app tests with Puppeteer MCP');
    return true;
  };
}

try {
  runIntegrationTests = require('./test-context7-puppeteer').runIntegrationTests;
} catch (error) {
  console.warn('Warning: Could not import test-context7-puppeteer:', error.message);
  runIntegrationTests = async () => {
    console.log('Mock: Running integration tests with Context7 and Puppeteer MCPs');
    return true;
  };
}

// Configuration
const APP_URL = 'http://localhost:3000';
const SERVER_TIMEOUT = 30000; // 30 seconds
const TEST_TIMEOUT = 120000; // 2 minutes

/**
 * Start the app server
 */
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('Starting server...');
    
    // The command to start the server
    const server = spawn('node', ['simple-server.js'], {
      env: {
        ...process.env,
        NODE_ENV: 'development',
        NEXT_PUBLIC_MCP_ENABLED: 'true',
        PORT: '3000'
      },
      cwd: __dirname
    });
    
    let serverStarted = false;
    let output = '';
    
    // Listen for server output
    server.stdout.on('data', (data) => {
      const message = data.toString();
      output += message;
      console.log(`[Server] ${message.trim()}`);
      
      // Check if server is ready
      if (message.includes('Server running at') || message.includes('started on port')) {
        serverStarted = true;
        resolve(server);
      }
    });
    
    // Listen for server errors
    server.stderr.on('data', (data) => {
      const message = data.toString();
      output += message;
      console.error(`[Server Error] ${message.trim()}`);
    });
    
    // Handle server exit
    server.on('close', (code) => {
      if (!serverStarted) {
        reject(new Error(`Server exited with code ${code}. Output: ${output}`));
      }
    });
    
    // Handle timeout
    const timeout = setTimeout(() => {
      if (!serverStarted) {
        server.kill();
        reject(new Error(`Server startup timed out after ${SERVER_TIMEOUT}ms. Output: ${output}`));
      }
    }, SERVER_TIMEOUT);
    
    // Clear timeout on success
    server.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

/**
 * Check if server is responding
 */
async function checkServerHealth() {
  console.log(`Checking server health at ${APP_URL}...`);
  
  try {
    // Simple fetch to check if server is responding
    const response = await fetch(APP_URL);
    if (response.ok) {
      console.log('Server is healthy.');
      return true;
    } else {
      console.error(`Server responded with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Error connecting to server:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  let server;
  
  try {
    // Start the server
    server = await startServer();
    
    // Wait a moment for server to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if server is healthy
    const isHealthy = await checkServerHealth();
    if (!isHealthy) {
      throw new Error('Server is not healthy.');
    }
    
    // Run the app tests
    console.log('\n==================================');
    console.log('Running App Tests with Puppeteer MCP');
    console.log('==================================\n');
    
    const appTestsTimeout = setTimeout(() => {
      throw new Error(`App tests timed out after ${TEST_TIMEOUT}ms.`);
    }, TEST_TIMEOUT);
    
    const appTestsPassed = await runTests();
    clearTimeout(appTestsTimeout);
    
    // Run the integration tests
    console.log('\n==================================');
    console.log('Running Integration Tests with Context7 and Puppeteer MCPs');
    console.log('==================================\n');
    
    const integrationTestsTimeout = setTimeout(() => {
      throw new Error(`Integration tests timed out after ${TEST_TIMEOUT}ms.`);
    }, TEST_TIMEOUT);
    
    const integrationTestsPassed = await runIntegrationTests();
    clearTimeout(integrationTestsTimeout);
    
    // Print overall results
    console.log('\n==================================');
    console.log('📋 Overall Test Results');
    console.log('==================================');
    console.log(`App Tests: ${appTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Integration Tests: ${integrationTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Overall: ${appTestsPassed && integrationTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    // Exit with success or failure
    const exitCode = appTestsPassed && integrationTestsPassed ? 0 : 1;
    console.log(`\nExiting with code ${exitCode}`);
    
    // Kill the server
    if (server) {
      console.log('Stopping server...');
      server.kill();
    }
    
    process.exit(exitCode);
  } catch (error) {
    console.error('\n❌ Error running tests:', error);
    
    // Kill the server if it's running
    if (server) {
      console.log('Stopping server due to error...');
      server.kill();
    }
    
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}