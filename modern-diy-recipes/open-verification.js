const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  // Create a screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, 'verification-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 }
  });
  
  try {
    // Go to our verification document
    const page = await browser.newPage();
    await page.goto('http://localhost:8080/static-test-document.html', { waitUntil: 'networkidle2' });
    console.log('Opened verification document');
    
    // Take a screenshot
    const screenshotPath = path.join(screenshotsDir, `verification-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
    // Keep the browser open for 120 seconds to allow viewing
    console.log('Browser will remain open for 2 minutes for you to view the verification document');
    await new Promise(r => setTimeout(r, 120000));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();