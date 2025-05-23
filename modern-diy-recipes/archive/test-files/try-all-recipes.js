// Test script to try all recipes one by one
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const APP_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots', 'all-recipes');

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

async function tryAllRecipes() {
  console.log('🧪 Testing all recipes to find ones with ingredients...');
  
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
    
    // Get all recipe cards
    const recipeCards = await page.$$('[data-testid="recipe-card"]');
    console.log(`Found ${recipeCards.length} recipe cards on the page`);
    
    // Try each recipe card
    const results = [];
    
    for (let i = 0; i < Math.min(recipeCards.length, 10); i++) {
      console.log(`\n----- Testing recipe #${i+1} -----`);
      
      // Go back to home page if needed
      if (page.url() !== APP_URL) {
        await page.goto(APP_URL, { waitUntil: 'networkidle2' });
        await page.waitForSelector('[data-testid="recipe-card"]', { timeout: 10000 });
      }
      
      // Get fresh list of cards
      const freshCards = await page.$$('[data-testid="recipe-card"]');
      
      // Click on this recipe
      console.log(`Clicking on recipe card #${i+1}...`);
      await freshCards[i].click();
      
      // Wait for recipe details page to load
      await page.waitForTimeout(2000);
      await captureScreenshot(page, `recipe-${i+1}`);
      
      // Get recipe title
      let recipeTitle = 'Unknown Recipe';
      try {
        recipeTitle = await page.$eval('h2.text-xl', el => el.textContent);
        console.log(`Recipe title: ${recipeTitle}`);
      } catch (e) {
        console.log('Could not get recipe title');
      }
      
      // Check for ingredients table
      let ingredientsFound = false;
      let ingredientsList = [];
      
      try {
        // Check if table exists
        const table = await page.$('table');
        if (table) {
          console.log('Found ingredients table');
          
          // Get rows
          const rows = await page.$$('table tbody tr');
          console.log(`Table has ${rows.length} rows`);
          
          // Extract ingredient data
          ingredientsList = await page.evaluate(() => {
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
          
          // Log ingredients
          console.log('Ingredients:');
          ingredientsList.forEach(ing => {
            console.log(`- ${ing.name}: ${ing.quantity} ${ing.unit}`);
          });
          
          // Check if we have real ingredients (not just "No ingredients available")
          ingredientsFound = ingredientsList.length > 0 && 
            !ingredientsList[0].name.includes('No ingredients available');
        } else {
          console.log('No ingredients table found');
        }
      } catch (e) {
        console.log('Error checking ingredients:', e.message);
      }
      
      // Store result
      results.push({
        recipeNum: i+1,
        title: recipeTitle,
        hasIngredients: ingredientsFound,
        ingredientCount: ingredientsList.length,
        firstIngredient: ingredientsList[0]?.name || 'None'
      });
      
      // Success if we found ingredients
      if (ingredientsFound) {
        console.log(`✅ SUCCESS! Found ingredients for "${recipeTitle}"`);
      } else {
        console.log(`❌ No actual ingredients found for "${recipeTitle}"`);
      }
    }
    
    // Print summary of all recipes
    console.log('\n----- SUMMARY OF ALL RECIPES -----');
    results.forEach(result => {
      const status = result.hasIngredients ? '✅' : '❌';
      console.log(`${status} Recipe #${result.recipeNum}: "${result.title}" - ${result.ingredientCount} ingredients (${result.firstIngredient})`);
    });
    
    // Final verdict
    const anyWithIngredients = results.some(r => r.hasIngredients);
    if (anyWithIngredients) {
      console.log('\n✅ SUCCESS! At least one recipe has ingredients displaying correctly.');
      console.log('The database fix worked!');
    } else {
      console.log('\n❓ All tested recipes show "No ingredients available".');
      console.log('The database structure was fixed, but there might not be data in the junction table.');
    }
    
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    // Close the browser after 10 seconds
    setTimeout(async () => {
      await browser.close();
    }, 10000);
  }
}

// Run the test
tryAllRecipes();