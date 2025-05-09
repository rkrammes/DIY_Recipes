/**
 * Settings Integration Test using Puppeteer
 * 
 * This script tests the new Settings functionality with Puppeteer to verify:
 * 1. Settings page loads correctly
 * 2. Theme changes are applied and persisted
 * 3. Audio settings are applied and persisted
 * 4. User preferences are saved to Supabase when authenticated
 * 
 * Run with: node test-settings-integration.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-artifacts', 'settings-test');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Save a screenshot with timestamp
const saveScreenshot = async (page, name) => {
  const timestamp = Date.now();
  const filename = path.join(SCREENSHOTS_DIR, `${name}-${timestamp}.png`);
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`Screenshot saved: ${filename}`);
  return filename;
};

// Wait for network to be idle
const waitForNetworkIdle = async (page, timeout = 5000) => {
  try {
    await page.waitForNetworkIdle({ idle: 'networkidle0', timeout });
  } catch (e) {
    console.warn('Network did not become completely idle, continuing anyway');
  }
};

// Run the tests
async function runTests() {
  console.log('Starting Settings integration tests with Puppeteer');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/CD, false for local debugging
    args: ['--window-size=1280,800'],
    defaultViewport: {
      width: 1280,
      height: 800
    }
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('Step 1: Testing settings page load');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle0' });
    await saveScreenshot(page, '01-settings-page-load');
    
    // Verify settings page loaded
    try {
      const pageTitle = await page.$eval('h1', el => el.textContent);
      console.log(`  Page title: ${pageTitle}`);
      if (!pageTitle.includes('Settings')) {
        throw new Error('Settings page title not found');
      }
    } catch (e) {
      console.warn('Could not find h1 element, trying alternate selectors');
      // Try to find any element with Settings text
      const hasSettingsText = await page.evaluate(() => {
        return document.body.innerText.includes('Settings');
      });
      if (!hasSettingsText) {
        throw new Error('Settings page text not found anywhere on the page');
      } else {
        console.log('  Found "Settings" text on the page');
      }
    }
    
    console.log('Step 2: Testing theme changes');
    // Select the theme tab if not already active
    const themeTab = await page.$('[value="theme"]');
    if (themeTab) {
      await themeTab.click();
      await waitForNetworkIdle(page);
    }
    
    // Get current theme
    const currentTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    console.log(`  Current theme: ${currentTheme}`);
    
    // Click different theme options and verify they change
    console.log('  Testing dystopia theme');
    const dystopiaOption = await page.$('label[for="theme-dystopia"]');
    if (!dystopiaOption) {
      throw new Error('Dystopia theme option not found');
    }
    
    await dystopiaOption.click();
    await waitForNetworkIdle(page);
    await saveScreenshot(page, '02-dystopia-theme');
    
    // Verify theme changed
    const newTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    console.log(`  New theme: ${newTheme}`);
    if (newTheme !== 'dystopia') {
      throw new Error(`Theme did not change to dystopia, got: ${newTheme}`);
    }
    
    console.log('Step 3: Testing audio settings');
    // Navigate to audio tab
    const audioTab = await page.$('[value="audio"]');
    if (!audioTab) {
      throw new Error('Audio tab not found');
    }
    
    await audioTab.click();
    await waitForNetworkIdle(page);
    await saveScreenshot(page, '03-audio-settings');
    
    // Toggle audio and check it's saved
    console.log('  Testing audio toggle');
    const audioToggle = await page.$('#audio-toggle');
    if (!audioToggle) {
      throw new Error('Audio toggle not found');
    }
    
    // Get current audio state
    const initialAudioState = await page.evaluate(() => {
      return localStorage.getItem('audioEnabled') === 'true';
    });
    console.log(`  Initial audio state: ${initialAudioState}`);
    
    // Click the toggle
    await audioToggle.click();
    await waitForNetworkIdle(page);
    await saveScreenshot(page, '04-audio-toggled');
    
    // Check if audio state changed
    const newAudioState = await page.evaluate(() => {
      return localStorage.getItem('audioEnabled') === 'true';
    });
    console.log(`  New audio state: ${newAudioState}`);
    if (newAudioState === initialAudioState) {
      throw new Error('Audio state did not change after toggle');
    }
    
    console.log('Step 4: Testing persistence by refreshing the page');
    await page.reload({ waitUntil: 'networkidle0' });
    await saveScreenshot(page, '05-after-reload');
    
    // Verify theme persisted
    const persistedTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    console.log(`  Persisted theme: ${persistedTheme}`);
    if (persistedTheme !== 'dystopia') {
      throw new Error(`Theme did not persist after reload, got: ${persistedTheme}`);
    }
    
    // Verify audio setting persisted
    const persistedAudioState = await page.evaluate(() => {
      return localStorage.getItem('audioEnabled') === 'true';
    });
    console.log(`  Persisted audio state: ${persistedAudioState}`);
    if (persistedAudioState !== newAudioState) {
      throw new Error('Audio state did not persist after reload');
    }
    
    console.log('Step 5: Testing Supabase integration with the test page');
    await page.goto(`${BASE_URL}/supabase-settings-test`, { waitUntil: 'networkidle0' });
    await saveScreenshot(page, '06-supabase-test-page');
    
    // Run the Supabase test
    console.log('  Running Supabase storage test');
    const testButton = await page.$('button:not([disabled]):has-text("Run Supabase Storage Test")');
    if (!testButton) {
      throw new Error('Supabase test button not found');
    }
    
    await testButton.click();
    await page.waitForFunction('document.body.textContent.includes("Test Results")');
    await saveScreenshot(page, '07-supabase-test-results');
    
    // Check test results
    const testResults = await page.evaluate(() => {
      const preElement = document.querySelector('pre');
      return preElement ? JSON.parse(preElement.textContent) : null;
    });
    
    console.log('  Test results:', testResults);
    if (!testResults) {
      throw new Error('Could not retrieve test results');
    }
    
    if (testResults.error) {
      console.error('  Test failed with error:', testResults.error);
      throw new Error(`Supabase test failed: ${testResults.error}`);
    }
    
    if (testResults.success !== true) {
      console.error('  Test failed with results:', testResults);
      throw new Error('Supabase test did not report success');
    }
    
    console.log('Step 6: Testing user profile settings');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle0' });
    
    // Navigate to profile tab
    const profileTab = await page.$('[value="profile"]');
    if (!profileTab) {
      throw new Error('Profile tab not found');
    }
    
    await profileTab.click();
    await waitForNetworkIdle(page);
    await saveScreenshot(page, '08-profile-settings');
    
    // Update display name
    console.log('  Updating display name');
    const displayNameInput = await page.$('#display-name');
    if (!displayNameInput) {
      throw new Error('Display name input not found');
    }
    
    await displayNameInput.click({ clickCount: 3 }); // Select all text
    await displayNameInput.type('Test User');
    
    // Click save button
    const saveButton = await page.$('button:has-text("Save Changes")');
    if (!saveButton) {
      throw new Error('Save button not found');
    }
    
    await saveButton.click();
    await page.waitForFunction('document.body.textContent.includes("Profile saved")');
    await saveScreenshot(page, '09-profile-saved');
    
    console.log('All tests passed successfully! 🎉');
    
  } catch (error) {
    console.error('Test failed:', error);
    
    // Take a screenshot of the failure state
    const page = (await browser.pages())[0];
    if (page) {
      await saveScreenshot(page, 'error-state');
    }
    
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the tests
runTests()
  .then(() => {
    console.log('Integration tests completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error running tests:', err);
    process.exit(1);
  });