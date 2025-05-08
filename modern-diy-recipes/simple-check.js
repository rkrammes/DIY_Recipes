// Simple check to capture screenshots of the app

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Screenshot directory
const screenshotDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function captureScreenshots() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Capture homepage
  console.log('Capturing homepage...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
  const title = await page.title();
  console.log(`Page title: ${title}`);
  await page.screenshot({ path: path.join(screenshotDir, 'homepage.png') });
  
  // Capture page information
  console.log('Getting page information...');
  const pageInfo = await page.evaluate(() => {
    // Safe way to get information
    const textContent = document.body.textContent || '';
    
    return {
      url: window.location.href,
      title: document.title,
      hasKraftAI: textContent.includes('KRAFT_AI'),
      hasHackers: textContent.includes('HACKERS'),
      hasDystopia: textContent.includes('DYSTOPIA'),
      hasNeotopia: textContent.includes('NEOTOPIA'),
      dataTheme: document.documentElement.getAttribute('data-theme')
    };
  });
  
  console.log('Page information:', pageInfo);
  
  // Close browser
  await browser.close();
  console.log('Done. Screenshots saved to the "screenshots" directory.');
}

captureScreenshots().catch(error => {
  console.error('Error:', error);
});