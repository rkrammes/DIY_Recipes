// Simple Puppeteer test to check if the app is running and capture screenshots
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const APP_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-screenshots');
const TIMESTAMP = Date.now();

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Directory created or already exists: ${dirPath}`);
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
  }
}

async function captureScreenshot(page, name) {
  const fileName = `${name}-${TIMESTAMP}.png`;
  const filePath = path.join(SCREENSHOTS_DIR, fileName);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`Screenshot saved: ${filePath}`);
  return filePath;
}

async function testAppIsRunning() {
  console.log('🧪 Testing if the app is running with Puppeteer...');
  
  await ensureDirectoryExists(SCREENSHOTS_DIR);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1280,800', '--no-sandbox']
  });
  
  try {
    // Create a page and setup console log capturing
    const page = await browser.newPage();
    
    page.on('console', message => {
      const type = message.type();
      console.log(`[Browser Console] [${type}] ${message.text()}`);
    });
    
    // Navigate to the app
    console.log(`Navigating to the app at ${APP_URL}...`);
    await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Take a screenshot of the home page
    await captureScreenshot(page, 'home-page');
    
    // Check if the page loaded successfully
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);
    
    // Extract visible text content
    const textContent = await page.evaluate(() => {
      return document.body.innerText;
    });
    
    console.log('Page content snippet:');
    console.log(textContent.substring(0, 500) + '...');
    
    // Try to navigate to the test page
    console.log('Navigating to test page...');
    await page.goto(`${APP_URL}/test`, { waitUntil: 'networkidle2', timeout: 30000 });
    await captureScreenshot(page, 'test-page');
    
    const testPageTitle = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.innerText : 'No H1 found';
    });
    
    console.log(`Test page heading: ${testPageTitle}`);
    
    return true;
  } catch (error) {
    console.error('Error during testing:', error);
    await captureScreenshot(page, 'error-state');
    return false;
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Run the test
async function runTest() {
  try {
    const result = await testAppIsRunning();
    if (result) {
      console.log('\n✅ SUCCESS! The app is running and accessible.');
      console.log('You can view the screenshots in the test-screenshots directory.');
    } else {
      console.log('\n❌ TEST FAILED: The app could not be accessed.');
      console.log('Check the error messages and screenshots for more details.');
    }
  } catch (error) {
    console.error('Error running the test:', error);
  }
}

runTest();