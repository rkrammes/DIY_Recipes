// test-settings-url.js - Simple script to test the Settings URL directly
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
    // Navigate directly to http://localhost:3000/settings
    console.log('Navigating directly to http://localhost:3000/settings...');
    await page.goto('http://localhost:3000/settings', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait a moment for any dynamic content to load
    await page.waitForTimeout(2000);

    // Click on the System tab to view our SystemInfo component
    console.log('Clicking on System tab...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const systemTab = tabs.find(t => t.textContent?.trim() === 'System');
      if (systemTab) {
        systemTab.click();
        return true;
      }
      return false;
    });

    // Wait for tab content to load
    await page.waitForTimeout(1000);
    
    // Take a screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ 
      path: 'test-artifacts/settings-test/settings-url-test.png', 
      fullPage: true 
    });
    
    // Print all heading text to see what's on the page
    const headingText = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return headings.map(h => `${h.tagName}: ${h.textContent}`);
    });
    
    console.log('Headings on page:');
    console.log(headingText);
    
    // Check if we're using the correct Settings component
    const isNewSettings = await page.evaluate(() => {
      // Look for elements that would only be in the new Settings component
      const tabsList = document.querySelector('[role="tablist"]');
      const settingsTitle = Array.from(document.querySelectorAll('h1')).find(h => h.textContent.includes('Settings'));
      
      return {
        hasTabsList: !!tabsList,
        hasSettingsTitle: !!settingsTitle,
        titleText: settingsTitle ? settingsTitle.textContent : 'No title found'
      };
    });
    
    console.log('New Settings Component Check:');
    console.log(isNewSettings);

    // Check for Supabase status specifically
    const supabaseStatus = await page.evaluate(() => {
      // Look for Supabase text in the page
      const pageText = document.body.innerText;
      const hasSupabaseText = pageText.includes('Supabase');

      // Look for specific status elements
      const statusTexts = Array.from(document.querySelectorAll('.flex.justify-between'))
        .map(el => el.innerText)
        .filter(text => text.includes('Supabase'));

      return {
        hasSupabaseText,
        statusElements: statusTexts,
        rawText: Array.from(document.querySelectorAll('.flex.justify-between')).map(el => el.innerText),
      };
    });

    console.log('Supabase Status Check:');
    console.log(supabaseStatus);

    console.log('Test completed successfully!');
    
    // Leave the browser open for 10 seconds to view the page
    await page.waitForTimeout(10000);
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
})();