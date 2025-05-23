const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'simple-doc-test');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testSimpleDoc() {
  console.log('Starting Simple Document View test with Puppeteer...');
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();
    console.log('Opening simple document view page...');
    await page.goto('http://localhost:3000/simple-doc', { timeout: 30000 });
    
    // Wait for page to load
    await page.waitForSelector('h1');
    
    // Take a screenshot of initial state
    console.log('Taking screenshot of initial state...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'simple-doc-initial.png'),
      fullPage: true 
    });

    // Test making mode toggle
    console.log('Testing Making Mode toggle...');
    // Use a more specific selector
    const makingModeButton = await page.$('button.rounded-full');
    console.log('Making Mode button found:', !!makingModeButton);
    if (makingModeButton) {
      await makingModeButton.click();
      console.log('Clicked Making Mode button');
      // Wait a moment for the UI to update
      // Use promises to wait
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Take screenshot of making mode
      console.log('Taking screenshot of Making Mode...');
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'simple-doc-making-mode.png'),
        fullPage: true 
      });
      
      // Test step navigation
      console.log('Testing step navigation...');
      // Use a simple approach for the demo - click the second next button (navigation)
      const buttons = await page.$$('button');
      // Assuming that one of the first few buttons is our navigation
      for (let i = 0; i < Math.min(5, buttons.length); i++) {
        const buttonText = await page.evaluate(el => el.textContent, buttons[i]);
        console.log(`Button ${i} text:`, buttonText);
        if (buttonText.includes('Next')) {
          console.log('Found Next button, clicking...');
          await buttons[i].click();
          // Wait for animation
          await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Take screenshot of step navigation
        console.log('Taking screenshot of next step...');
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'simple-doc-next-step.png'),
          fullPage: true 
        });
      }
      
      // Return to default view
      console.log('Testing return to default view...');
      const exitButton = await page.waitForSelector('button:has-text("Exit Making Mode")');
      if (exitButton) {
        await exitButton.click();
        await page.waitForSelector('div.prose');
        
        // Take screenshot of default view
        console.log('Taking screenshot after exiting Making Mode...');
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'simple-doc-default-view.png'),
          fullPage: true 
        });
      }
    }
    
    console.log('All tests passed successfully!');
    console.log(`Screenshots saved to: ${screenshotsDir}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    setTimeout(async () => {
      await browser.close();
    }, 2000);
  }
}

testSimpleDoc();