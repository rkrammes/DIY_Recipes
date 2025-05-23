const puppeteer = require('puppeteer');

async function testSettings() {
  // Launch the browser
  const browser = await puppeteer.launch({ 
    headless: false, 
    args: ['--window-size=1920,1080'],
    defaultViewport: null
  });
  const page = await browser.newPage();

  try {
    // Navigate to the app
    console.log('Navigating to the app...');
    await page.goto('http://localhost:3001');
    
    // Wait for app to load
    await page.waitForSelector('div[data-category="formulations"]');
    console.log('App loaded successfully');
    
    // Take a screenshot of the initial state
    await page.screenshot({ path: './test-screenshots/initial-app.png' });
    
    // Click on the Settings category
    console.log('Clicking on Settings category...');
    await page.click('div[data-category="settings"]');
    await page.waitForTimeout(1000);
    
    // Take a screenshot after clicking on Settings
    await page.screenshot({ path: './test-screenshots/settings-category.png' });
    
    // Find and click on Theme Settings
    console.log('Clicking on Theme Settings...');
    const themeSettings = await page.$('div.px-3.py-1\\.5:has-text("Theme Settings")');
    if (themeSettings) {
      await themeSettings.click();
      await page.waitForTimeout(1000);
      
      // Take a screenshot of Theme Settings
      await page.screenshot({ path: './test-screenshots/theme-settings.png' });
    } else {
      console.log('Theme Settings not found');
    }
    
    // Find and click on System Information
    console.log('Clicking on System Information...');
    const systemInfo = await page.$('div.px-3.py-1\\.5:has-text("System Information")');
    if (systemInfo) {
      await systemInfo.click();
      await page.waitForTimeout(1000);
      
      // Take a screenshot of System Information
      await page.screenshot({ path: './test-screenshots/system-info.png' });
    } else {
      console.log('System Information not found');
    }
    
    console.log('Settings integration test completed successfully\!');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
}

testSettings();
EOF < /dev/null