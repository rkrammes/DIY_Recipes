const puppeteer = require('puppeteer');
const path = require('path');

async function captureScreenshot() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Capture homepage screenshot
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Waiting for content to load...');
    await page.waitForSelector('.content-grid', { timeout: 10000 });
    
    // Wait a bit more for everything to render properly
    await page.waitForTimeout(2000);
    
    console.log('Capturing screenshot...');
    await page.screenshot({ 
      path: path.join(__dirname, 'fixed-layout.png'),
      fullPage: true 
    });
    
    console.log('Screenshot captured successfully!');
  } catch (error) {
    console.error('Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshot();