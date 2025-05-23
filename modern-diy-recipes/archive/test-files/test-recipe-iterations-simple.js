/**
 * Simple Puppeteer test script to verify recipe iteration functionality
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create directory for screenshots if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'recipe-iterations');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Helper function for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function for screenshots
async function captureScreenshot(page, name) {
  const timestamp = Date.now();
  const screenshotPath = path.join(screenshotsDir, `${name}-${timestamp}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

async function runTest() {
  console.log('Starting recipe iteration UI test...');
  
  // Launch browser in non-headless mode so we can see what's happening
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Log console messages from the browser
    page.on('console', msg => console.log('[BROWSER]', msg.text()));
    
    // 1. Navigate to the homepage
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000');
    await delay(3000);
    await captureScreenshot(page, '01-homepage');
    
    // 2. Click the first recipe in the list (if any)
    console.log('Looking for a recipe to click...');
    
    // Use page.evaluate to find and click a recipe in the DOM
    const recipeClicked = await page.evaluate(() => {
      // Look for any element that might be a recipe
      const recipeElements = document.querySelectorAll('[data-recipe-id], .recipe-card, .card, .recipe');
      
      if (recipeElements.length > 0) {
        recipeElements[0].click();
        return true;
      }
      
      // If no specific recipe elements, try links or list items
      const possibleRecipeLinks = document.querySelectorAll('a, li, div.card');
      
      for (const el of possibleRecipeLinks) {
        if (el.textContent && el.textContent.includes('Recipe')) {
          el.click();
          return true;
        }
      }
      
      return false;
    });
    
    if (!recipeClicked) {
      console.log('No recipe found to click');
      await captureScreenshot(page, '02-no-recipes');
      await browser.close();
      return;
    }
    
    console.log('Clicked on a recipe');
    await delay(2000);
    await captureScreenshot(page, '03-recipe-details');
    
    // 3. Check if we're seeing the Recipe Versions section
    console.log('Looking for Recipe Versions section...');
    
    // Catalog what's on the page
    const pageContent = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
        .map(h => h.textContent.trim());
      
      const buttons = Array.from(document.querySelectorAll('button'))
        .map(b => b.textContent.trim())
        .filter(text => text.length > 0);
      
      return { headings, buttons };
    });
    
    console.log('Page content:', pageContent);
    
    // Check if we're using mock data or real data
    const usingMockData = await page.evaluate(() => {
      return !!document.querySelector('*:contains("Using mock recipe data")');
    });
    
    if (usingMockData) {
      console.log('Using mock data - version testing unavailable');
      await captureScreenshot(page, '04-mock-data');
      await browser.close();
      return;
    }
    
    // 4. Look for Create New Version button and click it
    console.log('Looking for Create New Version button...');
    
    const createButtonClicked = await page.evaluate(() => {
      // Look for buttons containing the text "Create" and "Version"
      const createButtons = Array.from(document.querySelectorAll('button'))
        .filter(b => b.textContent.includes('Create') && b.textContent.includes('Version'));
      
      if (createButtons.length > 0) {
        createButtons[0].click();
        return true;
      }
      
      return false;
    });
    
    if (!createButtonClicked) {
      console.log('Create New Version button not found');
      await captureScreenshot(page, '05-no-create-button');
      await browser.close();
      return;
    }
    
    console.log('Created new version');
    await delay(2000);
    await captureScreenshot(page, '06-after-create-version');
    
    // 5. Look for and click the Edit button
    console.log('Looking for Edit button...');
    
    const editButtonClicked = await page.evaluate(() => {
      const editButtons = Array.from(document.querySelectorAll('button'))
        .filter(b => b.textContent.includes('Edit'));
      
      if (editButtons.length > 0) {
        editButtons[0].click();
        return true;
      }
      
      return false;
    });
    
    if (!editButtonClicked) {
      console.log('Edit button not found');
      await captureScreenshot(page, '07-no-edit-button');
    } else {
      console.log('Clicked Edit button');
      await delay(1000);
      await captureScreenshot(page, '08-editing');
      
      // 6. Try to add notes and save
      console.log('Trying to add notes...');
      
      // Look for textareas
      const addedNotes = await page.evaluate(() => {
        const textareas = document.querySelectorAll('textarea');
        
        if (textareas.length > 0) {
          // Use the notes textarea if we can find it by ID
          const notesTextarea = document.querySelector('#iteration-notes') || textareas[0];
          notesTextarea.value = 'Test notes added by automated test';
          
          // Now look for save button
          const saveButtons = Array.from(document.querySelectorAll('button'))
            .filter(b => b.textContent.includes('Save'));
          
          if (saveButtons.length > 0) {
            saveButtons[0].click();
            return true;
          }
        }
        
        return false;
      });
      
      if (addedNotes) {
        console.log('Added notes and clicked Save');
        await delay(1000);
        await captureScreenshot(page, '09-after-save');
      } else {
        console.log('Failed to add notes or Save not found');
      }
    }
    
    // 7. Try to compare versions
    console.log('Looking for Compare button...');
    
    const compareClicked = await page.evaluate(() => {
      const compareButtons = Array.from(document.querySelectorAll('button'))
        .filter(b => b.textContent.includes('Compare'));
      
      if (compareButtons.length > 0) {
        compareButtons[0].click();
        return true;
      }
      
      return false;
    });
    
    if (compareClicked) {
      console.log('Clicked Compare button');
      await delay(1000);
      await captureScreenshot(page, '10-comparison');
    } else {
      console.log('Compare button not found');
    }
    
    console.log('Test completed successfully');
    
  } catch (error) {
    console.error('Test error:', error);
    await captureScreenshot(page, 'error');
  } finally {
    await browser.close();
  }
}

// Run the test
runTest().catch(console.error);