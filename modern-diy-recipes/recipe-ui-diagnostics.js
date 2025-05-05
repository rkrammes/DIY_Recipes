/**
 * Recipe UI Diagnostic Tool
 * 
 * A tool to diagnose UI issues with recipe rendering using Puppeteer MCP.
 * This will help identify why recipes aren't displaying correctly.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Configuration
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, 'diagnostics');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Helper to run a command and get output
async function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}: ${errorOutput}`));
      } else {
        resolve(output);
      }
    });
  });
}

// Launch browser and run tests
async function diagnoseRecipeUI() {
  console.log('Starting recipe UI diagnostics...');
  console.log(`Test URL: ${BASE_URL}`);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Use headless: false to see the browser for debugging
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set up console log capturing
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('recipe') || text.includes('Recipe') || 
          text.includes('ingredient') || text.includes('Ingredient') ||
          text.includes('error') || text.includes('Error')) {
        console.log(`Console [${msg.type()}]: ${text}`);
      }
    });

    // Navigate to homepage
    console.log('\n1. Checking homepage...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '1-homepage.png') });

    // Check if recipe list is present
    const recipeListExists = await page.evaluate(() => {
      const recipeElements = Array.from(document.querySelectorAll('[data-testid="recipe-card"]'));
      return {
        exists: recipeElements.length > 0,
        count: recipeElements.length,
        titles: recipeElements.map(el => {
          const titleEl = el.querySelector('[data-testid="recipe-title"]');
          return titleEl ? titleEl.textContent : 'Unknown';
        })
      };
    });

    console.log(`Recipe list present: ${recipeListExists.exists}`);
    console.log(`Recipe count: ${recipeListExists.count}`);
    if (recipeListExists.count > 0) {
      console.log('Recipe titles:');
      recipeListExists.titles.forEach((title, i) => {
        console.log(`  ${i+1}. ${title}`);
      });
    }

    // If there are no recipes, try checking for error messages
    if (!recipeListExists.exists || recipeListExists.count === 0) {
      const errorMessages = await page.evaluate(() => {
        const errorElements = Array.from(document.querySelectorAll('.text-red-500, .text-alert-red, [data-error="true"]'));
        return errorElements.map(el => el.textContent);
      });

      if (errorMessages.length > 0) {
        console.log('Error messages found:');
        errorMessages.forEach((msg, i) => {
          console.log(`  ${i+1}. ${msg}`);
        });
      }
    }

    // If recipes exist, click on the first one and check details
    if (recipeListExists.exists && recipeListExists.count > 0) {
      console.log('\n2. Clicking on first recipe to check details...');
      
      // Screenshot before clicking
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2-before-click.png') });
      
      // Click the first recipe
      await page.evaluate(() => {
        const firstRecipe = document.querySelector('[data-testid="recipe-card"]');
        if (firstRecipe) {
          console.log('Clicking recipe:', firstRecipe.querySelector('[data-testid="recipe-title"]')?.textContent);
          firstRecipe.click();
        }
      });
      
      // Wait for any navigation or content change
      await page.waitForTimeout(1000);
      
      // Screenshot after clicking
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3-after-click.png') });

      // Check recipe detail panel
      const recipeDetailExists = await page.evaluate(() => {
        // Look for recipe details section which could have various selectors
        const detailsElement = document.querySelector('.overflow-y-auto.h-full.bg-surface');
        
        if (!detailsElement) {
          return { exists: false };
        }
        
        // Find title, description, and ingredients
        const title = detailsElement.querySelector('h2')?.textContent || 'No title found';
        
        // Look for ingredients table
        const ingredientsTable = detailsElement.querySelector('table');
        const ingredientRows = ingredientsTable ? 
          Array.from(ingredientsTable.querySelectorAll('tbody tr')).map(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            return cells.length >= 3 ? {
              name: cells[0]?.textContent?.trim() || 'Unknown',
              quantity: cells[1]?.textContent?.trim() || 'Unknown',
              unit: cells[2]?.textContent?.trim() || 'Unknown'
            } : null;
          }).filter(Boolean) : [];
        
        // Check for any error messages in detail panel
        const errorMessages = Array.from(detailsElement.querySelectorAll('.text-red-500, .text-alert-red'))
          .map(el => el.textContent);
        
        return {
          exists: true,
          title,
          ingredientCount: ingredientRows.length,
          ingredients: ingredientRows,
          errors: errorMessages,
          innerHTML: detailsElement.innerHTML.substring(0, 500) + '...' // Truncated inner HTML for debugging
        };
      });

      console.log(`Recipe detail panel present: ${recipeDetailExists.exists}`);
      
      if (recipeDetailExists.exists) {
        console.log(`Recipe title: ${recipeDetailExists.title}`);
        console.log(`Ingredient count: ${recipeDetailExists.ingredientCount}`);
        
        if (recipeDetailExists.ingredientCount > 0) {
          console.log('Ingredients:');
          recipeDetailExists.ingredients.forEach((ing, i) => {
            console.log(`  ${i+1}. ${ing.name} - ${ing.quantity} ${ing.unit}`);
          });
        } else {
          console.log('No ingredients found in the detail view.');
        }
        
        if (recipeDetailExists.errors && recipeDetailExists.errors.length > 0) {
          console.log('Errors in detail panel:');
          recipeDetailExists.errors.forEach((err, i) => {
            console.log(`  ${i+1}. ${err}`);
          });
        }
        
        // For more advanced debugging, save some HTML content
        fs.writeFileSync(
          path.join(SCREENSHOT_DIR, '4-detail-panel-html.txt'), 
          recipeDetailExists.innerHTML
        );
      }
      
      // Take a focused screenshot of the detail panel
      const detailPanel = await page.$('.overflow-y-auto.h-full.bg-surface');
      if (detailPanel) {
        await detailPanel.screenshot({
          path: path.join(SCREENSHOT_DIR, '5-detail-panel.png')
        });
      }
    }

    // Check network requests
    console.log('\n3. Analyzing network requests...');
    const client = await page.target().createCDPSession();
    await client.send('Network.enable');
    
    const requests = [];
    client.on('Network.requestWillBeSent', request => {
      if (request.request.url.includes('/api/') || 
          request.request.url.includes('supabase')) {
        requests.push(request.request);
      }
    });
    
    // Refresh the page to capture network requests
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    console.log('API/Supabase requests:');
    requests.forEach((req, i) => {
      console.log(`  ${i+1}. ${req.method} ${req.url}`);
    });

    // Check browser console for errors
    console.log('\n4. Browser console errors:');
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    // Try clicking a recipe again to trigger any potential errors
    if (recipeListExists.exists && recipeListExists.count > 0) {
      await page.evaluate(() => {
        const recipes = document.querySelectorAll('[data-testid="recipe-card"]');
        if (recipes.length > 1) {
          recipes[1].click(); // Click the second recipe this time
        }
      });
      
      await page.waitForTimeout(1000);
    }
    
    if (jsErrors.length > 0) {
      console.log('JavaScript errors:');
      jsErrors.forEach((err, i) => {
        console.log(`  ${i+1}. ${err}`);
      });
    } else {
      console.log('  No JavaScript errors detected');
    }

    // Final detailed screenshot
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '6-final-state.png'),
      fullPage: true 
    });

    console.log('\nDiagnostic Summary:');
    console.log(`- Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log(`- Recipe list found: ${recipeListExists.exists ? 'Yes' : 'No'}`);
    console.log(`- Recipe count: ${recipeListExists.count}`);
    
    if (recipeListExists.exists && recipeListExists.count > 0) {
      console.log(`- Recipe details showing: ${recipeDetailExists.exists ? 'Yes' : 'No'}`);
      if (recipeDetailExists.exists) {
        console.log(`- Ingredients showing: ${recipeDetailExists.ingredientCount > 0 ? 'Yes' : 'No'}`);
      }
    }

  } catch (error) {
    console.error('Error during diagnosis:', error);
  } finally {
    await browser.close();
    console.log('\nDiagnostics complete');
  }
}

// Ensure the Next.js app is running
async function checkAppRunning() {
  try {
    const result = await fetch(BASE_URL);
    return result.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  try {
    console.log('Checking if Next.js app is running...');
    const isRunning = await checkAppRunning().catch(() => false);
    
    if (!isRunning) {
      console.log('Next.js app is not running. Please start it with "npm run dev" first.');
      process.exit(1);
    }
    
    await diagnoseRecipeUI();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the diagnostic
main();