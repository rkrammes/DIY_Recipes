#!/usr/bin/env node

/**
 * Simplified test script for recipe iterations feature using Puppeteer
 * Works with older Puppeteer versions
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'iterations-tests');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function test() {
  console.log('Starting recipe iterations test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to app
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000');
    
    // Take screenshot of homepage
    console.log('Taking screenshot of homepage');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'home-page.png'),
      fullPage: true 
    });
    
    // Look for an h2 element to click (likely a recipe title)
    console.log('Looking for recipe to click...');
    await page.waitForSelector('h2', { timeout: 10000 });
    
    // Try clicking on a recipe
    try {
      await page.click('h2');
      console.log('Clicked on a recipe heading');
    } catch (e) {
      console.log('Could not click recipe heading, trying alternative selectors');
      await page.click('a, button, div');
      console.log('Clicked on alternative element');
    }
    
    // Wait a bit for page to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot of recipe detail page
    console.log('Taking screenshot of recipe detail page');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'recipe-detail.png'),
      fullPage: true 
    });
    
    // Check if recipe iterations section exists
    const iterationsExists = await page.evaluate(() => {
      // Look for headings with text containing "version" or "iteration"
      const heading = document.querySelector('h3, h4');
      return heading && (
        heading.textContent.toLowerCase().includes('version') || 
        heading.textContent.toLowerCase().includes('iteration')
      );
    });
    
    if (iterationsExists) {
      console.log('Recipe iterations section found!');
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'iterations-section-found.png'),
        fullPage: true 
      });
    } else {
      console.log('Recipe iterations section not found');
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'iterations-section-not-found.png'),
        fullPage: true 
      });
    }
    
    console.log('Test completed');
    console.log(`Screenshots saved to ${screenshotsDir}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

test().catch(console.error);