const puppeteer = require('puppeteer');
const path = require('path');

async function captureLayout() {
  const browser = await puppeteer.launch({ headless: true });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport for consistent screenshot
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait a bit for any animations or dynamic content
    await page.waitForTimeout(2000);
    
    // Take screenshot
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(__dirname, `layout-issue-${timestamp}.png`);
    
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
    // Also capture the HTML structure for debugging
    const htmlContent = await page.content();
    const htmlPath = path.join(__dirname, `layout-issue-${timestamp}.html`);
    require('fs').writeFileSync(htmlPath, htmlContent);
    console.log(`HTML saved to: ${htmlPath}`);
    
  } catch (error) {
    console.error('Error capturing layout:', error);
  } finally {
    await browser.close();
  }
}

captureLayout();