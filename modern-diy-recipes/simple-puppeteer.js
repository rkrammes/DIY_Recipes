#!/usr/bin/env node

/**
 * Ultra simple Puppeteer test that just loads the app
 * and takes screenshots of what it sees
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'simple-test');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function simpleTest() {
  console.log('Running simple Puppeteer test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 1024 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Log console messages
    page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
    
    // Navigate to app
    console.log('Loading app...');
    await page.goto('http://localhost:3000');
    await new Promise(r => setTimeout(r, 3000));
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'home.png'),
      fullPage: true 
    });
    
    console.log('Test complete');
    
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    // Keep browser open for manual testing
    console.log('Browser will remain open for manual testing. Press Ctrl+C to close.');
  }
}

simpleTest().catch(console.error);