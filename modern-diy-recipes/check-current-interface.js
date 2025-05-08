/**
 * Check Current Interface
 * 
 * This script checks what the current interface looks like at http://localhost:3000
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, 'current-interface-screenshots');
const TIMESTAMP = Date.now();

// Create screenshot directory if it doesn't exist
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Take screenshot function
async function takeScreenshot() {
  console.log(`Launching browser to capture ${URL}...`);
  
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport for consistent screenshots
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log(`Navigating to ${URL}`);
    await page.goto(URL, {
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    // Get page title and log it
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Get some key information from the page
    // Look for KRAFT_AI TERMINAL and theme options
    const pageInfo = await page.evaluate(() => {
      let terminalHeader = null;
      let themeOptions = [];
      
      // Try to find the terminal header
      const header = document.querySelector('div.text-accent:contains("KRAFT_AI TERMINAL")');
      terminalHeader = header ? header.textContent : null;
      
      // Try to find theme options
      const themeEls = document.querySelectorAll('div:contains("HACKERS_TERMINAL"), div:contains("DYSTOPIA_CONSOLE"), div:contains("NEOTOPIA_INTERFACE")');
      themeOptions = Array.from(themeEls).map(el => el.textContent.trim());
      
      return {
        url: window.location.href,
        terminalHeader,
        themeOptions,
        bodyClasses: document.body.className,
        htmlClasses: document.documentElement.className,
        dataTheme: document.documentElement.getAttribute('data-theme')
      };
    });
    
    console.log('Page information:', pageInfo);
    
    // Take screenshot
    const screenshotPath = path.join(SCREENSHOT_DIR, `current-interface-${TIMESTAMP}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to ${screenshotPath}`);
    
    // Also try the home route explicitly
    console.log('Navigating to http://localhost:3000/ (explicit home route)');
    await page.goto('http://localhost:3000/', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    // Take screenshot of explicit home route
    const homeScreenshotPath = path.join(SCREENSHOT_DIR, `home-route-${TIMESTAMP}.png`);
    await page.screenshot({ path: homeScreenshotPath });
    console.log(`Home route screenshot saved to ${homeScreenshotPath}`);
    
    // Close browser
    await browser.close();
    console.log('Browser closed');
  } catch (error) {
    console.error(`Error in screenshot process:`, error.message);
  }
}

// Run the function
takeScreenshot();