const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'document-centric-tests');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testDocumentCentricView() {
  console.log('Starting Document-Centric View test with Puppeteer...');
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();
    console.log('Opening document view page...');
    await page.goto('http://localhost:3000/document-view?id=1', { timeout: 30000 });
    
    // Take a screenshot of initial state
    console.log('Taking screenshot of initial state...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'document-view-initial.png'),
      fullPage: true 
    });

    // Test making mode toggle
    console.log('Testing Making Mode toggle...');
    const makingModeButton = await page.waitForSelector('button:has-text("Making Mode")');
    if (makingModeButton) {
      await makingModeButton.click();
      await page.waitForTimeout(1000);
      
      // Take screenshot of making mode
      console.log('Taking screenshot of Making Mode...');
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'document-view-making-mode.png'),
        fullPage: true 
      });
      
      // Test step navigation
      console.log('Testing step navigation...');
      const startMakingButton = await page.waitForSelector('button:has-text("Start Making")');
      if (startMakingButton) {
        await startMakingButton.click();
        await page.waitForTimeout(1000);
        
        // Take screenshot of step view
        console.log('Taking screenshot of Step View...');
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'document-view-step-navigation.png'),
          fullPage: true 
        });
        
        // Test next step button
        const nextStepButton = await page.waitForSelector('button.p-2.rounded svg[data-lucide="chevron-right"]');
        if (nextStepButton) {
          await nextStepButton.click();
          await page.waitForTimeout(1000);
          
          // Take screenshot of next step
          console.log('Taking screenshot of Next Step...');
          await page.screenshot({ 
            path: path.join(screenshotsDir, 'document-view-next-step.png'),
            fullPage: true 
          });
        }
      }
      
      // Exit making mode
      console.log('Exiting Making Mode...');
      const exitMakingButton = await page.waitForSelector('button:has-text("Exit Making Mode")');
      if (exitMakingButton) {
        await exitMakingButton.click();
        await page.waitForTimeout(1000);
        
        // Take screenshot after exiting making mode
        console.log('Taking screenshot after exiting Making Mode...');
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'document-view-after-exit.png'), 
          fullPage: true 
        });
      }
    }
    
    console.log('Test completed successfully!');
    console.log(`Screenshots saved to: ${screenshotsDir}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testDocumentCentricView();