/**
 * This script verifies that the Settings module is properly registered and accessible
 * in the application.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'verification-screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function verifySettingsModule() {
  console.log('Starting Settings module verification');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1280,800'],
    defaultViewport: {
      width: 1280,
      height: 800
    }
  });
  
  try {
    const page = await browser.newPage();
    
    // First, check the home page
    console.log('Step 1: Accessing home page');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    
    const timestamp = Date.now();
    const homepageScreenshot = path.join(SCREENSHOTS_DIR, `homepage-${timestamp}.png`);
    await page.screenshot({ path: homepageScreenshot, fullPage: true });
    console.log(`  Screenshot saved: ${homepageScreenshot}`);
    
    // Check if we can see the settings link/module
    const hasSettingsLink = await page.evaluate(() => {
      // Check for any element that might contain settings text or icon
      return document.body.innerText.toLowerCase().includes('settings') || 
             document.body.innerHTML.includes('⚙️');
    });
    
    if (hasSettingsLink) {
      console.log('  Found Settings link/icon on the home page ✅');
    } else {
      console.warn('  Settings link/icon not visible on the home page');
    }
    
    // Try to access settings directly
    console.log('Step 2: Accessing settings page directly');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle0' });
    
    const settingsScreenshot = path.join(SCREENSHOTS_DIR, `settings-page-${timestamp}.png`);
    await page.screenshot({ path: settingsScreenshot, fullPage: true });
    console.log(`  Screenshot saved: ${settingsScreenshot}`);
    
    // Check if we're on the settings page
    const isSettingsPage = await page.evaluate(() => {
      return document.body.innerText.toLowerCase().includes('settings') ||
             document.title.toLowerCase().includes('settings');
    });
    
    if (isSettingsPage) {
      console.log('  Successfully accessed settings page ✅');
    } else {
      console.warn('  Could not verify we are on the settings page');
    }
    
    // Check for Tabs component rendered
    const hasTabsComponent = await page.evaluate(() => {
      return !!document.querySelector('[role="tablist"]') || 
             !!document.querySelector('[data-state="active"]');
    });
    
    if (hasTabsComponent) {
      console.log('  Tabs component rendered correctly ✅');
    } else {
      console.warn('  Tabs component not found');
    }
    
    console.log('Verification complete');
    
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the verification
verifySettingsModule()
  .then(() => console.log('Done!'))
  .catch(err => console.error('Error running verification:', err));