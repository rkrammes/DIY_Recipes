const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'app-test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Helper to save screenshots with timestamp
const saveScreenshot = async (page, name) => {
  const timestamp = Date.now();
  const filePath = path.join(screenshotsDir, `${name}-${timestamp}.png`);
  await page.screenshot({ path: filePath });
  console.log(`Screenshot saved: ${filePath}`);
  return filePath;
};

// Main test function
(async () => {
  console.log('Starting app test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 }
  });
  
  const page = await browser.newPage();
  
  try {
    // First check if the homepage loads
    console.log('Attempting to load homepage...');
    await page.goto('http://localhost:3000/', { timeout: 10000 });
    console.log('✅ Homepage loaded successfully!');
    await saveScreenshot(page, 'homepage');
    
    // Now try to access the document-test page
    console.log('Attempting to load document-test page...');
    try {
      await page.goto('http://localhost:3000/document-test', { timeout: 10000 });
      console.log('✅ Document test page loaded successfully!');
      await saveScreenshot(page, 'document-test');
      
      // Look for key elements that indicate our changes
      const pageContent = await page.content();
      
      const terms = [
        'Creation Mode',
        'Formulation Timeline', 
        'Formulation Tools'
      ];
      
      console.log('\nChecking for DIY formulation terminology:');
      for (const term of terms) {
        if (pageContent.includes(term)) {
          console.log(`✅ "${term}" found`);
        } else {
          console.log(`❌ "${term}" not found`);
        }
      }
    } catch (e) {
      console.log('❌ Failed to load document-test page:', e.message);
      
      // Try the simple-doc page as fallback
      console.log('\nAttempting to load simple-doc page...');
      try {
        await page.goto('http://localhost:3000/simple-doc', { timeout: 10000 });
        console.log('✅ Simple doc page loaded successfully!');
        await saveScreenshot(page, 'simple-doc');
      } catch (e) {
        console.log('❌ Failed to load simple-doc page:', e.message);
      }
    }
    
    // Keep the browser open for a while to allow manual inspection
    console.log('\nBrowser will remain open for 2 minutes for manual inspection');
    console.log('App is running at: http://localhost:3000/');
    console.log('Document test page: http://localhost:3000/document-test');
    console.log('Simple doc page: http://localhost:3000/simple-doc');
    
    await new Promise(r => setTimeout(r, 120000));
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();