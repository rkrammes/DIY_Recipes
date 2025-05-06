const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'simple-test');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testSimple() {
  console.log('Starting simple test...');
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();
    console.log('Opening simple-doc page...');
    await page.goto('http://localhost:3000/simple-doc', { timeout: 30000 });
    
    // Take a screenshot
    console.log('Taking screenshot of initial state...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'simple-doc-1.png'),
      fullPage: true 
    });
    
    // Click the Making Mode button if possible
    try {
      console.log('Looking for Making Mode button...');
      const buttons = await page.$$('button');
      let makingModeButton = null;
      
      for (let button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        console.log(`Found button with text: "${text}"`);
        if (text.includes('Making Mode')) {
          makingModeButton = button;
          break;
        }
      }
      
      if (makingModeButton) {
        console.log('Clicking Making Mode button...');
        await makingModeButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        // Take another screenshot
        console.log('Taking screenshot of Making Mode...');
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'simple-doc-2.png'),
          fullPage: true 
        });
      } else {
        console.log('Making Mode button not found');
      }
    } catch (err) {
      console.error('Error during Making Mode test:', err);
    }
    
    console.log('Test complete!');
    console.log(`Screenshots saved to: ${screenshotsDir}`);
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Keep browser open for 5 seconds
    await browser.close();
  }
}

testSimple();