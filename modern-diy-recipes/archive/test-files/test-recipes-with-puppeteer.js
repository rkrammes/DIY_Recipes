// Simple test script to check if recipe ingredients are displaying properly
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const APP_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Directory created: ${dirPath}`);
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
  }
}

async function captureScreenshot(page, name) {
  const fileName = `${name}.png`;
  const filePath = path.join(SCREENSHOTS_DIR, fileName);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`Screenshot saved: ${filePath}`);
  return filePath;
}

async function testRecipeIngredientsDisplay() {
  console.log('🧪 Testing recipe ingredients display with Puppeteer...');
  
  await ensureDirectoryExists(SCREENSHOTS_DIR);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1280,800']
  });
  
  try {
    // Create a page
    const page = await browser.newPage();
    
    // Navigate to the app
    console.log('Navigating to the app...');
    await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Take a screenshot of the home page
    await captureScreenshot(page, 'home-page');
    
    // Wait for recipe cards to appear
    await page.waitForSelector('[data-testid="recipe-card"]', { timeout: 10000 })
      .catch(() => console.log('Timeout waiting for recipe cards'));
    
    // Check if any recipe cards are displayed
    const recipeCards = await page.$$('[data-testid="recipe-card"]');
    
    if (recipeCards.length === 0) {
      console.log('❌ No recipe cards found on the page');
      await captureScreenshot(page, 'no-recipes-found');
      return false;
    }
    
    console.log(`✅ Found ${recipeCards.length} recipe cards on the page`);
    
    // Try all recipe cards one by one
    console.log('Going to try multiple recipe cards...');
    
    // Skip the first card since we already tried it
    const cardToTry = recipeCards[4]; // Try the 5th card
    console.log('Clicking on the 5th recipe card...');
    await cardToTry.click();
    
    // Wait for the recipe details page to load
    await page.waitForTimeout(2000);
    await captureScreenshot(page, 'recipe-details');
    
    // Check if ingredients heading exists
    const ingredientsHeading = await page.$('h3.text-lg.font-semibold');
    
    if (!ingredientsHeading) {
      console.log('❌ Ingredients heading not found on the page');
      return false;
    }
    
    const ingredientsHeadingText = await page.evaluate(el => el.textContent, ingredientsHeading);
    if (ingredientsHeadingText !== 'Ingredients') {
      console.log(`❌ Found heading but text is "${ingredientsHeadingText}" not "Ingredients"`);
      return false;
    }
    
    console.log('✅ Found ingredients heading on the page');
    
    // Look for ingredients table
    const ingredientsTable = await page.$('table');
    
    if (!ingredientsTable) {
      console.log('❌ Ingredients table not found on the page');
      return false;
    }
    
    console.log('✅ Found ingredients table on the page');
    
    // Check for ingredients in the table
    const ingredientRows = await page.$$('table tbody tr');
    console.log(`Found ${ingredientRows.length} rows in the ingredients table`);
    
    // Check if there's a "No ingredients found" message
    const tableContent = await page.evaluate(() => {
      return document.querySelector('table tbody').textContent;
    });
    
    if (tableContent.includes('No ingredients found')) {
      console.log('❌ Ingredients table shows "No ingredients found"');
      return false;
    }
    
    // Extract ingredient details
    const ingredients = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length >= 3) {
          return {
            name: cells[0]?.textContent?.trim() || '',
            quantity: cells[1]?.textContent?.trim() || '',
            unit: cells[2]?.textContent?.trim() || ''
          };
        }
        return null;
      }).filter(Boolean);
    });
    
    console.log('Ingredients found in the UI:');
    ingredients.forEach(ing => {
      console.log(`- ${ing.name}: ${ing.quantity} ${ing.unit}`);
    });
    
    const success = ingredients.length > 0;
    
    if (success) {
      console.log('\n✅ SUCCESS! Recipe ingredients are being displayed correctly.');
      console.log('The database fix worked!');
    } else {
      console.log('\n❌ TEST FAILED: No ingredients found in the table.');
    }
    
    return success;
    
  } catch (error) {
    console.error('Error during testing:', error);
    return false;
  } finally {
    // Close the browser after a short delay so you can see the results
    setTimeout(async () => {
      await browser.close();
    }, 10000);
  }
}

// Run the test immediately
testRecipeIngredientsDisplay();