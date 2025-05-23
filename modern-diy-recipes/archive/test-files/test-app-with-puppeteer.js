// Simple test script to check if recipe ingredients are displaying properly
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const APP_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-artifacts', 'recipe-tests');

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
    // Create a page and setup console log capturing
    const page = await browser.newPage();
    
    page.on('console', message => {
      const type = message.type();
      console.log(`[Browser Console] [${type}] ${message.text()}`);
    });
    
    // Navigate to the app
    console.log('Navigating to the app...');
    await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Take a screenshot of the home page
    await captureScreenshot(page, 'home-page');
    
    // Check if any recipe cards are displayed
    const recipeCards = await page.$$('[data-testid="recipe-card"]');
    
    if (recipeCards.length === 0) {
      console.log('❌ No recipe cards found on the page');
      await captureScreenshot(page, 'no-recipes-found');
      return false;
    }
    
    console.log(`✅ Found ${recipeCards.length} recipe cards on the page`);
    
    // Click on the first recipe card to view its details
    console.log('Clicking on the first recipe card...');
    await recipeCards[0].click();
    
    // Wait for recipe details to load
    await page.waitForTimeout(2000);
    await captureScreenshot(page, 'recipe-test-page');
    
    // Check if ingredients table is displayed
    const ingredientsHeading = await page.$('h3.text-lg.font-semibold');
    const ingredientsHeadingText = ingredientsHeading ? await page.evaluate(el => el.textContent, ingredientsHeading) : null;
    
    if (!ingredientsHeading || ingredientsHeadingText !== 'Ingredients') {
      console.log('❌ Ingredients heading not found on the page');
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
    
    // Check if ingredients are listed in the table
    const ingredientRows = await page.$$('table tbody tr');
    
    if (ingredientRows.length <= 1) {
      const tableContent = await page.evaluate(() => {
        return document.querySelector('table tbody').textContent;
      });
      
      if (tableContent.includes('No ingredients found')) {
        console.log('❌ Ingredients table shows "No ingredients found"');
        return false;
      }
    }
    
    console.log(`✅ Found ${ingredientRows.length} ingredients in the table`);
    
    // Extract ingredient details for verification
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
    
    return ingredients.length > 0;
  } catch (error) {
    console.error('Error during testing:', error);
    return false;
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Check if the app is already running
async function checkAppIsRunning() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(APP_URL, { timeout: 5000 });
    await browser.close();
    return true;
  } catch (error) {
    console.log('App is not running yet. Please start it with: npm run dev');
    return false;
  }
}

// Run the test
async function runTest() {
  if (await checkAppIsRunning()) {
    const result = await testRecipeIngredientsDisplay();
    if (result) {
      console.log('\n✅ SUCCESS! Recipe ingredients are being displayed correctly.');
      console.log('The fix was successful!');
    } else {
      console.log('\n❌ TEST FAILED: Recipe ingredients are not being displayed correctly.');
      console.log('There might still be issues with the database or application.');
    }
  }
}

runTest();