/**
 * Simple Puppeteer test for the feature toggle component
 * This test accesses the test page directly rather than navigating through the app
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create directory for test artifacts
const artifactsDir = path.join(__dirname, 'test-artifacts', 'feature-toggle-direct');
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

// Helper for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Screenshot helper
async function saveScreenshot(page, name) {
  const timestamp = Date.now();
  const screenshotPath = path.join(artifactsDir, `${name}-${timestamp}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

// Main test function
async function testFeatureToggle() {
  console.log('Starting direct feature toggle component test');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Go directly to the feature toggle test page
    console.log('Navigating to feature toggle test page');
    await page.goto('http://localhost:3000/feature-toggle-test');
    await delay(3000);
    await saveScreenshot(page, '01-test-page');
    
    // Check if the feature toggle bar is present
    const toggleBar = await page.evaluate(() => {
      const bar = document.querySelector('.feature-toggle-bar');
      if (bar) {
        return {
          found: true,
          text: bar.innerText
        };
      }
      return { found: false };
    });
    
    console.log('Feature toggle bar detected:', toggleBar);
    
    if (toggleBar.found) {
      // Click the Features button to open the settings
      console.log('Clicking Features button');
      const featuresClicked = await page.evaluate(() => {
        const button = document.querySelector('.feature-toggle-bar button');
        if (button) {
          button.click();
          return true;
        }
        return false;
      });
      
      if (featuresClicked) {
        await delay(1000);
        await saveScreenshot(page, '02-features-dropdown');
        
        // Toggle the versioning checkbox
        console.log('Toggling versioning checkbox');
        const toggled = await page.evaluate(() => {
          const checkbox = Array.from(document.querySelectorAll('input[type="checkbox"]'))
            .find(check => {
              const label = check.closest('label');
              return label && label.innerText.includes('Recipe Versioning');
            });
          
          if (checkbox) {
            const initialState = checkbox.checked;
            checkbox.click();
            return {
              success: true,
              initialState,
              newState: checkbox.checked
            };
          }
          
          return { success: false };
        });
        
        console.log('Toggle result:', toggled);
        
        if (toggled.success) {
          await delay(1000);
          await saveScreenshot(page, '03-after-toggle');
          
          // Check if the UI updated to reflect the enabled state
          const uiUpdated = await page.evaluate(() => {
            // Look for the enabled version UI
            const enabledUI = document.querySelector('.bg-blue-50');
            return {
              versionsEnabled: !!enabledUI,
              enabledText: enabledUI ? enabledUI.innerText : null
            };
          });
          
          console.log('UI state after toggle:', uiUpdated);
          
          // Toggle back to the original state
          console.log('Toggling back to original state');
          await page.evaluate(() => {
            const checkbox = Array.from(document.querySelectorAll('input[type="checkbox"]'))
              .find(check => {
                const label = check.closest('label');
                return label && label.innerText.includes('Recipe Versioning');
              });
            
            if (checkbox) {
              checkbox.click();
            }
          });
          
          await delay(1000);
          await saveScreenshot(page, '04-toggle-back');
        }
      }
    }
    
    console.log('Test completed');
    
  } catch (error) {
    console.error('Test error:', error);
    await saveScreenshot(page, 'error');
  } finally {
    await browser.close();
  }
}

// Run the test
testFeatureToggle().catch(console.error);