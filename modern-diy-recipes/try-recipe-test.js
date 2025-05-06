/**
 * Simple script to access the recipe test page
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create output directory
const outputDir = path.join(__dirname, 'test-artifacts', 'recipe-test');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Save screenshot
async function saveScreenshot(page, name) {
  const timestamp = Date.now();
  const path = `${outputDir}/${name}-${timestamp}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`Screenshot saved: ${path}`);
  return path;
}

async function testRecipePage() {
  console.log('Starting recipe test page navigation...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate directly to the recipe test page
    console.log('Navigating to /recipe-test...');
    await page.goto('http://localhost:3000/recipe-test');
    await delay(3000);
    await saveScreenshot(page, '01-recipe-test-page');
    
    // Try to find and click a recipe link if present
    console.log('Looking for a recipe to click...');
    
    // Get all links on the page
    const links = await page.$$eval('a', links => 
      links.map(a => ({
        href: a.href,
        text: a.innerText.trim().substring(0, 50),
        visible: a.offsetParent !== null,
        x: a.getBoundingClientRect().left,
        y: a.getBoundingClientRect().top
      }))
      .filter(a => a.visible && a.text.length > 0)
    );
    
    console.log(`Found ${links.length} visible links on page:`, links);
    
    if (links.length > 0) {
      // Click the first link
      console.log(`Clicking first link: ${links[0].text}`);
      
      await page.mouse.click(links[0].x + 10, links[0].y + 10);
      await delay(3000);
      await saveScreenshot(page, '02-after-click');
      
      // Now check for recipe version section
      console.log('Looking for Recipe Versions section...');
      const headers = await page.$$eval('h1, h2, h3, h4, h5, h6', headers => 
        headers.map(h => ({
          text: h.innerText.trim(),
          tag: h.tagName
        }))
      );
      
      console.log('Found headers:', headers);
      
      // Look for any error messages
      const errorMessages = await page.$$eval('.error, [class*="error"], [class*="alert"]', elements => 
        elements.map(el => ({
          text: el.innerText.trim(),
          class: el.className
        }))
      );
      
      if (errorMessages.length > 0) {
        console.log('Found error messages:', errorMessages);
        await saveScreenshot(page, '03-error-messages');
      }
      
      // Try to find refresh button if there's an error
      const refreshButton = await page.$$eval('button', buttons => 
        buttons.filter(btn => btn.innerText.includes('Refresh'))
          .map(btn => ({
            text: btn.innerText.trim(),
            x: btn.getBoundingClientRect().left,
            y: btn.getBoundingClientRect().top
          }))
      );
      
      if (refreshButton.length > 0) {
        console.log('Found refresh button:', refreshButton[0]);
        await page.mouse.click(refreshButton[0].x + 10, refreshButton[0].y + 10);
        await delay(3000);
        await saveScreenshot(page, '04-after-refresh');
      }
    }
    
    console.log('Test completed');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testRecipePage().catch(console.error);