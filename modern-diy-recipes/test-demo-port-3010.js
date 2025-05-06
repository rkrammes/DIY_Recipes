/**
 * Puppeteer test for the standalone feature toggle demo on port 3010
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create directory for test artifacts
const artifactsDir = path.join(__dirname, 'test-artifacts', 'feature-toggle-demo-3010');
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
  console.log('Starting feature toggle demo test on port 3010');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 }
  });
  
  const page = await browser.newPage();
  
  // Enable verbose logging
  page.on('console', message => {
    console.log(`[Browser] ${message.text()}`);
  });
  
  try {
    // Navigate to demo page on port 3010
    console.log('Navigating to demo page');
    await page.goto('http://127.0.0.1:3010');
    await delay(1000);
    await saveScreenshot(page, '01-demo-page');
    
    // 1. Check if feature toggle bar is present
    const toggleBarExists = await page.evaluate(() => {
      const bar = document.querySelector('.feature-toggle-bar');
      return { exists: !!bar, text: bar ? bar.innerText : null };
    });
    
    console.log('Feature toggle bar:', toggleBarExists);
    
    if (!toggleBarExists.exists) {
      throw new Error('Feature toggle bar not found on page');
    }
    
    // 2. Click the settings button
    console.log('Clicking settings button');
    await page.click('#settingsBtn');
    await delay(1000);
    await saveScreenshot(page, '02-settings-dropdown');
    
    // 3. Check if dropdown appeared
    const dropdownVisible = await page.evaluate(() => {
      const dropdown = document.querySelector('.settings-panel.visible');
      return !!dropdown;
    });
    
    console.log('Dropdown visible:', dropdownVisible);
    
    // 4. Toggle recipe versioning checkbox
    console.log('Toggling versioning checkbox');
    await page.click('#versioningToggle');
    await delay(1000);
    await saveScreenshot(page, '03-versioning-enabled');
    
    // 5. Check UI state after toggle
    const uiState = await page.evaluate(() => {
      return {
        isChecked: document.querySelector('#versioningToggle').checked,
        versioningSectionVisible: document.querySelector('#versioningEnabled').style.display !== 'none',
        disabledSectionHidden: document.querySelector('#versioningDisabled').style.display === 'none',
        localStorageValue: localStorage.getItem('recipeFeatures')
      };
    });
    
    console.log('UI state after toggle:', uiState);
    
    // 6. Click outside to close dropdown
    console.log('Clicking outside to close dropdown');
    await page.click('h1');
    await delay(1000);
    await saveScreenshot(page, '04-dropdown-closed');
    
    // 7. Reload page to test persistence
    console.log('Reloading page to test persistence');
    await page.reload();
    await delay(1000);
    await saveScreenshot(page, '05-page-reloaded');
    
    // 8. Check if state persisted
    const persistedState = await page.evaluate(() => {
      return {
        versioningSectionVisible: document.querySelector('#versioningEnabled').style.display !== 'none',
        disabledSectionHidden: document.querySelector('#versioningDisabled').style.display === 'none',
        localStorageValue: localStorage.getItem('recipeFeatures')
      };
    });
    
    console.log('Persisted state after reload:', persistedState);
    
    // 9. Report test results
    const testPassed = 
      uiState.isChecked && 
      uiState.versioningSectionVisible && 
      uiState.disabledSectionHidden &&
      persistedState.versioningSectionVisible && 
      persistedState.disabledSectionHidden;
    
    console.log('\n=== TEST SUMMARY ===');
    console.log('Feature toggle visibility check:', toggleBarExists.exists ? 'PASS' : 'FAIL');
    console.log('Settings dropdown opens:', dropdownVisible ? 'PASS' : 'FAIL');
    console.log('Toggle changes UI state:', uiState.versioningSectionVisible ? 'PASS' : 'FAIL');
    console.log('State persists after reload:', persistedState.versioningSectionVisible ? 'PASS' : 'FAIL');
    console.log('Overall test result:', testPassed ? 'PASS' : 'FAIL');
    
  } catch (error) {
    console.error('Test error:', error);
    await saveScreenshot(page, 'error');
  } finally {
    await browser.close();
  }
}

// First check if server is running
const http = require('http');
http.get('http://127.0.0.1:3010', (res) => {
  console.log(`Server check: ${res.statusCode}`);
  if (res.statusCode === 200) {
    testFeatureToggleDemo().catch(console.error);
  } else {
    console.error('Demo server is not running on port 3010');
  }
}).on('error', (err) => {
  console.error('Server check failed:', err.message);
  console.error('Please start the demo server with: node serve-demo-simple.js');
});