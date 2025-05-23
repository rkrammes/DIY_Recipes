const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function captureRetroTerminal() {
  console.log('📸 Capturing retro terminal screenshot...');
  
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, 'retro-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  const timestamp = Date.now();
  const screenshotPath = path.join(screenshotsDir, `retro-terminal-${timestamp}.png`);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1600, height: 900 },
    args: ['--window-size=1600,900'],
    slowMo: 100
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to retro terminal
    console.log('🌐 Navigating to retro terminal...');
    await page.goto('http://localhost:3000/retro-terminal.html', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for content to load
    await page.waitForSelector('.footer-panel-title', { timeout: 30000 });
    
    // Wait a bit to ensure all CSS is applied
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Take a screenshot
    console.log(`📸 Taking screenshot: ${screenshotPath}`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    
    console.log('✅ Screenshot captured successfully!');
    console.log(`📂 Saved to: ${screenshotPath}`);
  } catch (error) {
    console.error('❌ Error capturing screenshot:', error);
  } finally {
    await browser.close();
  }
}

captureRetroTerminal();