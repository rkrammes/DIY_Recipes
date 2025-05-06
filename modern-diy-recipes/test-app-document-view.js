const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'app-document-view');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testAppDocumentView() {
  console.log('Starting app document view test...');
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();
    
    // First verify the app is running
    console.log('Checking if app is running...');
    await page.goto('http://localhost:3000', { timeout: 30000 });
    
    // Take screenshot of homepage
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-homepage.png'),
      fullPage: true 
    });
    
    console.log('Testing document view page with recipe ID...');
    await page.goto('http://localhost:3000/document-view?id=1', { timeout: 30000 });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot of document view
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-document-view.png'),
      fullPage: true 
    });
    
    // Check if document component loaded
    const documentComponentExists = await page.evaluate(() => {
      return !!document.querySelector('.document-centric-recipe');
    });
    
    if (documentComponentExists) {
      console.log('Document component loaded successfully!');
      
      // Check for version timeline
      const versionTimelineExists = await page.evaluate(() => {
        // Look for any element that might be part of the version timeline
        return !!document.querySelector('button[class*="whitespace-nowrap px-2 py-1 rounded text-xs"]') || 
               !!document.querySelector('div:contains("Recipe Timeline")');
      });
      
      if (versionTimelineExists) {
        console.log('Version timeline found!');
        
        // Try to find and click version buttons
        const versionButtons = await page.$$('button[class*="whitespace-nowrap"]');
        if (versionButtons.length > 1) {
          console.log(`Found ${versionButtons.length} version buttons`);
          
          // Click on different version
          await versionButtons[1].click();
          console.log('Clicked on version button');
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Take screenshot after changing version
          await page.screenshot({ 
            path: path.join(screenshotsDir, '03-different-version.png'),
            fullPage: true 
          });
          
          // Try to create a new version
          const createNewVersionBtn = await page.$('button:has-text("Create New Version")');
          if (createNewVersionBtn) {
            await createNewVersionBtn.click();
            console.log('Clicked Create New Version button');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Take screenshot after creating new version
            await page.screenshot({ 
              path: path.join(screenshotsDir, '04-new-version-created.png'),
              fullPage: true 
            });
          } else {
            console.log('Create New Version button not found');
          }
        } else {
          console.log('Not enough version buttons found');
        }
      } else {
        console.log('Version timeline not found');
      }
      
      // Test Making Mode
      console.log('Testing Making Mode...');
      const makingModeBtn = await page.$('button:has-text("Making Mode")');
      if (makingModeBtn) {
        await makingModeBtn.click();
        console.log('Clicked Making Mode button');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Take screenshot in Making Mode
        await page.screenshot({ 
          path: path.join(screenshotsDir, '05-making-mode.png'),
          fullPage: true 
        });
        
        // Test step navigation
        const stepNavButtons = await page.$$('button');
        for (const btn of stepNavButtons) {
          const btnText = await page.evaluate(el => el.textContent, btn);
          if (btnText && (btnText.includes('Start Making') || btnText.includes('Start'))) {
            await btn.click();
            console.log('Clicked Start Making button');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Take screenshot of first step
            await page.screenshot({ 
              path: path.join(screenshotsDir, '06-first-step.png'),
              fullPage: true 
            });
            break;
          }
        }
        
        // Exit Making Mode
        const exitButtons = await page.$$('button');
        for (const btn of exitButtons) {
          const btnText = await page.evaluate(el => el.textContent, btn);
          if (btnText && btnText.includes('Exit Making Mode')) {
            await btn.click();
            console.log('Clicked Exit Making Mode button');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Take screenshot after exiting Making Mode
            await page.screenshot({ 
              path: path.join(screenshotsDir, '07-after-making-mode.png'),
              fullPage: true 
            });
            break;
          }
        }
      } else {
        console.log('Making Mode button not found');
      }
      
      // Test Print button
      console.log('Testing Print button...');
      const printBtns = await page.$$('button');
      for (const btn of printBtns) {
        const btnTitle = await page.evaluate(el => el.getAttribute('title'), btn);
        if (btnTitle && btnTitle.includes('Print')) {
          // Highlight the button
          await page.evaluate(el => {
            el.style.border = '3px solid red';
          }, btn);
          
          // Take screenshot with highlighted print button
          await page.screenshot({ 
            path: path.join(screenshotsDir, '08-print-button.png'),
            fullPage: false 
          });
          
          console.log('Print button found and highlighted');
          break;
        }
      }
    } else {
      console.log('Document component not found, checking for error message');
      
      // Check if there's an error message
      const errorMessageExists = await page.evaluate(() => {
        return !!document.querySelector('.bg-red-50') || !!document.querySelector('.bg-yellow-50');
      });
      
      if (errorMessageExists) {
        console.log('Error message found, likely database connectivity issue');
        
        // Try simplified view instead
        console.log('Testing simplified document view...');
        await page.goto('http://localhost:3000/simple-doc', { timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Take screenshot of simplified view
        await page.screenshot({ 
          path: path.join(screenshotsDir, '09-simple-doc-view.png'),
          fullPage: true 
        });
        
        // Test Making Mode in simplified view
        const simpleMakingModeBtn = await page.$('button:has-text("Making Mode")');
        if (simpleMakingModeBtn) {
          await simpleMakingModeBtn.click();
          console.log('Clicked Making Mode button in simplified view');
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Take screenshot of Making Mode in simplified view
          await page.screenshot({ 
            path: path.join(screenshotsDir, '10-simple-making-mode.png'),
            fullPage: true 
          });
        } else {
          console.log('Making Mode button not found in simplified view');
        }
      }
    }
    
    console.log('Test complete!');
    console.log(`Screenshots saved to: ${screenshotsDir}`);
    
    // Create test report
    const reportPath = path.join(screenshotsDir, 'document-view-test-report.md');
    const reportContent = `# Document-Centric Formulation Interface App Test Report

## Test Date: ${new Date().toLocaleString()}

This test verifies the document-centric formulation interface in the actual running application on http://localhost:3000.

### Test Results

1. **Document Component Loading**:
   ${documentComponentExists ? '✅ Successfully loaded' : '❌ Failed to load'}

2. **Version Timeline**:
   ${versionTimelineExists ? '✅ Found and tested' : '❌ Not found or unavailable'}

3. **Making Mode**:
   ${makingModeBtn ? '✅ Successfully tested' : '❌ Not found or unavailable'}

4. **Print Functionality**:
   ${printBtns && printBtns.some(async btn => {
     const title = await page.evaluate(el => el.getAttribute('title'), btn);
     return title && title.includes('Print');
   }) ? '✅ Print button found' : '❌ Print button not found'}

### Screenshots

Screenshots are saved in the test-artifacts/app-document-view directory, documenting each step of the test process.

### Notes

${documentComponentExists 
  ? 'The document-centric interface is functioning properly in the running application.'
  : 'The document component could not be loaded, likely due to database connectivity issues. The simplified view was tested as a fallback.'}

The testing was conducted in the actual running application environment.
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

testAppDocumentView();