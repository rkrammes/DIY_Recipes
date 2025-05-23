const { chromium } = require('playwright');

async function testSettingsIntegration() {
  console.log('Starting Settings integration test...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the app
    console.log('Navigating to the app...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the initial state
    await page.screenshot({ path: 'test-screenshots/initial-state.png' });
    console.log('Initial screenshot captured');

    // Click on the Settings category in the first column
    console.log('Clicking on Settings category...');
    await page.click('div[data-category="settings"]');
    await page.waitForTimeout(1000);
    
    // Take screenshot after clicking Settings
    await page.screenshot({ path: 'test-screenshots/settings-selected.png' });
    console.log('Settings selected screenshot captured');

    // Click on Theme Settings in the second column
    console.log('Clicking on Theme Settings...');
    const themeSettingsItem = await page.locator('div:has-text("Theme Settings")').first();
    await themeSettingsItem.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot of Theme Settings content
    await page.screenshot({ path: 'test-screenshots/theme-settings.png' });
    console.log('Theme Settings screenshot captured');

    // Click on System Information in the second column
    console.log('Clicking on System Information...');
    const systemInfoItem = await page.locator('div:has-text("System Information")').first();
    await systemInfoItem.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot of System Information content
    await page.screenshot({ path: 'test-screenshots/system-info.png' });
    console.log('System Information screenshot captured');

    console.log('Test completed successfully\!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testSettingsIntegration().catch(console.error);
EOL < /dev/null