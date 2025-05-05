const puppeteer = require('puppeteer');
const path = require('path');

async function captureScreenshots() {
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
    console.log('Capturing homepage screenshot...');
    await page.screenshot({ 
      path: path.join(__dirname, 'test-artifacts', 'homepage-layout.png'),
      fullPage: true 
    });
    
    // Capture Formula Database page screenshot
    console.log('Navigating to Formula Database...');
    await page.goto('http://localhost:3000/formula-database', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Capturing Formula Database screenshot...');
    await page.screenshot({ 
      path: path.join(__dirname, 'test-artifacts', 'formula-database-layout.png'),
      fullPage: true 
    });
    
    console.log('Screenshots captured successfully!');
  } catch (error) {
    console.error('Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots();