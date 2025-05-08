/**
 * Document Interface Screenshot
 * 
 * This script takes a screenshot of the document-centric interface
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const URL = 'http://localhost:3000/document-interface';
const SCREENSHOT_DIR = path.join(__dirname, 'test-screenshots');
const TIMESTAMP = Date.now();
const SCREENSHOT_PATH = path.join(SCREENSHOT_DIR, `document-interface-${TIMESTAMP}.png`);

// Create screenshot directory if it doesn't exist
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Take screenshot function
async function takeScreenshot() {
  console.log(`Launching browser to capture ${URL}...`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport for consistent screenshots
  await page.setViewport({ width: 1280, height: 800 });
  
  console.log(`Navigating to ${URL}`);
  try {
    await page.goto(URL, {
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    console.log('Page loaded, taking screenshot...');
    await page.screenshot({ path: SCREENSHOT_PATH });
    console.log(`Screenshot saved to ${SCREENSHOT_PATH}`);
    
    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Get page content
    const content = await page.content();
    // Save HTML for analysis
    fs.writeFileSync(path.join(SCREENSHOT_DIR, `document-interface-${TIMESTAMP}.html`), content);
    console.log(`HTML content saved for analysis`);
    
  } catch (error) {
    console.error(`Error while accessing ${URL}:`, error.message);
  }
  
  await browser.close();
  console.log('Browser closed');
}

// Run the screenshot function
takeScreenshot().catch(error => {
  console.error('Error in screenshot process:', error.message);
});