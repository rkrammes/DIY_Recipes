#!/usr/bin/env node

/**
 * Recipe Ingredient Diagnosis Tool
 * 
 * This script uses Puppeteer to:
 * 1. Connect to the app
 * 2. Click on recipes and inspect the data flow
 * 3. Connect to Supabase MCP to check database tables
 * 4. Diagnose why ingredients aren't showing up
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const APP_URL = 'http://localhost:3000';
const SUPABASE_MCP_URL = 'http://localhost:3000/supabase-mcp';
const SCREENSHOTS_DIR = path.join(__dirname, 'diagnosis-screenshots');

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Directory created: ${dirPath}`);
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
  }
}

async function captureScreenshot(page, name) {
  const fileName = `${name}-${Date.now()}.png`;
  const filePath = path.join(SCREENSHOTS_DIR, fileName);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`Screenshot saved: ${filePath}`);
  return filePath;
}

async function diagnoseRecipeIngredients() {
  console.log('🔍 Starting recipe ingredients diagnosis...');
  
  await ensureDirectoryExists(SCREENSHOTS_DIR);
  
  // Launch browser with DevTools open for debugging
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1920,1080'],
    devtools: true
  });
  
  try {
    // Create a page and setup console log capturing
    const page = await browser.newPage();
    
    page.on('console', message => {
      const type = message.type();
      console.log(`[Browser Console] [${type}] ${message.text()}`);
    });
    
    // Enable request/response logging
    page.on('response', async (response) => {
      const url = response.url();
      // Only log API requests to Supabase
      if (url.includes('supabase') && !url.includes('auth')) {
        const status = response.status();
        const contentType = response.headers()['content-type'] || '';
        
        try {
          let responseData = '';
          if (contentType.includes('application/json')) {
            responseData = await response.json().catch(() => 'Failed to parse JSON');
          } else {
            responseData = await response.text().catch(() => 'Failed to parse text');
          }
          
          console.log(`[Network] ${status} ${url.substring(0, 100)}...`);
          if (status >= 400) {
            console.error(`[Network Error] ${JSON.stringify(responseData).substring(0, 200)}...`);
          }
        } catch (error) {
          console.log(`[Network] ${status} ${url} (error parsing response)`);
        }
      }
    });
    
    // Navigate to the app
    console.log('Navigating to the app...');
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
    
    // Take a screenshot of the initial page
    await captureScreenshot(page, 'initial-page');
    
    // Wait for recipes to load
    await page.waitForSelector('[data-testid="recipe-card"]', { timeout: 5000 })
      .catch(() => console.log('No recipe cards found on the page'));
    
    // Get all recipe cards
    const recipeCards = await page.$$('[data-testid="recipe-card"]');
    
    if (recipeCards.length === 0) {
      console.log('No recipes found on the page. Please check if recipes are loading correctly.');
      await captureScreenshot(page, 'no-recipes');
    } else {
      console.log(`Found ${recipeCards.length} recipes`);
      
      // Click on the first recipe
      console.log('Clicking on the first recipe...');
      await recipeCards[0].click();
      
      // Wait for recipe details to load
      await page.waitForTimeout(1000);
      await captureScreenshot(page, 'recipe-details');
      
      // Check if ingredients are loaded
      const ingredientsTable = await page.$('table');
      
      if (!ingredientsTable) {
        console.log('No ingredients table found for the selected recipe.');
        await captureScreenshot(page, 'no-ingredients-table');
      } else {
        // Check the actual content
        const ingredientRows = await page.$$('table tbody tr');
        console.log(`Found ${ingredientRows.length} ingredient rows`);
        
        if (ingredientRows.length <= 1) {
          console.log('No ingredients data in the table or only empty row');
          
          // Click the refresh button to check if it helps
          const refreshButton = await page.$('button[title="Refresh ingredients list"]');
          if (refreshButton) {
            console.log('Clicking refresh ingredients button...');
            await refreshButton.click();
            await page.waitForTimeout(1000);
            await captureScreenshot(page, 'after-refresh');
          }
        } else {
          console.log('Ingredients are present in the selected recipe');
        }
      }
      
      // Get diagnostics from browser
      const recipeData = await page.evaluate(() => {
        return {
          consoleErrors: window._consoleErrors || [],
          recipeInfo: window.__recipeInfo || null,
          renderedIngredients: Array.from(document.querySelectorAll('table tbody tr')).map(row => {
            return {
              name: row.cells[0]?.textContent?.trim() || 'N/A',
              quantity: row.cells[1]?.textContent?.trim() || 'N/A',
              unit: row.cells[2]?.textContent?.trim() || 'N/A'
            };
          })
        };
      });
      
      console.log('Recipe Data from Browser:');
      console.log('Rendered Ingredients:', recipeData.renderedIngredients);
      
      // Now go to Supabase MCP to examine database tables
      console.log('\nNavigating to Supabase MCP to examine database tables...');
      await page.goto(SUPABASE_MCP_URL, { waitUntil: 'networkidle2' });
      await captureScreenshot(page, 'supabase-mcp');
      
      // Connect to MCP
      const connectButton = await page.$('button:has-text("Connect")');
      if (connectButton) {
        console.log('Connecting to Supabase MCP...');
        await connectButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Check tables structure
      // Go to SQL query tab
      const queryTab = await page.$('button:has-text("Custom Query")');
      if (queryTab) {
        console.log('Switching to SQL query tab...');
        await queryTab.click();
        
        // Query to examine the database structure
        const tableInfoQuery = `
          SELECT 
            table_name,
            column_name,
            data_type
          FROM 
            information_schema.columns
          WHERE 
            table_schema = 'public'
          ORDER BY
            table_name, ordinal_position;
        `;
        
        // Enter the query
        await page.evaluate((query) => {
          const textarea = document.querySelector('textarea');
          if (textarea) textarea.value = query;
        }, tableInfoQuery);
        
        // Execute the query
        const executeButton = await page.$('button:has-text("Execute Query")');
        if (executeButton) {
          console.log('Executing database structure query...');
          await executeButton.click();
          await page.waitForTimeout(2000);
          await captureScreenshot(page, 'db-structure-query');
        }
        
        // Check recipe_ingredients junction table
        const recipeIngredientsQuery = `
          SELECT * FROM recipe_ingredients LIMIT 10;
        `;
        
        await page.evaluate((query) => {
          const textarea = document.querySelector('textarea');
          if (textarea) textarea.value = query;
        }, recipeIngredientsQuery);
        
        if (executeButton) {
          console.log('Executing recipe_ingredients query...');
          await executeButton.click();
          await page.waitForTimeout(2000);
          await captureScreenshot(page, 'recipe-ingredients-query');
        }
        
        // Then look at specific recipes with ingredients
        const specificRecipeQuery = `
          SELECT 
            r.id as recipe_id, 
            r.title as recipe_title,
            ri.id as junction_id,
            ri.ingredient_id,
            ri.quantity,
            ri.unit,
            i.name as ingredient_name,
            i.description as ingredient_description
          FROM 
            recipes r
          LEFT JOIN 
            recipe_ingredients ri ON r.id = ri.recipe_id
          LEFT JOIN 
            ingredients i ON ri.ingredient_id = i.id
          LIMIT 20;
        `;
        
        await page.evaluate((query) => {
          const textarea = document.querySelector('textarea');
          if (textarea) textarea.value = query;
        }, specificRecipeQuery);
        
        if (executeButton) {
          console.log('Executing detailed recipe join query...');
          await executeButton.click();
          await page.waitForTimeout(2000);
          await captureScreenshot(page, 'recipe-join-query');
        }
      }
    }
    
    console.log('\n✅ Diagnosis complete! Screenshots saved to:', SCREENSHOTS_DIR);
    console.log('Please check the screenshots and console output to diagnose the issue with recipe ingredients.');
    
  } catch (error) {
    console.error('Error during diagnosis:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Run the diagnosis if this file is executed directly
if (require.main === module) {
  diagnoseRecipeIngredients()
    .then(() => console.log('Diagnosis script completed'))
    .catch(error => console.error('Diagnosis script failed:', error));
}

module.exports = { diagnoseRecipeIngredients };