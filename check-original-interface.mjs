/**
 * Check Original Interface
 * 
 * This script checks the original KRAFT_AI terminal interface
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
const SCREENSHOT_DIR = path.join(__dirname, 'original-screenshots');
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
    
    // Look for the terminal interface elements
    const terminalHeader = await page.evaluate(() => {
      const headerEl = document.querySelector('.terminal-header');
      return headerEl ? headerEl.textContent : null;
    });
    
    console.log(`Terminal header: ${terminalHeader || 'Not found'}`);
    
    // Look for theme selector
    const themeSelector = await page.evaluate(() => {
      // Look for any element that mentions the themes
      const themeEl = document.querySelector('[data-theme]');
      return themeEl ? themeEl.getAttribute('data-theme') : null;
    });
    
    console.log(`Current theme: ${themeSelector || 'Not found'}`);
    
    // Take screenshot
    const screenshotPath = path.join(SCREENSHOT_DIR, `original-interface-${TIMESTAMP}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to ${screenshotPath}`);
    
    // Save HTML for analysis
    const content = await page.content();
    fs.writeFileSync(path.join(SCREENSHOT_DIR, `original-interface-${TIMESTAMP}.html`), content);
    
    // Get HTML structure overview
    const structure = await page.evaluate(() => {
      function getElementInfo(element, level = 0) {
        if (!element) return null;
        
        const tagName = element.tagName.toLowerCase();
        const id = element.id ? `#${element.id}` : '';
        const classes = Array.from(element.classList).map(c => `.${c}`).join('');
        const dataAttributes = Array.from(element.attributes)
          .filter(attr => attr.name.startsWith('data-'))
          .map(attr => `[${attr.name}="${attr.value}"]`)
          .join('');
        
        // Basic info about this element
        const info = {
          element: `${tagName}${id}${classes}${dataAttributes}`,
          level,
          text: element.textContent.trim().slice(0, 50)
        };
        
        // Only include children for elements that might be relevant
        if (level < 3) {
          const children = Array.from(element.children)
            .map(child => getElementInfo(child, level + 1))
            .filter(Boolean);
          
          if (children.length > 0) {
            info.children = children;
          }
        }
        
        return info;
      }
      
      return getElementInfo(document.body);
    });
    
    // Save structure to file
    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, `structure-${TIMESTAMP}.json`),
      JSON.stringify(structure, null, 2)
    );
    
    // Close browser
    await browser.close();
    console.log('Browser closed');
  } catch (error) {
    console.error(`Error in screenshot process:`, error.message);
  }
}

// Run the function
takeScreenshot();