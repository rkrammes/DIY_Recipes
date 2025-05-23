/**
 * Direct test for the feature toggle demo HTML file
 * Opens the HTML file directly in a browser without server
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create directory for test artifacts
const artifactsDir = path.join(__dirname, 'test-artifacts', 'direct-demo');
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

// Helper for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Save screenshot with timestamp
async function saveScreenshot(page, name) {
  const timestamp = Date.now();
  const screenshotPath = path.join(artifactsDir, `${name}-${timestamp}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

async function testFeatureToggleDemo() {
  console.log('Starting direct feature toggle demo test');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Get the absolute path to the demo HTML file
    const demoPath = path.join(__dirname, 'feature-toggle-demo.html');
    
    // Open the file directly using the file:// protocol
    console.log(`Opening demo file: ${demoPath}`);
    await page.goto(`file://${demoPath}`);
    await delay(1000);
    await saveScreenshot(page, '01-demo-page');
    
    // 1. Click the features button to open the dropdown
    console.log('Clicking features button');
    await page.click('#featuresButton');
    await delay(1000);
    await saveScreenshot(page, '02-dropdown-open');
    
    // 2. Check if dropdown is visible
    const dropdownVisible = await page.evaluate(() => {
      return !document.getElementById('settingsDropdown').classList.contains('hidden');
    });
    
    console.log('Dropdown visible:', dropdownVisible);
    
    // 3. Toggle versioning
    console.log('Toggling versioning checkbox');
    await page.click('#versioningToggle');
    await delay(1000);
    await saveScreenshot(page, '03-versioning-enabled');
    
    // 4. Check UI state after toggle
    const uiState = await page.evaluate(() => {
      return {
        toggleChecked: document.getElementById('versioningToggle').checked,
        badgeVisible: !document.getElementById('versioningEnabledBadge').classList.contains('hidden'),
        disabledSectionHidden: document.getElementById('versioningDisabledSection').classList.contains('hidden'),
        enabledSectionVisible: !document.getElementById('versioningEnabledSection').classList.contains('hidden'),
        localStorage: localStorage.getItem('recipeFeatures')
      };
    });
    
    console.log('UI state after toggle:', uiState);
    
    // 5. Click outside to close dropdown
    console.log('Clicking outside to close dropdown');
    await page.click('h1');
    await delay(1000);
    await saveScreenshot(page, '04-dropdown-closed');
    
    // 6. Reload page to test persistence
    console.log('Reloading page to test persistence');
    await page.reload();
    await delay(1000);
    await saveScreenshot(page, '05-page-reloaded');
    
    // 7. Check if state persisted
    const persistedState = await page.evaluate(() => {
      return {
        badgeVisible: !document.getElementById('versioningEnabledBadge').classList.contains('hidden'),
        disabledSectionHidden: document.getElementById('versioningDisabledSection').classList.contains('hidden'),
        enabledSectionVisible: !document.getElementById('versioningEnabledSection').classList.contains('hidden'),
        localStorage: localStorage.getItem('recipeFeatures')
      };
    });
    
    console.log('Persisted state after reload:', persistedState);
    
    // 8. Test results summary
    console.log('\n=== TEST SUMMARY ===');
    console.log('Dropdown opens correctly:', dropdownVisible ? 'PASS' : 'FAIL');
    console.log('Toggle changes UI state:', uiState.toggleChecked ? 'PASS' : 'FAIL');
    console.log('Badge visibility updated:', uiState.badgeVisible ? 'PASS' : 'FAIL');
    console.log('Sections show/hide correctly:', (uiState.disabledSectionHidden && uiState.enabledSectionVisible) ? 'PASS' : 'FAIL');
    console.log('State persists after reload:', (persistedState.badgeVisible && persistedState.disabledSectionHidden && persistedState.enabledSectionVisible) ? 'PASS' : 'FAIL');
    
  } catch (error) {
    console.error('Test error:', error);
    await saveScreenshot(page, 'error');
  } finally {
    await browser.close();
  }
}

// Run the test
testFeatureToggleDemo().catch(console.error);