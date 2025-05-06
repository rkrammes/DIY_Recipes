#!/usr/bin/env node

/**
 * Debug script to test RecipeDetails component
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'debug-recipe-details');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function debugRecipeDetails() {
  console.log('Debugging RecipeDetails component...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 1024 },
    args: ['--no-sandbox']
  });
  
  let page;
  
  try {
    page = await browser.newPage();
    
    // Enable console logs from the page
    page.on('console', msg => console.log(`BROWSER: ${msg.type().toUpperCase()} - ${msg.text()}`));
    
    // Navigate to app
    console.log('Loading app...');
    await page.goto('http://localhost:3000');
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(screenshotsDir, 'home.png'), fullPage: true });
    
    // Inject debug code to help find and click a recipe
    await page.evaluate(() => {
      window.debugInfo = [];
      
      // Log info about recipe cards
      const recipeElements = document.querySelectorAll('article, div.card, div[data-recipe-id], a[href*="recipe"]');
      window.debugInfo.push(`Found ${recipeElements.length} potential recipe elements`);
      
      // Try to find and click the first recipe
      const links = Array.from(document.querySelectorAll('a'));
      const recipeLinks = links.filter(a => {
        const text = a.textContent.toLowerCase();
        const href = a.getAttribute('href') || '';
        return (
          text.includes('recipe') || 
          text.includes('beard') || 
          text.includes('soap') || 
          text.includes('wax') ||
          href.includes('recipe')
        );
      });
      
      window.debugInfo.push(`Found ${recipeLinks.length} recipe links`);
      
      if (recipeLinks.length > 0) {
        window.debugInfo.push(`Clicking link: ${recipeLinks[0].textContent} (${recipeLinks[0].getAttribute('href')})`);
        recipeLinks[0].click();
        return true;
      } else if (recipeElements.length > 0) {
        window.debugInfo.push(`Clicking element: ${recipeElements[0].tagName}`);
        recipeElements[0].click();
        return true;
      }
      
      return false;
    });
    
    // Get debug info from the page
    const debugInfo = await page.evaluate(() => window.debugInfo || []);
    console.log('Debug info:', debugInfo);
    
    // Wait for page load
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(screenshotsDir, 'after-click.png'), fullPage: true });
    
    // Scroll to find the Recipe Versions section
    await page.evaluate(() => {
      window.iterationInfo = [];
      
      // Find all h3 headings
      const headings = document.querySelectorAll('h3');
      window.iterationInfo.push(`Found ${headings.length} h3 headings`);
      
      for (const heading of headings) {
        window.iterationInfo.push(`Heading text: "${heading.textContent}"`);
        if (heading.textContent.includes('Recipe Version')) {
          window.iterationInfo.push('Recipe Versions section found!');
          heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true;
        }
      }
      
      // Look for error boundary messages
      const errorBoundaries = document.querySelectorAll('.p-4.border.border-alert-amber');
      for (const errorBoundary of errorBoundaries) {
        window.iterationInfo.push(`Error boundary text: "${errorBoundary.textContent}"`);
      }
      
      // Check if RecipeIterationManager is in DOM at all
      const anyIterationComponents = document.querySelector('[data-component="RecipeIterationManager"]');
      window.iterationInfo.push(`Iteration manager component found: ${anyIterationComponents !== null}`);
      
      return false;
    });
    
    // Get iteration info from the page
    const iterationInfo = await page.evaluate(() => window.iterationInfo || []);
    console.log('Iteration info:', iterationInfo);
    
    // Take screenshot of the current page state
    await page.screenshot({ path: path.join(screenshotsDir, 'recipe-details.png'), fullPage: true });
    
    // Try to find any errors in the page
    const errors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('.error, .error-message, [data-error]');
      return Array.from(errorElements).map(el => el.textContent);
    });
    
    if (errors.length > 0) {
      console.log('Errors found on page:', errors);
    }
    
    console.log('Debug complete');
    console.log(`Screenshots saved to ${screenshotsDir}`);
    
  } catch (error) {
    console.error('Debug failed:', error);
  } finally {
    if (page) {
      await page.close();
    }
    await browser.close();
  }
}

debugRecipeDetails().catch(console.error);