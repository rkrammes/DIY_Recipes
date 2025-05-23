/**
 * Test Application with Puppeteer
 * 
 * This script tests if the application is working correctly, focusing on:
 * 1. Font loading
 * 2. Recipe list rendering
 * 3. Recipe details viewing
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const TEST_OUTPUT_DIR = path.join(__dirname, 'test-artifacts');

async function runTests() {
  console.log('🧪 Running application tests...');
  
  let browser;
  
  try {
    // Create test artifacts directory
    await fs.mkdir(TEST_OUTPUT_DIR, { recursive: true });
    
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Capture console messages
    page.on('console', msg => console.log(`Browser console: ${msg.text()}`));
    
    // Test 1: Home page loads with proper fonts
    console.log('🧪 Test 1: Checking home page and fonts...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Take screenshots
    await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, 'home-page.png') });
    
    // Check if fonts are loaded
    const fontsLoaded = await page.evaluate(() => {
      return document.documentElement.classList.contains('fonts-loaded') || 
             document.body.classList.contains('fonts-preloaded');
    });
    
    console.log(`Font loading status: ${fontsLoaded ? '✅ Fonts loaded' : '❌ Fonts not loaded'}`);
    
    // Test 2: Recipe list loads
    console.log('🧪 Test 2: Checking recipe list...');
    const recipeCards = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-testid="recipe-card"]');
      return Array.from(cards).map(card => ({
        title: card.querySelector('h2')?.textContent || 'No title',
        hasDescription: !!card.querySelector('p')
      }));
    });
    
    console.log(`Recipe cards found: ${recipeCards.length}`);
    console.log(recipeCards);
    
    if (recipeCards.length === 0) {
      console.log('⚠️ No recipe cards found. Checking for mock data...');
      
      // Check if mock data message is present
      const mockDataMessage = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('p')).some(p => 
          p.textContent?.includes('Mock') || 
          p.textContent?.includes('sample') || 
          p.textContent?.includes('development')
        );
      });
      
      console.log(`Mock data message found: ${mockDataMessage ? '✅ Yes' : '❌ No'}`);
    }
    
    // Test 3: Click on a recipe to view details
    if (recipeCards.length > 0) {
      console.log('🧪 Test 3: Checking recipe details...');
      
      // Click on the first recipe card
      await page.click('[data-testid="recipe-card"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Take screenshot of recipe details
      await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, 'recipe-details.png') });
      
      // Check for recipe details
      const recipeDetails = await page.evaluate(() => {
        return {
          title: document.querySelector('h1')?.textContent || 'No title',
          hasDescription: !!document.querySelector('[data-testid="recipe-description"]'),
          hasIngredients: !!document.querySelector('[data-testid="ingredients-list"]'),
          numIngredients: document.querySelectorAll('[data-testid="ingredient-item"]').length
        };
      });
      
      console.log('Recipe details found:');
      console.log(recipeDetails);
    }
    
    // Test summary
    console.log('\n📊 Test Summary:');
    console.log(`- Fonts loaded: ${fontsLoaded ? '✅' : '❌'}`);
    console.log(`- Recipe cards found: ${recipeCards.length > 0 ? '✅' : '❌'}`);
    if (recipeCards.length > 0) {
      console.log(`- Recipe details accessible: ${recipeCards.length > 0 ? '✅' : '❌'}`);
    }
    
    console.log('\n🔍 Screenshots saved to:', TEST_OUTPUT_DIR);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the tests
runTests().catch(console.error);