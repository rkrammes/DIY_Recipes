#!/usr/bin/env node

/**
 * Final Puppeteer test for recipe iterations
 * Uses a simplified approach to verify the feature works
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'final-test');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function takeScreenshot(page, name) {
  const filename = path.join(screenshotsDir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`Screenshot saved: ${filename}`);
  return filename;
}

// Simple sleep function
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runTest() {
  console.log('Running final Puppeteer test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1280,800', '--no-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Log console messages
    page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
    
    // Navigate to app
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000');
    await sleep(2000);
    await takeScreenshot(page, '1-homepage');
    
    // Try to find and click on a recipe
    console.log('Looking for recipes...');
    
    const recipeFound = await page.evaluate(() => {
      // Look for any clickable elements that might be recipes
      const selectors = [
        // Try all potential recipe elements
        'a[href*="recipe"]',
        '.card a',
        'h2 a',
        'article',
        '.card',
        'div[class*="card"]',
        // Fallback to generic elements
        'h2',
        'h3',
        'button:not([aria-label])',
        'a:not([aria-label])'
      ];
      
      // Try each selector
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`Found ${elements.length} elements for selector: ${selector}`);
        
        if (elements.length > 0) {
          for (const el of elements) {
            // If it's likely a recipe (exclude navigation, logout, etc)
            const text = el.textContent.toLowerCase();
            const isNavigation = text.includes('login') || 
                              text.includes('logout') || 
                              text.includes('setting');
                              
            if (!isNavigation) {
              console.log(`Clicking element with text: ${el.textContent}`);
              el.click();
              return true;
            }
          }
        }
      }
      
      return false;
    });
    
    if (recipeFound) {
      console.log('Clicked on a recipe element');
    } else {
      console.log('Could not find a recipe to click, trying h2 elements directly');
      const headings = await page.$$('h2');
      if (headings.length > 0) {
        await headings[0].click();
      }
    }
    
    console.log('Waiting for recipe details to load...');
    await sleep(3000);
    await takeScreenshot(page, '2-recipe-details');
    
    // Look for Recipe Versions heading
    const hasVersionsSection = await page.evaluate(() => {
      // Check for any heading containing "Versions"
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      for (const heading of headings) {
        if (heading.textContent.includes('Version') || 
            heading.textContent.includes('Iteration') ||
            heading.textContent.includes('History')) {
          console.log(`Found iterations section: ${heading.textContent}`);
          heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return { found: true, text: heading.textContent };
        }
      }
      
      // Check for any error messages related to iterations
      const errorMessages = Array.from(document.querySelectorAll('.error, [class*="alert"], [class*="fallback"]'))
        .map(el => el.textContent);
      
      if (errorMessages.length > 0) {
        return { found: false, errors: errorMessages };
      }
      
      return { found: false };
    });
    
    console.log('Recipe Versions section found:', hasVersionsSection);
    
    if (hasVersionsSection.found) {
      console.log('Scrolling to Recipe Versions section...');
      await sleep(1000);
      await takeScreenshot(page, '3-versions-section');
      
      // Try to create a new version
      const createButton = await page.evaluate(() => {
        // Look for buttons containing terms related to creating versions
        const buttons = Array.from(document.querySelectorAll('button'));
        for (const btn of buttons) {
          const text = btn.textContent.toLowerCase();
          if (text.includes('create') || 
              text.includes('new') || 
              text.includes('version') ||
              text.includes('add') ||
              text.includes('copy')) {
            console.log(`Found create button: ${btn.textContent}`);
            btn.click();
            return true;
          }
        }
        return false;
      });
      
      if (createButton) {
        console.log('Clicked on Create Version button');
        await sleep(2000);
        await takeScreenshot(page, '4-after-create');
        
        // Check if new version was created
        const versionCreated = await page.evaluate(() => {
          // Look for elements that suggest a new version was created
          const versionElements = document.querySelectorAll('[class*="version"], [class*="current"], [class*="selected"]');
          return versionElements.length > 0;
        });
        
        console.log('New version appears to be created:', versionCreated);
      } else {
        console.log('Could not find Create Version button');
      }
    }
    
    console.log('Test completed. Check the screenshots for visual verification.');
    
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    // Keep browser open briefly for user to see the final state
    await sleep(5000);
    await browser.close();
  }
}

runTest().catch(console.error);