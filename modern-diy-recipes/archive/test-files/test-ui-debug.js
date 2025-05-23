#!/usr/bin/env node

/**
 * Script to debug the UI for recipe iterations
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'debug-ui');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function debugUI() {
  console.log('Debugging recipe iterations UI...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 1024 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logs from the page
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    
    // Navigate to app
    console.log('Loading app...');
    await page.goto('http://localhost:3000');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot
    await page.screenshot({ path: path.join(screenshotsDir, 'home.png'), fullPage: true });
    
    // Look for the first recipe and click it
    console.log('Looking for recipe links...');
    
    // Check what elements are available to click
    const recipeElements = await page.evaluate(() => {
      const elements = [];
      // Log all headings
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
        elements.push({
          tag: el.tagName.toLowerCase(),
          text: el.textContent.trim(),
          clickable: el.closest('a, button') !== null
        });
      });
      
      // Log all links and buttons
      document.querySelectorAll('a, button').forEach(el => {
        elements.push({
          tag: el.tagName.toLowerCase(),
          text: el.textContent.trim(),
          href: el.href || null
        });
      });
      
      return elements;
    });
    
    console.log('Available elements:', recipeElements);
    
    // Click on the first heading or link that looks like a recipe
    const recipeFound = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h2, h3'));
      for (const heading of headings) {
        if (heading.textContent.length > 0) {
          heading.click();
          return true;
        }
      }
      
      const links = Array.from(document.querySelectorAll('a'));
      for (const link of links) {
        if (link.textContent.length > 0 && !link.textContent.includes('Login')) {
          link.click();
          return true;
        }
      }
      
      return false;
    });
    
    if (recipeFound) {
      console.log('Clicked on a recipe element');
    } else {
      console.log('Could not find a recipe to click');
    }
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot of recipe detail page
    await page.screenshot({ path: path.join(screenshotsDir, 'recipe-detail.png'), fullPage: true });
    
    // Check for error boundary content
    const errorBoundaryText = await page.evaluate(() => {
      const errorElements = Array.from(document.querySelectorAll('.p-4.border.border-alert-amber'));
      return errorElements.map(el => el.textContent.trim());
    });
    
    if (errorBoundaryText.length > 0) {
      console.log('Error boundary found with text:', errorBoundaryText);
    }
    
    // Check for console errors
    const errors = await page.evaluate(() => {
      return window.__ERRORS__ || [];
    });
    
    if (errors && errors.length > 0) {
      console.log('Browser errors found:', errors);
    }
    
    // Log the page structure to help debugging
    const pageStructure = await page.evaluate(() => {
      function getElementInfo(element, depth = 0) {
        if (!element) return null;
        
        const children = Array.from(element.children).map(child => 
          getElementInfo(child, depth + 1)
        ).filter(Boolean);
        
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id || null,
          classes: element.className ? element.className.split(' ').filter(Boolean) : [],
          text: element.textContent?.trim().substring(0, 50) || null,
          children: children.length > 0 ? children : null
        };
      }
      
      return getElementInfo(document.body, 0);
    });
    
    console.log('Page structure:', JSON.stringify(pageStructure, null, 2).substring(0, 1000) + '...');
    
    console.log('UI debugging complete');
    console.log(`Screenshots saved to ${screenshotsDir}`);
    
  } catch (error) {
    console.error('Debug failed:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('Browser will remain open for manual inspection. Press Ctrl+C to close.');
  }
}

debugUI().catch(console.error);