// test-settings-page.js - Simple script to check Settings page
const puppeteer = require('puppeteer');

(async () => {
  // Launch browser in non-headless mode to see what's happening
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1280,900']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:3000/settings...');
    await page.goto('http://localhost:3000/settings', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait a moment for any dynamic content to load
    await page.waitForTimeout(2000);

    // Click on the System tab to view our SystemInfo component
    console.log('Clicking on System tab...');
    const systemTab = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const systemButton = buttons.find(b => b.textContent?.includes('System'));
      if (systemButton) {
        systemButton.click();
        return true;
      }
      return false;
    });

    if (systemTab) {
      console.log('System tab clicked!');
      await page.waitForTimeout(1000); // Wait for tab content to load
    } else {
      console.log('System tab not found!');
    }
    
    // Take a screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ 
      path: 'test-artifacts/settings-test/settings-page-test.png', 
      fullPage: true 
    });
    
    // Check visible text on the page
    const pageText = await page.evaluate(() => document.body.innerText);
    console.log('Page contains "Settings":', pageText.includes('Settings'));
    console.log('Page contains "System Information":', pageText.includes('System Information'));
    console.log('Page contains "Supabase":', pageText.includes('Supabase'));
    
    // Check for the System Info section specifically
    const systemInfoExists = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('h2, h4'));
      return headers.some(h => h.innerText.includes('System Information'));
    });
    console.log('System Info section exists:', systemInfoExists);
    
    console.log('Test completed successfully!');
    
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    // Leave the browser open for 5 seconds to see the results
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();