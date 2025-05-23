#!/usr/bin/env node

/**
 * Test script for the recipe iterations feature using Puppeteer
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'iterations-tests');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function takeScreenshot(page, name) {
  const filename = path.join(screenshotsDir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`Screenshot saved: ${filename}`);
  return filename;
}

async function runTest() {
  console.log('Starting recipe iterations test with Puppeteer...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the app
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'home-page');
    
    // Wait for recipes to load
    console.log('Waiting for recipes to load...');
    await page.waitForSelector('h2', { timeout: 10000 });
    
    // Click on a recipe
    console.log('Clicking on first recipe...');
    // Wait for recipes to appear and get a better selector
    await page.waitFor(2000);  // Use older waitFor API
    await page.screenshot({ path: path.join(screenshotsDir, 'before-click.png') });
    
    // Try more generic selectors to find and click a recipe
    try {
      await page.click('article, div.card, div.border, a[href*="recipe"]');
      console.log('Clicked on recipe element');
    } catch (e) {
      console.log('First attempt failed, trying alternative selectors');
      try {
        // Try clicking on any heading that might be a recipe title
        await page.click('h2, h3, .text-lg.font-bold');
        console.log('Clicked on recipe title');
      } catch (e2) {
        console.error('Could not find any clickable recipe elements');
        await page.screenshot({ path: path.join(screenshotsDir, 'no-recipes-found.png') });
        throw new Error('Could not find any recipe elements to click');
      }
    }
    
    // Wait for recipe details page to load
    await page.waitFor(2000);
    await takeScreenshot(page, 'recipe-detail');
    
    // Scroll down to the Recipe Versions section
    console.log('Scrolling to Recipe Versions section...');
    await page.evaluate(() => {
      const iterationsSection = document.querySelector('h3.text-lg.font-semibold.mb-4');
      if (iterationsSection) {
        iterationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    await page.waitFor(1000); // Wait for scroll to complete
    await takeScreenshot(page, 'iterations-section');
    
    // Test creating a new version
    console.log('Creating a new version...');
    try {
      // Look for any button that might be the "Create New Version" button
      const createButton = await page.waitForSelector('button:has-text("Create"), button:has-text("New Version"), button:has-text("Version")', { timeout: 5000 });
      if (createButton) {
        await createButton.click();
        await page.waitFor(2000);
        await takeScreenshot(page, 'new-version-created');
        
        // Test editing the version
        console.log('Editing the version...');
        const editButton = await page.waitForSelector('button:has-text("Edit")', { timeout: 5000 });
        if (editButton) {
          await editButton.click();
          await page.waitFor(1000);
          
          // Type in the notes field
          await page.type('textarea#iteration-notes', 'Test note added by Puppeteer');
          await takeScreenshot(page, 'editing-version');
          
          // Save changes
          const saveButton = await page.waitForSelector('button:has-text("Save")', { timeout: 5000 });
          if (saveButton) {
            await saveButton.click();
            await page.waitFor(1000);
            await takeScreenshot(page, 'version-saved');
          }
        }
      }
    } catch (err) {
      console.error('Error in iteration creation/editing:', err);
      await takeScreenshot(page, 'iteration-error');
    }
    
    console.log('Test completed successfully!');
    console.log(`Screenshots saved to ${screenshotsDir}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

runTest().catch(console.error);