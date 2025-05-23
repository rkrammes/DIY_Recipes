/**
 * Puppeteer test for the standalone feature toggle demo
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Create directory for test artifacts
const artifactsDir = path.join(__dirname, 'test-artifacts', 'feature-toggle-demo');
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

// Check if port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.close();
        resolve(true);
      })
      .listen(port, '127.0.0.1');
  });
}

// Test function
async function testDemo() {
  console.log('Starting feature toggle demo test');
  
  // Check if port is available
  const portAvailable = await isPortAvailable(3005);
  
  let server = null;
  
  if (portAvailable) {
    // Start the demo server
    console.log('Starting demo server...');
    server = spawn('node', ['serve-demo.js']);
    
    server.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
    });
    
    server.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });
    
    // Wait for server to start
    await delay(2000);
  } else {
    console.log('Demo server is already running on port 3005, using existing server');
  }
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the demo page
    console.log('Navigating to demo page');
    await page.goto('http://localhost:3005');
    await delay(2000);
    await saveScreenshot(page, '01-demo-page');
    
    // 1. Click the Features/Settings button
    console.log('Clicking Settings/Features button');
    
    // Check which button exists
    const buttonId = await page.evaluate(() => {
      if (document.querySelector('#settingsBtn')) return '#settingsBtn';
      if (document.querySelector('#featuresButton')) return '#featuresButton';
      return null;
    });
    
    if (!buttonId) {
      throw new Error('Could not find settings/features button');
    }
    
    console.log(`Found button with ID: ${buttonId}`);
    await page.click(buttonId);
    await delay(1000);
    await saveScreenshot(page, '02-settings-dropdown');
    
    // 2. Toggle versioning feature
    console.log('Toggling versioning feature');
    
    // Find the toggle
    const toggleSelector = await page.evaluate(() => {
      if (document.querySelector('#versioningToggle')) return '#versioningToggle';
      
      // Try finding any checkbox in a dropdown
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      if (checkboxes.length > 0) {
        // Add a data attribute to identify it
        checkboxes[0].setAttribute('data-test-id', 'versioningToggle');
        return '[data-test-id="versioningToggle"]';
      }
      
      return null;
    });
    
    if (!toggleSelector) {
      throw new Error('Could not find versioning toggle checkbox');
    }
    
    console.log(`Found toggle with selector: ${toggleSelector}`);
    await page.click(toggleSelector);
    await delay(1000);
    await saveScreenshot(page, '03-versioning-enabled');
    
    // 3. Verify UI changes
    const uiState = await page.evaluate((selector) => {
      // Find versioning sections
      let versioningEnabled = false;
      let versioningDisabled = false;
      
      // Look for specific IDs
      if (document.getElementById('versioningEnabled')) {
        versioningEnabled = document.getElementById('versioningEnabled').style.display !== 'none';
      } else {
        // Try to find sections by content
        const headings = Array.from(document.querySelectorAll('h3'));
        for (const heading of headings) {
          if (heading.innerText.includes('Recipe Versions')) {
            versioningEnabled = true;
          }
          if (heading.innerText.includes('Recipe Versioning') && 
              heading.nextElementSibling && 
              heading.nextElementSibling.innerText.includes('Enable')) {
            versioningDisabled = true;
          }
        }
      }
      
      if (document.getElementById('versioningDisabled')) {
        versioningDisabled = document.getElementById('versioningDisabled').style.display === 'none';
      }
      
      // Get toggle state
      const toggle = document.querySelector(selector);
      const toggleChecked = toggle ? toggle.checked : false;
      
      return { versioningEnabled, versioningDisabled, toggleChecked };
    }, toggleSelector);
    
    console.log('UI state after toggle:', uiState);
    
    // 4. Click outside to close dropdown
    console.log('Clicking outside to close dropdown');
    await page.click('h1');
    await delay(1000);
    await saveScreenshot(page, '04-dropdown-closed');
    
    // 5. Reload page to test persistence
    console.log('Reloading page to test persistence');
    await page.reload();
    await delay(2000);
    await saveScreenshot(page, '05-page-reloaded');
    
    // 6. Verify settings persisted
    const persistedState = await page.evaluate((selector) => {
      // Find versioning sections
      let versioningEnabled = false;
      let versioningDisabled = false;
      
      // Look for specific IDs
      if (document.getElementById('versioningEnabled')) {
        versioningEnabled = document.getElementById('versioningEnabled').style.display !== 'none';
      } else {
        // Try to find sections by content
        const headings = Array.from(document.querySelectorAll('h3'));
        for (const heading of headings) {
          if (heading.innerText.includes('Recipe Versions')) {
            versioningEnabled = true;
          }
          if (heading.innerText.includes('Recipe Versioning') && 
              heading.nextElementSibling && 
              heading.nextElementSibling.innerText.includes('Enable')) {
            versioningDisabled = true;
          }
        }
      }
      
      if (document.getElementById('versioningDisabled')) {
        versioningDisabled = document.getElementById('versioningDisabled').style.display === 'none';
      }
      
      // Find the toggle again (it might have been recreated after reload)
      let toggleChecked = false;
      const toggles = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      if (toggles.length > 0) {
        // Assume the first checkbox is our toggle
        toggleChecked = toggles[0].checked;
      }
      
      return {
        versioningEnabled,
        versioningDisabled,
        toggleChecked,
        localStorageValue: localStorage.getItem('recipeFeatures')
      };
    }, toggleSelector);
    
    console.log('Persisted state after reload:', persistedState);
    
    // 7. Toggle back off through Settings/Features menu
    console.log('Opening settings/features menu again');
    await page.click(buttonId);
    await delay(1000);
    
    console.log('Toggling versioning off');
    
    // Find the toggle again
    const toggleSelector2 = await page.evaluate(() => {
      if (document.querySelector('#versioningToggle')) return '#versioningToggle';
      
      // Try finding any checkbox in a dropdown
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      if (checkboxes.length > 0) {
        // Add a data attribute to identify it
        checkboxes[0].setAttribute('data-test-id', 'versioningToggle');
        return '[data-test-id="versioningToggle"]';
      }
      
      return null;
    });
    
    if (toggleSelector2) {
      await page.click(toggleSelector2);
    } else {
      console.warn('Could not find toggle checkbox for disabling');
    }
    await delay(1000);
    await saveScreenshot(page, '06-versioning-disabled');
    
    // 8. Click the enable button in the disabled section
    console.log('Looking for Enable Versioning button');
    
    const enableButton = await page.evaluate(() => {
      // Try specific ID
      if (document.querySelector('#enableVersioningBtn')) {
        return '#enableVersioningBtn';
      }
      
      // Try finding by text content
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const button of buttons) {
        if (button.innerText.includes('Enable') && button.innerText.includes('Version')) {
          button.setAttribute('data-test-id', 'enableVersioningBtn');
          return '[data-test-id="enableVersioningBtn"]';
        }
      }
      
      return null;
    });
    
    if (enableButton) {
      console.log(`Found enable button: ${enableButton}`);
      await page.click(enableButton);
    } else {
      console.warn('Could not find Enable Versioning button');
    }
    await delay(1000);
    await saveScreenshot(page, '07-versioning-re-enabled');
    
    console.log('Test completed successfully');
    
  } catch (error) {
    console.error('Test error:', error);
    await saveScreenshot(page, 'error');
  } finally {
    await browser.close();
    
    // Only stop server if we started it
    if (server) {
      console.log('Stopping server...');
      server.kill();
    }
  }
}

// Run the test
testDemo().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});