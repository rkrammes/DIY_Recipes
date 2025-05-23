// Keyboard navigation test script for the three-column layout
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.resolve(__dirname, 'keyboard-nav-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Helper to take a screenshot
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(screenshotsDir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

async function run() {
  console.log('Starting keyboard navigation test...');
  const browser = await puppeteer.launch({
    headless: false, // Run in non-headless mode to see what's happening
    defaultViewport: { width: 1280, height: 800 }
  });
  
  try {
    const page = await browser.newPage();

    // Navigate to the application
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.bg-surface-1'); // Wait for interface to load
    await takeScreenshot(page, '01-initial-page');
    
    // Helper function to press a key multiple times
    async function pressKeyTimes(key, times) {
      for (let i = 0; i < times; i++) {
        await page.keyboard.press(key);
        await page.waitForTimeout(500); // Small delay to see the changes
      }
    }
    
    // Log the state of keyboard navigation
    page.on('console', msg => {
      if (msg.text().includes('navState') || 
          msg.text().includes('document') || 
          msg.text().includes('keyboard')) {
        console.log('BROWSER LOG:', msg.text());
      }
    });

    // Add debug logging to the page
    await page.evaluate(() => {
      // Override the setNavState function to log state changes
      const originalSetState = React.useState;
      window._navDebug = { state: null, updates: [] };
      
      // Add a keyboard event listener to log key presses
      document.addEventListener('keydown', (e) => {
        console.log(`Key pressed: ${e.key}`);
      });
      
      // Log when moving between columns
      const logNavStateChange = (prev, next) => {
        if (prev && next && prev.column !== next.column) {
          console.log(`Navigation column changed: ${prev.column} -> ${next.column}`);
        }
      };
    });
    
    // Add explicit console logging to see what's happening
    await page.evaluate(() => {
      console.log('Testing keyboard navigation. Current document structure:');
      console.log('Columns present:', 
        document.querySelectorAll('.w-48').length,      // First column
        document.querySelectorAll('.w-64').length,      // Second column
        document.querySelectorAll('.flex-1.overflow-hidden').length  // Third column
      );
      console.log('Document area elements:', 
        document.querySelectorAll('.document-centric-recipe, .document-content, .flex-1.overflow-hidden > div').length
      );
      console.log('Focusable elements in document:', 
        document.querySelectorAll('.flex-1.overflow-hidden button, .flex-1.overflow-hidden [href], .flex-1.overflow-hidden input').length
      );
    });
    
    // Step 1: Press Tab to activate keyboard navigation
    console.log('Activating keyboard navigation...');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1000);
    await takeScreenshot(page, '02-after-tab');
    
    // Check if keyboard navigation is active
    await page.evaluate(() => {
      const navIndicator = document.querySelector('.text-accent.animate-pulse');
      console.log('Keyboard navigation active:', navIndicator ? true : false);
      if (navIndicator) {
        console.log('Navigation text:', navIndicator.textContent);
      }
    });

    // Step 2: Navigate in the first column with arrow keys
    console.log('Navigating in first column...');
    await pressKeyTimes('ArrowDown', 2);
    await takeScreenshot(page, '03-first-column-navigation');
    
    // Step 3: Move to the second column
    console.log('Moving to second column...');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);
    await takeScreenshot(page, '04-second-column');
    
    // Check if we're in the second column
    await page.evaluate(() => {
      const navIndicator = document.querySelector('.text-accent.animate-pulse');
      console.log('Navigation position:', navIndicator ? navIndicator.textContent : 'Unknown');
    });
    
    // Step 4: Navigate in the second column
    console.log('Navigating in second column...');
    await pressKeyTimes('ArrowDown', 2);
    await takeScreenshot(page, '05-second-column-navigation');
    
    // Select an item in the second column
    console.log('Selecting item in second column...');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await takeScreenshot(page, '06-item-selected');

    // Log the document structure
    await page.evaluate(() => {
      console.log('Document area after selection:');
      console.log('Document area elements:', 
        document.querySelectorAll('.document-centric-recipe, .document-content, .flex-1.overflow-hidden > div').length
      );
      console.log('Focusable elements in document:', 
        document.querySelectorAll('.flex-1.overflow-hidden button, .flex-1.overflow-hidden [href], .flex-1.overflow-hidden input').length
      );
      
      // List all focusable elements for debugging
      const focusables = document.querySelectorAll(
        '.flex-1.overflow-hidden button, .flex-1.overflow-hidden [href], .flex-1.overflow-hidden input, .flex-1.overflow-hidden [tabindex]:not([tabindex="-1"])'
      );
      console.log('Focusable elements list:');
      focusables.forEach((el, i) => {
        console.log(`Element ${i}:`, el.tagName, el.textContent?.trim() || '[no text]');
      });
    });
    
    // Step 5: Try moving to the third column
    console.log('Attempting to move to third column...');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);
    await takeScreenshot(page, '07-third-column-attempt');
    
    // Check navigation state again
    await page.evaluate(() => {
      const navIndicator = document.querySelector('.text-accent.animate-pulse');
      console.log('Navigation position after third column attempt:', 
        navIndicator ? navIndicator.textContent : 'Unknown'
      );
    });
    
    // Try Tab key as well
    console.log('Trying Tab key to move to third column...');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1000);
    await takeScreenshot(page, '08-tab-attempt');
    
    // Final step: Check what happened
    await page.evaluate(() => {
      const navIndicator = document.querySelector('.text-accent.animate-pulse');
      console.log('Final navigation state:', 
        navIndicator ? navIndicator.textContent : 'Unknown'
      );
      
      // Check document focus
      const activeElement = document.activeElement;
      console.log('Active element:', 
        activeElement ? 
        `${activeElement.tagName} - ${activeElement.className} - ${activeElement.textContent?.trim() || '[no text]'}` : 
        'None'
      );
    });
    
    console.log('Test completed.');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
}

run().catch(console.error);