const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'ui-verification');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function captureUIState() {
  console.log('Capturing current UI state...');
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();
    
    // Capture homepage
    console.log('Capturing homepage...');
    await page.goto('http://localhost:3000', { timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-homepage.png'),
      fullPage: true 
    });
    
    // Capture simple-doc page
    console.log('Capturing simple-doc page...');
    await page.goto('http://localhost:3000/simple-doc', { timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-simple-doc.png'),
      fullPage: true 
    });
    
    // Capture document-test page
    console.log('Capturing document-test page...');
    await page.goto('http://localhost:3000/document-test', { timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-document-test.png'),
      fullPage: true 
    });
    
    // Capture document-view page
    console.log('Capturing document-view page...');
    await page.goto('http://localhost:3000/document-view?id=1', { timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ 
      path: path.join(screenshotsDir, '04-document-view.png'),
      fullPage: true 
    });
    
    console.log('UI state capture complete!');
    console.log(`Screenshots saved to: ${screenshotsDir}`);
    
  } catch (error) {
    console.error('Failed to capture UI state:', error);
  } finally {
    await browser.close();
  }
}

captureUIState();