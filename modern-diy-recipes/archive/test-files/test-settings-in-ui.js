// Test script to verify that Settings appears in System Directories
const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting UI test for Settings in System Directories...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Wait for the UI to render
    await page.waitForSelector('.flex.flex-1.overflow-hidden.font-mono');
    console.log('UI rendered, checking for Settings in System Directories...');
    
    // Take a screenshot of the initial state
    await page.screenshot({ path: './test-screenshots/home-page.png' });
    console.log('Saved homepage screenshot');
    
    // Check if Settings is in the System Directories
    const settingsExists = await page.evaluate(() => {
      const sectionElements = Array.from(document.querySelectorAll('.flex.items-center.px-3.py-2.cursor-pointer'));
      const settingsElements = sectionElements.filter(el => el.textContent.includes('Settings'));
      console.log('Found Settings elements:', settingsElements.length);
      settingsElements.forEach((el, i) => {
        console.log(`Settings element ${i}:`, el.textContent);
      });
      return settingsElements.length > 0;
    });
    
    console.log(`Settings in System Directories: ${settingsExists ? 'YES ✅' : 'NO ❌'}`);
    
    if (settingsExists) {
      // Click on the Settings option
      console.log('Clicking on Settings option...');
      await page.evaluate(() => {
        const sectionElements = Array.from(document.querySelectorAll('.flex.items-center.px-3.py-2.cursor-pointer'));
        const settingsElement = sectionElements.find(el => el.textContent.includes('Settings'));
        console.log('Clicking on Settings element:', settingsElement);
        if (settingsElement) {
          console.log('Settings element found, clicking it');
          settingsElement.click();
        } else {
          console.log('No Settings element found to click');
        }
      });
      
      // Wait for redirection to the Settings page
      await page.waitForNavigation({ timeout: 5000 }).catch(e => {
        console.log('Navigation timeout or not triggered. This is expected if redirection uses window.location.href');
      });
      
      // Take a screenshot of where we ended up
      const currentUrl = page.url();
      console.log(`Current URL after clicking Settings: ${currentUrl}`);
      await page.screenshot({ path: './test-screenshots/after-settings-click.png' });
      console.log('Saved post-click screenshot');
      
      if (currentUrl.includes('/settings')) {
        console.log('Successfully redirected to the Settings page ✅');
      } else {
        console.log('Not redirected to Settings page ❌');
      }
    } else {
      console.log('Settings option not found in UI, checking direct URL access...');
      
      // Try accessing Settings directly
      await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle2' });
      await page.screenshot({ path: './test-screenshots/direct-settings-access.png' });
      console.log('Saved direct settings access screenshot');
      
      // Check if the Settings UI is loaded
      const settingsPageLoaded = await page.evaluate(() => {
        return document.querySelector('h2')?.textContent.includes('System Information');
      });
      
      console.log(`Settings page directly accessible: ${settingsPageLoaded ? 'YES ✅' : 'NO ❌'}`);
    }
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
    console.log('Test completed.');
  }
})();