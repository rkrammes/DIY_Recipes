#!/usr/bin/env node

/**
 * Recipe Data Testing
 * 
 * This script tests that recipe data loads properly in the application,
 * including the recipe list and recipe details pages. It uses Puppeteer
 * to open the app and verify that recipe data displays correctly.
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Create directory for storing test artifacts
const TEST_OUTPUT_DIR = path.join(__dirname, 'test-artifacts', 'recipe-tests');

// Configuration
const config = {
  baseUrl: 'http://localhost:3000',
  testPages: {
    home: '/',
    recipeTest: '/recipe-test'
  },
  selectors: {
    recipeCard: '[data-testid="recipe-card"]',
    recipeTitle: '[data-testid="recipe-title"]',
    recipeIngredientTable: 'table tbody tr',
    mockDataIndicator: '[data-mock-data="true"]',
    recipesDebugInfo: '[data-testid="recipes-debug-info"]',
  },
  timeouts: {
    navigation: 30000,
    element: 5000
  }
};

/**
 * Main test function
 */
async function testRecipeData() {
  console.log('🧪 Starting recipe data tests with Puppeteer');
  
  let browser;
  try {
    // Create test output directory
    await fs.mkdir(TEST_OUTPUT_DIR, { recursive: true });
    console.log(`Created test output directory: ${TEST_OUTPUT_DIR}`);
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Browser launched');
    
    // Open new page
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    console.log('Page created with viewport: 1280x800');
    
    // Configure console logging
    page.on('console', msg => {
      console.log(`Browser console [${msg.type()}]: ${msg.text()}`);
    });
    
    // Results object for test summary
    const results = {
      homePageLoaded: false,
      recipesFound: 0,
      recipeDetailWorks: false,
      ingredientsDisplayed: false,
      mockDataWorking: false,
      screenshots: [],
      consoleErrors: []
    };
    
    // Test 1: Direct recipe test page
    console.log('🧪 Test 1: Checking direct recipe test page...');
    try {
      await page.goto(`${config.baseUrl}${config.testPages.recipeTest}`, { 
        waitUntil: 'networkidle2',
        timeout: config.timeouts.navigation
      });
      
      // Take screenshot
      await page.screenshot({ 
        path: path.join(TEST_OUTPUT_DIR, 'recipe-test-page.png'),
        fullPage: true
      });
      results.screenshots.push('recipe-test-page.png');
      
      try {
        // Wait for recipe cards
        await page.waitForSelector(config.selectors.recipeCard, { 
          timeout: config.timeouts.element
        });
        
        // Count recipe cards
        const recipeCards = await page.$$(config.selectors.recipeCard);
        const recipeTestCount = recipeCards.length;
        console.log(`Direct recipe test found ${recipeTestCount} recipes`);
        
        // If we found recipes on the test page, we'll consider testing successful
        if (recipeTestCount > 0) {
          results.recipesFound = recipeTestCount;
        }
      } catch (error) {
        console.error('Error on direct recipe test page:', error.message);
      }
    } catch (error) {
      console.error('Error loading recipe test page:', error.message);
    }
      
    // Test 2: Home page loads with recipe list
    console.log('🧪 Test 2: Checking home page for recipe list...');
    try {
      await page.goto(config.baseUrl, { 
        waitUntil: 'networkidle2',
        timeout: config.timeouts.navigation
      });
      results.homePageLoaded = true;
      
      // Take screenshot
      await page.screenshot({ 
        path: path.join(TEST_OUTPUT_DIR, 'home-page.png'),
        fullPage: true
      });
      results.screenshots.push('home-page.png');
      
      // Wait for recipe-related elements to appear
      try {
        // First wait for either a recipe card or the debug info (whichever appears first)
        const elementSelector = `${config.selectors.recipeCard}, ${config.selectors.recipesDebugInfo}`;
        await page.waitForSelector(elementSelector, { 
          timeout: config.timeouts.element
        });
        
        // Count recipe cards
        const recipeCards = await page.$$(config.selectors.recipeCard);
        results.recipesFound = recipeCards.length;
        console.log(`Recipe cards found: ${results.recipesFound}`);
        
        // Get recipe titles
        const recipeTitles = await page.evaluate((selector) => {
          const elements = Array.from(document.querySelectorAll(selector));
          return elements.map(el => el.textContent.trim());
        }, config.selectors.recipeTitle);
        
        console.log('Recipe titles:', recipeTitles);
        
        // Check for mock data indicator
        const mockDataIndicator = await page.$(config.selectors.mockDataIndicator);
        results.mockDataWorking = !!mockDataIndicator;
        console.log(`Mock data message found: ${results.mockDataWorking ? '✅ Yes' : '❌ No'}`);
        
        // If we found recipes, proceed to test recipe detail page
        if (recipeCards.length > 0) {
          // Test 2: Recipe detail page loads with ingredients
          console.log('🧪 Test 2: Checking recipe detail page...');
          
          // Click the first recipe card
          await recipeCards[0].click();
          
          // Wait for navigation to complete
          await page.waitForNavigation({ 
            waitUntil: 'networkidle2',
            timeout: config.timeouts.navigation
          });
          
          // Take screenshot of recipe detail page
          await page.screenshot({ 
            path: path.join(TEST_OUTPUT_DIR, 'recipe-detail.png'),
            fullPage: true
          });
          results.screenshots.push('recipe-detail.png');
          
          // Check if we're on a recipe detail page
          const currentUrl = page.url();
          results.recipeDetailWorks = currentUrl.includes('/recipes/');
          console.log(`Recipe detail navigation works: ${results.recipeDetailWorks ? '✅ Yes' : '❌ No'}`);
          
          // Wait for ingredient table to appear
          try {
            await page.waitForSelector(config.selectors.recipeIngredientTable, { 
              timeout: config.timeouts.element
            });
            
            // Count ingredients
            const ingredientRows = await page.$$(config.selectors.recipeIngredientTable);
            const ingredientCount = ingredientRows.length;
            results.ingredientsDisplayed = ingredientCount > 0;
            console.log(`Ingredients displayed: ${ingredientCount}`);
          } catch (error) {
            console.error('Error waiting for ingredient table:', error.message);
            results.ingredientsDisplayed = false;
          }
        }
      } catch (error) {
        console.error('Error finding recipe elements:', error.message);
        
        // Check if there's a message about no recipes found
        const pageContent = await page.content();
        if (pageContent.includes('No recipes found')) {
          console.log('Page indicates "No recipes found"');
        }
        
        // Check debug console output
        console.log('Checking browser console logs:');
        const logs = await page.evaluate(() => {
          return {
            consoleMessages: window.__consoleMessages || 'No captured messages',
            reactErrors: window.__reactErrors || 'No captured React errors'
          };
        });
        console.log('Console logs:', logs);
        
        // Take screenshot of failed state
        await page.screenshot({ 
          path: path.join(TEST_OUTPUT_DIR, 'no-recipes-found.png'),
          fullPage: true
        });
        results.screenshots.push('no-recipes-found.png');
      }
    } catch (error) {
      console.error('Error loading home page:', error.message);
      
      // Take screenshot of error state
      await page.screenshot({ 
        path: path.join(TEST_OUTPUT_DIR, 'home-page-error.png'),
        fullPage: true
      });
      results.screenshots.push('home-page-error.png');
    }
    
    // Print test summary
    console.log('\n=====================');
    console.log('📊 Test Summary');
    console.log('=====================');
    console.log(`Home page loaded: ${results.homePageLoaded ? '✅ Yes' : '❌ No'}`);
    console.log(`Recipe cards found: ${results.recipesFound}`);
    console.log(`Recipe detail works: ${results.recipeDetailWorks ? '✅ Yes' : '❌ No'}`);
    console.log(`Ingredients displayed: ${results.ingredientsDisplayed ? '✅ Yes' : '❌ No'}`);
    console.log(`Mock data working: ${results.mockDataWorking ? '✅ Yes' : '❌ No'}`);
    
    // Overall test result
    const testPassed = results.homePageLoaded && 
                       results.recipesFound > 0 && 
                       results.recipeDetailWorks && 
                       results.ingredientsDisplayed;
    
    console.log(`\nOverall Test Result: ${testPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    return {
      success: testPassed,
      results
    };
  } catch (error) {
    console.error('❌ Fatal error running tests:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    // Close browser
    if (browser) {
      await browser.close();
      console.log('Browser closed');
    }
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  testRecipeData().then(({ success }) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testRecipeData };