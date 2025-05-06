const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Helper to save screenshots with timestamp
const saveScreenshot = async (page, name) => {
  const timestamp = Date.now();
  const filePath = path.join(screenshotsDir, `${name}-${timestamp}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`Screenshot saved: ${filePath}`);
  return filePath;
};

// Helper to wait a bit and make test more reliable
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log('Starting document-centric interface test...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    defaultViewport: { width: 1280, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the local app (assuming it's running)
    console.log('Navigating to application...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });
    await saveScreenshot(page, 'home-page');
    
    // Wait for recipe list to load and click on a recipe
    console.log('Selecting a recipe...');
    await page.waitForSelector('.recipe-list-item', { timeout: 5000 })
      .catch(() => console.log('Recipe list items not found, may be using mock data'));
    
    // Click the first recipe or the "View details" button
    const recipeSelector = '.recipe-list-item, a:has-text("View details")';
    await page.waitForSelector(recipeSelector);
    await page.click(recipeSelector);
    await wait(1000);
    await saveScreenshot(page, 'recipe-details');
    
    // Look for the feature toggle button
    console.log('Testing feature toggle...');
    const featureButtonSelector = 'button:has-text("Features")';
    await page.waitForSelector(featureButtonSelector);
    await page.click(featureButtonSelector);
    await wait(500);
    
    // Check for and click the document-centric view toggle
    const docViewToggleSelector = 'input[type="checkbox"]:near(:text("Document-Centric View"))';
    await page.waitForSelector(docViewToggleSelector);
    
    // Check current state
    const isDocumentModeEnabled = await page.$eval(docViewToggleSelector, el => el.checked);
    console.log(`Document mode is currently ${isDocumentModeEnabled ? 'enabled' : 'disabled'}`);
    
    // Toggle document mode if needed
    if (!isDocumentModeEnabled) {
      console.log('Enabling document mode...');
      await page.click(docViewToggleSelector);
      await wait(1000);
    }
    
    // Close the features dropdown (click outside)
    await page.mouse.click(10, 10);
    await wait(500);
    
    // Document mode should now be active
    await saveScreenshot(page, 'document-mode-enabled');
    
    // Check for Creation Mode button
    console.log('Testing Creation Mode...');
    const creationModeButtonSelector = 'button:has-text("Creation Mode")';
    await page.waitForSelector(creationModeButtonSelector);
    await page.click(creationModeButtonSelector);
    await wait(1000);
    await saveScreenshot(page, 'creation-mode-active');
    
    // Look for Start Creating button
    const startCreatingSelector = 'button:has-text("Start Creating")';
    await page.waitForSelector(startCreatingSelector);
    await page.click(startCreatingSelector);
    await wait(1000);
    await saveScreenshot(page, 'creation-mode-step');
    
    // Test timer functionality
    console.log('Testing timer...');
    const timerButtonSelector = 'button:has-text("5m")';
    await page.waitForSelector(timerButtonSelector);
    await page.click(timerButtonSelector);
    await wait(1000);
    await saveScreenshot(page, 'timer-active');
    
    // Exit Creation Mode
    const exitModeSelector = 'button:has-text("Exit Creation Mode")';
    await page.waitForSelector(exitModeSelector);
    await page.click(exitModeSelector);
    await wait(1000);
    await saveScreenshot(page, 'exit-creation-mode');
    
    // Check formulation timeline
    console.log('Testing formulation timeline...');
    const timelineHeaderSelector = 'h3:has-text("Formulation Timeline")';
    await page.waitForSelector(timelineHeaderSelector);
    
    // Check for versions in the timeline
    const versionButtonsSelector = 'button:has-text("v")';
    const versionButtons = await page.$$(versionButtonsSelector);
    
    if (versionButtons.length > 1) {
      console.log(`Found ${versionButtons.length} versions in timeline`);
      // Click on a different version
      await versionButtons[versionButtons.length > 1 ? 1 : 0].click();
      await wait(1000);
      await saveScreenshot(page, 'different-version');
    } else {
      console.log('Not enough versions to test timeline navigation');
    }
    
    // Test print preview functionality
    console.log('Testing print preview...');
    const printButtonSelector = 'button[title="Print Formulation"]';
    await page.waitForSelector(printButtonSelector);
    
    // Instead of actually printing, just click preview
    const previewButtonSelector = 'button[title="Print Preview in New Tab"]';
    await page.waitForSelector(previewButtonSelector);
    
    // Click preview in a way that handles the new tab
    const newPagePromise = new Promise(resolve => browser.once('targetcreated', target => resolve(target.page())));
    await page.click(previewButtonSelector);
    const newPage = await newPagePromise;
    await newPage.waitForSelector('h1');
    await wait(1000);
    await newPage.screenshot({ path: path.join(screenshotsDir, `print-preview-${Date.now()}.png`) });
    await newPage.close();
    
    console.log('Document-centric interface test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
    await saveScreenshot(await browser.newPage(), 'error-state');
  } finally {
    await browser.close();
  }
})();