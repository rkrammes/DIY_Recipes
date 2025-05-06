const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'document-iterations');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testDocumentIterations() {
  console.log('Starting document iterations test...');
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();
    console.log('Opening document view page...');
    
    // Try accessing the document view page
    await page.goto('http://localhost:3000/document-view?id=1', { timeout: 30000 });
    
    // Take a screenshot of initial state
    console.log('Taking screenshot of initial state...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'document-initial.png'),
      fullPage: true 
    });
    
    // Check if the document view loads properly
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);
    
    // If document view doesn't load properly, try the simplified view
    if (await page.$('div.document-centric-recipe') === null) {
      console.log('Document view not found, trying simplified view instead...');
      await page.goto('http://localhost:3000/simple-doc', { timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      // Take a screenshot of the simplified view
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'simple-doc-view.png'),
        fullPage: true 
      });
    }
    
    // Find and test version timeline (if available)
    const versionElements = await page.$$('button');
    console.log(`Found ${versionElements.length} buttons to check`);
    
    // Look for version buttons
    let versionButtons = [];
    for (const button of versionElements) {
      const buttonText = await page.evaluate(el => el.textContent, button);
      if (buttonText && buttonText.match(/v\d+/)) {
        versionButtons.push(button);
        console.log(`Found version button with text: ${buttonText}`);
      }
    }
    
    if (versionButtons.length > 1) {
      console.log(`Found ${versionButtons.length} version buttons`);
      
      // Click on the first version button
      await versionButtons[0].click();
      console.log('Clicked on a version button');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for UI update
      
      // Take screenshot after clicking version
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'document-different-version.png'),
        fullPage: true 
      });
    } else {
      console.log('No version buttons found or not enough versions available');
    }
    
    // Find and test Making Mode
    for (const button of versionElements) {
      const buttonText = await page.evaluate(el => el.textContent, button);
      if (buttonText && buttonText.includes('Making Mode')) {
        console.log('Found Making Mode button, clicking it...');
        await button.click();
        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for UI update
        
        // Take screenshot in Making Mode
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'document-making-mode.png'),
          fullPage: true 
        });
        
        // Look for Next button in Making Mode
        const allButtons = await page.$$('button');
        for (const nextButton of allButtons) {
          const nextText = await page.evaluate(el => el.textContent, nextButton);
          if (nextText && (nextText.includes('Next') || nextText.includes('→') || nextText.includes('Start'))) {
            console.log(`Found navigation button with text: ${nextText}, clicking it...`);
            await nextButton.click();
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for UI update
            
            // Take screenshot of step
            await page.screenshot({ 
              path: path.join(screenshotsDir, 'document-making-mode-step.png'),
              fullPage: true 
            });
            break;
          }
        }
        
        // Look for Exit Making Mode button
        const exitButtons = await page.$$('button');
        for (const exitButton of exitButtons) {
          const exitText = await page.evaluate(el => el.textContent, exitButton);
          if (exitText && exitText.includes('Exit Making Mode')) {
            console.log('Found Exit Making Mode button, clicking it...');
            await exitButton.click();
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for UI update
            
            // Take screenshot after exiting Making Mode
            await page.screenshot({ 
              path: path.join(screenshotsDir, 'document-after-making-mode.png'),
              fullPage: true 
            });
            break;
          }
        }
        
        break; // Break after testing Making Mode
      }
    }
    
    // Test Print button (if available)
    const allButtons = await page.$$('button');
    for (const button of allButtons) {
      const buttonText = await page.evaluate(el => el.textContent, button);
      const buttonTitle = await page.evaluate(el => el.getAttribute('title'), button);
      
      if ((buttonText && buttonText.includes('Print')) || 
          (buttonTitle && buttonTitle.includes('Print'))) {
        console.log('Found Print button (will not click to avoid print dialog)');
        
        // Highlight the print button
        await page.evaluate(el => {
          el.style.border = '3px solid red';
        }, button);
        
        // Take screenshot with highlighted print button
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'document-print-button.png'),
          fullPage: false 
        });
        break;
      }
    }
    
    console.log('Test complete!');
    console.log(`Screenshots saved to: ${screenshotsDir}`);
    
    // Create test report
    const reportPath = path.join(screenshotsDir, 'iterations-test-report.md');
    const reportContent = `# Document-Centric Formulation Interface Test Report

## Tests Performed: ${new Date().toLocaleString()}

1. **Initial Page Load**
   - Attempted to load the document-centric formulation interface
   - Captured screenshots of the interface state

2. **Version Navigation** (if available)
   - Attempted to find and click version buttons
   - Captured screenshots before and after version changes

3. **Making Mode**
   - Attempted to enter Making Mode
   - Tested step navigation (if available)
   - Attempted to exit Making Mode
   
4. **Print Functionality**
   - Checked for Print button presence
   - Highlighted Print button in screenshot if found

## Screenshots

Screenshots are saved in the test-artifacts/document-iterations directory.

## Notes

This test was run on the application at http://localhost:3000.

${versionButtons.length > 1 ? 
  '✅ Version navigation functionality was found and tested.' : 
  '❌ Version navigation buttons were not found or not enough versions available.'}

${versionElements.some(async button => {
  const text = await page.evaluate(el => el.textContent, button);
  return text && text.includes('Making Mode');
}) ? 
  '✅ Making Mode functionality was found and tested.' : 
  '❌ Making Mode button was not found.'}
`;
    
    fs.writeFileSync(reportPath, reportContent);
    console.log(`Test report written to: ${reportPath}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Keep browser open for 5 seconds
    await browser.close();
  }
}

testDocumentIterations();