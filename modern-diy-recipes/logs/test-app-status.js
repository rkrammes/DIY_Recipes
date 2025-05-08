/**
 * Server Status Test
 * 
 * This script checks the status of the application server by making requests to various endpoints
 * and printing out the responses.
 */

const http = require('http');
const https = require('https');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const SERVER_PORT = 3000;
const SERVER_HOST = 'localhost';
const LOG_FILE = path.join(__dirname, 'app-status-test.log');
const SCREENSHOT_DIR = path.join(__dirname, 'test-screenshots');

// Create screenshot directory if it doesn't exist
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Start log
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
};

// Initialize log file
fs.writeFileSync(LOG_FILE, `Server Status Test - ${new Date().toISOString()}\n\n`);

log(`Starting server status test for ${SERVER_HOST}:${SERVER_PORT}`);

// Check if server is running
const checkServerUp = () => {
  return new Promise((resolve) => {
    const req = http.get(`http://${SERVER_HOST}:${SERVER_PORT}/`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        log(`Server responded with status code: ${res.statusCode}`);
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      log(`Error connecting to server: ${error.message}`);
      resolve({ status: 'error', error: error.message });
    });
    
    req.end();
  });
};

// Test endpoints
const testEndpoints = async () => {
  const endpoints = [
    '/',
    '/api/status',
    '/test', // Test route if it exists
  ];
  
  for (const endpoint of endpoints) {
    log(`Testing endpoint: ${endpoint}`);
    try {
      const req = http.get(`http://${SERVER_HOST}:${SERVER_PORT}${endpoint}`, (res) => {
        log(`Endpoint ${endpoint} responded with status code: ${res.statusCode}`);
      });
      
      req.on('error', (error) => {
        log(`Error connecting to endpoint ${endpoint}: ${error.message}`);
      });
      
      req.end();
    } catch (error) {
      log(`Error testing endpoint ${endpoint}: ${error.message}`);
    }
    
    // Short delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

// Create a screenshot using Puppeteer
const createScreenshot = async () => {
  try {
    log('Attempting to take screenshot with Puppeteer...');
    
    // Check if Puppeteer is installed
    try {
      require('puppeteer');
    } catch (e) {
      log('Puppeteer is not installed. Screenshot will be skipped.');
      return;
    }
    
    const puppeteer = require('puppeteer');
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport for consistent screenshots
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the homepage
    log(`Navigating to http://${SERVER_HOST}:${SERVER_PORT}/`);
    await page.goto(`http://${SERVER_HOST}:${SERVER_PORT}/`, {
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    // Take a screenshot and save it
    const screenshotPath = path.join(SCREENSHOT_DIR, `status-test-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });
    log(`Screenshot saved to ${screenshotPath}`);
    
    // Close the browser
    await browser.close();
    
    return screenshotPath;
  } catch (error) {
    log(`Error creating screenshot: ${error.message}`);
    return null;
  }
};

// Main function
const runTest = async () => {
  // Check server
  const serverStatus = await checkServerUp();
  
  if (serverStatus.status === 200) {
    log('Server is up and running');
    
    // Test endpoints
    await testEndpoints();
    
    // Create screenshot
    const screenshotPath = await createScreenshot();
    if (screenshotPath) {
      log(`Test complete. Server is running correctly. Screenshot saved at ${screenshotPath}`);
    } else {
      log('Test complete. Server is running correctly but screenshot failed.');
    }
  } else {
    log(`Server check failed. Status: ${serverStatus.status}`);
  }
};

// Run the test
runTest().catch(error => {
  log(`Test failed with error: ${error.message}`);
});