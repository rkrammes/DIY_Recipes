const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'print-test');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testPrintFunctionality() {
  console.log('Starting print functionality test...');
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
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'document-view-initial.png'),
      fullPage: true 
    });
    
    // Look for the print button
    try {
      console.log('Looking for Print button...');
      const buttons = await page.$$('button');
      let printButton = null;
      
      for (let button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        const title = await page.evaluate(el => el.getAttribute('title'), button);
        
        if ((text && text.includes('Print')) || (title && title.includes('Print'))) {
          printButton = button;
          console.log('Found Print button!');
          break;
        }
      }
      
      if (printButton) {
        // Don't actually click the print button as it would open the browser's print dialog
        // Instead, just verify it exists
        console.log('Print button found and ready to be used');
        
        // Capture a screenshot highlighting the print button
        await page.evaluate(() => {
          // Add a temporary highlight to the print button
          const buttons = document.querySelectorAll('button');
          buttons.forEach(button => {
            if (button.title && button.title.includes('Print')) {
              button.style.boxShadow = '0 0 0 5px red';
            }
          });
        });
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Short delay
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'print-button-highlighted.png'),
          fullPage: false 
        });
        
        // Try to click the preview button which should open in a new tab
        console.log('Looking for Preview button...');
        const previewButton = await page.evaluateHandle(() => {
          const buttons = document.querySelectorAll('button');
          for (let button of buttons) {
            if (button.textContent.includes('Preview')) {
              return button;
            }
          }
          return null;
        });
        
        if (previewButton) {
          console.log('Found Preview button, clicking it...');
          
          // Get the page target before clicking to track new tabs
          const pageTarget = page.target();
          const browser = pageTarget.browser();
          
          // Click the preview button (this should open a new tab)
          await previewButton.click();
          
          // Wait for the new tab to open
          console.log('Waiting for new tab to open...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Get all browser targets (tabs)
          const targets = await browser.targets();
          const newTarget = targets.find(target => 
            target.type() === 'page' && target !== pageTarget
          );
          
          if (newTarget) {
            console.log('New tab opened, capturing screenshot...');
            // Connect to the new tab
            const newPage = await newTarget.page();
            
            // Wait for content to load
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Take a screenshot of the print preview
            await newPage.screenshot({ 
              path: path.join(screenshotsDir, 'print-preview.png'),
              fullPage: true 
            });
            
            console.log('Print preview page captured');
            
            // Close the preview tab
            await newPage.close();
          } else {
            console.log('No new tab was detected. Preview might not have opened.');
          }
        } else {
          console.log('Preview button not found');
        }
      } else {
        console.log('Print button not found');
      }
    } catch (err) {
      console.error('Error during print test:', err);
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

testPrintFunctionality();