/**
 * Simple Puppeteer test to check if the app is accessible
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create directory for test artifacts
const artifactsDir = path.join(__dirname, 'test-artifacts', 'app-access');
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

async function testAppAccess() {
  console.log('Starting app access test');
  
  const browser = await puppeteer.launch({
    headless: false, // Using non-headless mode for visibility
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();
  
  // Enable more verbose logging
  page.on('console', message => {
    console.log(`[BROWSER ${message.type().toUpperCase()}] ${message.text()}`);
  });
  
  page.on('pageerror', error => {
    console.error(`[BROWSER ERROR] ${error.message}`);
  });
  
  page.on('requestfailed', request => {
    console.error(`[REQUEST FAILED] ${request.url()} - ${request.failure().errorText}`);
  });
  
  try {
    // Try different ports - prioritize 3001 first based on our debug script
    const ports = [3001, 3000, 8080];
    let connected = false;
    
    for (const port of ports) {
      try {
        console.log(`Trying to connect to http://localhost:${port}...`);
        
        // Set a reasonable timeout for navigation
        const response = await page.goto(`http://localhost:${port}`, {
          timeout: 10000,
          waitUntil: 'networkidle2'
        });
        
        // Take a screenshot regardless of status
        const timestamp = Date.now();
        const screenshotPath = path.join(artifactsDir, `port-${port}-${timestamp}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Screenshot saved: ${screenshotPath}`);
        
        // Check if the response was successful
        if (response && response.ok()) {
          console.log(`Successfully connected to http://localhost:${port}`);
          console.log(`Status: ${response.status()}`);
          connected = true;
          
          // Try to detect the UI mode (terminal or standard)
          const uiMode = await page.evaluate(() => {
            // Check for terminal UI elements
            const hasTerminalElements = 
              document.body.innerText.includes('TERMINAL') || 
              document.body.innerText.includes('COMMAND') ||
              document.querySelector('[class*="terminal"]') !== null;
            
            // Check for recipe elements
            const hasRecipeElements = 
              document.body.innerText.includes('Recipe') ||
              document.body.innerText.includes('Ingredient') ||
              document.querySelector('[class*="recipe"]') !== null;
            
            return {
              hasTerminalUI: hasTerminalElements,
              hasStandardUI: hasRecipeElements,
              bodyText: document.body.innerText.substring(0, 200)
            };
          });
          
          console.log('UI Mode Detection:', uiMode);
          break;
        } else {
          console.log(`Failed to connect to http://localhost:${port}: ${response ? response.status() : 'No response'}`);
        }
      } catch (error) {
        console.error(`Error connecting to port ${port}:`, error.message);
      }
    }
    
    if (!connected) {
      console.error('Could not connect to the app on any port');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testAppAccess().catch(console.error);