const puppeteer = require('puppeteer');

async function testSettings() {
  const browser = await puppeteer.launch({ 
    headless: false, 
    args: ['--window-size=1920,1080'],
    defaultViewport: null
  });
  const page = await browser.newPage();

  try {
    console.log('Navigating to the app...');
    await page.goto('http://localhost:3001');
    await page.waitForSelector('div[data-category="formulations"]');
    
    console.log('App loaded successfully');
    await page.screenshot({ path: './test-screenshots/initial-app.png' });
    
    console.log('Clicking on Settings category...');
    await page.click('div[data-category="settings"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: './test-screenshots/settings-category.png' });
    
    console.log('Test completed\!');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
}

testSettings();
