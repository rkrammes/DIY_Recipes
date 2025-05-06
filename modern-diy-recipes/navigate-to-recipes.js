/**
 * Script to navigate directly to the recipes page/route
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create output directory
const outputDir = path.join(__dirname, 'test-artifacts', 'navigation');
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

async function navigateToRecipes() {
  console.log('Starting navigation test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 }
  });
  
  const page = await browser.newPage();
  
  try {
    // First try the main URL to see what we get
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000');
    await delay(3000);
    await saveScreenshot(page, '01-homepage');
    
    // Try the recipes route
    console.log('Trying /recipes route...');
    await page.goto('http://localhost:3000/recipes');
    await delay(3000);
    await saveScreenshot(page, '02-recipes-route');
    
    // Try other possible routes
    const routes = [
      '/recipe-test',
      '/minimal-test',
      '/stable-test',
      '/recipe-mcp-diagnostics',
      '/recipes/1', 
      '/app/recipes'
    ];
    
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      console.log(`Trying ${route} route...`);
      await page.goto(`http://localhost:3000${route}`);
      await delay(3000);
      await saveScreenshot(page, `03-${i+1}-${route.replace(/\//g, '-')}`);
    }
    
    // Try clicking on the recipe or ingredient navigation items if they exist
    console.log('Navigating back to homepage to try clicking navigation items...');
    await page.goto('http://localhost:3000');
    await delay(3000);
    
    // Look for recipe/ingredient navigation items
    const navResult = await page.evaluate(() => {
      // Try to find and click any recipe-related navigation elements
      const possibleNavItems = [
        ...document.querySelectorAll('a[href*="recipe"]'),
        ...document.querySelectorAll('a[href*="ingredient"]'),
        ...document.querySelectorAll('nav a'),
        ...document.querySelectorAll('*[class*="recipe"]'),
        ...document.querySelectorAll('button:has-text("Recipe")'),
        ...document.querySelectorAll('li:has-text("Recipe")'),
        ...document.querySelectorAll('*:has-text("Recipes")'),
      ];
      
      // Filter to visible elements
      const visibleItems = possibleNavItems.filter(el => {
        // Check if element is visible
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      });
      
      if (visibleItems.length > 0) {
        // Click the first visible navigation item
        visibleItems[0].click();
        return {
          clicked: true,
          element: {
            tag: visibleItems[0].tagName,
            text: visibleItems[0].textContent.trim().substring(0, 30),
            href: visibleItems[0].href || 'none'
          }
        };
      }
      
      return { clicked: false };
    });
    
    console.log('Navigation result:', navResult);
    
    if (navResult.clicked) {
      await delay(3000);
      await saveScreenshot(page, '04-after-nav-click');
    }
    
    console.log('Navigation test completed');
    
  } catch (error) {
    console.error('Error during navigation test:', error);
  } finally {
    await browser.close();
  }
}

navigateToRecipes().catch(console.error);