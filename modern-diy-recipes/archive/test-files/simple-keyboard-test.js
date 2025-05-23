// Simple keyboard navigation test script
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.resolve(__dirname, 'keyboard-test');
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

// Helper to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Starting simple keyboard navigation test...');
  const browser = await puppeteer.launch({
    headless: false, // Run in non-headless mode to see what's happening
    defaultViewport: { width: 1280, height: 800 }
  });
  
  try {
    const page = await browser.newPage();

    // Navigate to the application
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.bg-surface-1');
    await takeScreenshot(page, '01-initial');
    
    // Add debug logging to the page
    await page.evaluate(() => {
      // Add console logging for keyboard events
      document.addEventListener('keydown', (e) => {
        console.log(`Key pressed: ${e.key} (code: ${e.code})`);
      });
      
      // Log initial state
      console.log('Columns present:', 
        document.querySelectorAll('.w-48').length,      // First column
        document.querySelectorAll('.w-64').length,      // Second column
        document.querySelectorAll('.flex-1.overflow-hidden').length  // Third column
      );
      
      // Check for document-centric-recipe element
      console.log('Document elements:', 
        document.querySelectorAll('.document-centric-recipe').length
      );
      
      // Check for focusable elements in third column
      const thirdColumn = document.querySelector('.flex-1.overflow-hidden');
      if (thirdColumn) {
        const focusables = thirdColumn.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        console.log('Focusable elements in third column:', focusables.length);
      }
    });
    
    // Test keyboard navigation
    console.log('Testing keyboard navigation...');
    
    // Click on a category first to ensure we're in the right state
    await page.click('.w-48 [data-category="formulations"]');
    await delay(500);
    await takeScreenshot(page, '02-category-clicked');
    
    // First navigate to second column using keyboard
    await page.keyboard.press('ArrowRight');
    await delay(500);
    await takeScreenshot(page, '03-second-column');
    
    // Select an item in the second column
    await page.keyboard.press('Enter');
    await delay(1000);
    await takeScreenshot(page, '04-item-selected');
    
    // Check if an item was selected and the document is showing
    await page.evaluate(() => {
      // Check for document content
      const docContent = document.querySelector('.document-centric-recipe');
      console.log('Document content visible:', docContent ? 'Yes' : 'No');
      
      // If document is visible, count focusable elements again
      if (docContent) {
        const focusables = docContent.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        console.log('Focusable elements count:', focusables.length);
        if (focusables.length > 0) {
          Array.from(focusables).slice(0, 5).forEach((el, i) => {
            console.log(`Element ${i}:`, el.tagName, el.textContent?.trim() || '[no text]');
          });
        }
      }
    });
    
    // Try to navigate to the third column
    console.log('Attempting navigation to third column...');
    await page.keyboard.press('ArrowRight');
    await delay(1000);
    await takeScreenshot(page, '05-third-column-attempt');
    
    // Check if third column has focus by checking the navState indicator
    const navIndicator = await page.$eval('.text-accent.animate-pulse', 
      el => el ? el.textContent : 'Not found');
    console.log('Navigation indicator:', navIndicator);
    
    // Try tab key as well
    console.log('Trying Tab key to move to third column...');
    await page.keyboard.press('Tab');
    await delay(1000);
    await takeScreenshot(page, '06-tab-attempt');
    
    // Inspect the document structure in more detail
    await page.evaluate(() => {
      console.log('\nDETAILED LAYOUT ANALYSIS:');
      
      // Check if there are any document elements present
      const docElements = document.querySelectorAll('.document-centric-recipe, .flex-1.overflow-hidden');
      console.log('Document container elements:', docElements.length);
      
      // Check active element
      const activeElement = document.activeElement;
      console.log('Active element:', 
        activeElement.tagName,
        activeElement.className ? `.${activeElement.className.replace(/\\s+/g, '.')}` : '',
        activeElement.id ? `#${activeElement.id}` : '',
        activeElement.textContent?.trim()?.substring(0, 30) || '[no text]'
      );
      
      // Check for possible keyboard event handlers
      console.log('\nChecking for keyboard event listeners...');
      const allElements = document.querySelectorAll('*');
      let elementsWithKeyHandlers = 0;
      for (const el of allElements) {
        // This is a rough approximation since we can't directly access event listeners
        const hasOnKeyDown = el.hasAttribute('onkeydown');
        const hasOnKeyPress = el.hasAttribute('onkeypress');
        const hasOnKeyUp = el.hasAttribute('onkeyup');
        if (hasOnKeyDown || hasOnKeyPress || hasOnKeyUp) {
          elementsWithKeyHandlers++;
        }
      }
      console.log('Elements with inline key handlers:', elementsWithKeyHandlers);
      
      // Check if we can find the document content
      const thirdColumn = document.querySelector('.flex-1.overflow-hidden');
      if (thirdColumn) {
        console.log('Third column children:', thirdColumn.children.length);
        Array.from(thirdColumn.children).forEach((child, i) => {
          console.log(`  Child ${i}:`, 
            child.tagName, 
            child.className ? `.${child.className.replace(/\\s+/g, '.')}` : '',
            child.childElementCount > 0 ? `(${child.childElementCount} children)` : ''
          );
        });
      }
    });
    
    // Wait for manual inspection
    console.log('Test completed. Browser will remain open for 30 seconds...');
    await delay(30000);
    
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
}

run().catch(console.error);