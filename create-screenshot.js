// create-screenshot.js
// Create a screenshot from the terminal HTML without needing a server

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to HTML files
const indexTerminalPath = path.join(__dirname, 'index-terminal.html');
const outputDir = path.join(__dirname, 'screenshots');
const timestamp = Date.now();

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function createScreenshot() {
  console.log('Creating screenshot from terminal HTML file...');
  
  try {
    // Check if file exists
    if (!fs.existsSync(indexTerminalPath)) {
      console.error(`File not found: ${indexTerminalPath}`);
      return;
    }
    
    // Read HTML file
    const htmlContent = fs.readFileSync(indexTerminalPath, 'utf-8');
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create new page
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Load HTML content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Add necessary styles since we're loading without a server
    await page.addStyleTag({
      content: `
        body {
          margin: 0;
          padding: 0;
          font-family: monospace;
          background-color: #001100;
          color: #33ff33;
        }
        
        /* Basic terminal theme */
        [data-theme="terminal-mono"] {
          --text-primary: #33ff33;
          --surface-0: #001100;
        }
      `
    });
    
    // Take screenshot
    const screenshotPath = path.join(outputDir, `terminal-${timestamp}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to ${screenshotPath}`);
    
    // Close browser
    await browser.close();
    
    return screenshotPath;
  } catch (error) {
    console.error(`Error creating screenshot: ${error.message}`);
  }
}

// Run the function
createScreenshot();