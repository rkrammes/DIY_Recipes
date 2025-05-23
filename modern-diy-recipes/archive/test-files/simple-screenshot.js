const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function captureScreenshot() {
  console.log('📸 Capturing terminal UI screenshot...');
  
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  const timestamp = Date.now();
  const screenshotPath = path.join(screenshotsDir, `terminal-ui-${timestamp}.png`);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1600, height: 900 },
    args: ['--window-size=1600,900'],
    slowMo: 100
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the root page
    console.log('🌐 Navigating to application...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for the dashboard layout to load
    await page.waitForSelector('.formula-dashboard-layout', { timeout: 30000 });
    
    // Take a screenshot of the full page
    console.log(`📸 Taking screenshot: ${screenshotPath}`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    
    console.log('✅ Screenshot captured successfully!');
  } catch (error) {
    console.error('❌ Error capturing screenshot:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshot();