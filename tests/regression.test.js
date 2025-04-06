/**
 * @jest-environment jsdom
 */

import puppeteer from 'puppeteer';

// These tests require the app to be running locally
// They should be run with: npm test -- tests/regression.test.js
// Make sure to start the app with: npm start

describe('Regression Tests', () => {
  let browser;
  let page;
  
  // Set longer timeout for Puppeteer tests
  jest.setTimeout(30000);
  
  beforeAll(async () => {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
  });
  
  afterAll(async () => {
    // Close browser
    await browser.close();
  });
  
  beforeEach(async () => {
    // Navigate to the app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Wait for the app to load
    await page.waitForSelector('.page-wrapper');
  });
  
  test('App loads successfully with recipe list', async () => {
    // Check that the recipe list exists
    const recipeList = await page.$('#recipeList');
    expect(recipeList).toBeTruthy();
    
    // Check that the app title is displayed
    const appTitle = await page.$eval('.app-title', el => el.textContent);
    expect(appTitle).toContain('DIY Recipes');
  });
  
  test('Recipe selection displays recipe details', async () => {
    // Find the first recipe in the list
    const firstRecipe = await page.waitForSelector('.recipe-item');
    if (!firstRecipe) {
      console.log('No recipes found, skipping test');
      return;
    }
    
    // Get the recipe title before clicking
    const recipeTitle = await page.$eval('.recipe-item .recipe-title', el => el.textContent);
    
    // Click on the first recipe
    await firstRecipe.click();
    
    // Wait for recipe details to load
    await page.waitForSelector('#recipeDetailsView', { visible: true });
    
    // Check that the selected recipe title is displayed in the header
    const selectedTitle = await page.$eval('#selectedRecipeTitle', el => el.textContent);
    expect(selectedTitle).toBe(recipeTitle);
    
    // Check that the recipe details are displayed
    const detailsView = await page.$('#recipeDetailsView');
    expect(detailsView).toBeTruthy();
  });
  
  test('Collapsible sections expand and collapse', async () => {
    // Find a collapsible section
    const collapsible = await page.waitForSelector('.collapsible-container');
    if (!collapsible) {
      console.log('No collapsible sections found, skipping test');
      return;
    }
    
    // Get the initial state
    const initialState = await page.$eval('.collapsible-container', el => el.getAttribute('aria-expanded'));
    
    // Find and click the header
    const header = await collapsible.$('.collapsible-header');
    await header.click();
    
    // Check that the state changed
    const newState = await page.$eval('.collapsible-container', el => el.getAttribute('aria-expanded'));
    expect(newState).not.toBe(initialState);
    
    // Click again to toggle back
    await header.click();
    
    // Check that the state is back to the initial state
    const finalState = await page.$eval('.collapsible-container', el => el.getAttribute('aria-expanded'));
    expect(finalState).toBe(initialState);
  });
  
  test('Theme toggle changes appearance', async () => {
    // Find the theme toggle button
    const themeToggle = await page.waitForSelector('#btnThemeToggle');
    
    // Get the initial theme
    const initialTheme = await page.$eval('body', el => el.className);
    
    // Click the theme toggle
    await themeToggle.click();
    
    // Check that the theme changed
    const newTheme = await page.$eval('body', el => el.className);
    expect(newTheme).not.toBe(initialTheme);
    
    // Click again to toggle back
    await themeToggle.click();
    
    // Check that the theme is back to the initial theme
    const finalTheme = await page.$eval('body', el => el.className);
    expect(finalTheme).toBe(initialTheme);
  });
  
  test('Global ingredients list displays correctly', async () => {
    // Find and click the All Ingredients button to ensure the section is visible
    const ingredientsButton = await page.waitForSelector('#btnIngredients');
    await ingredientsButton.click();
    
    // Wait for the global ingredients list to be visible
    await page.waitForSelector('#globalIngredientList');
    
    // Check that the global ingredients list exists
    const ingredientsList = await page.$('#globalIngredientList');
    expect(ingredientsList).toBeTruthy();
    
    // Check if there are ingredients or the "No global ingredients found" message
    const ingredientsContent = await page.$eval('#globalIngredientList', el => el.innerHTML);
    
    // Either there are ingredient items or a message about no ingredients
    expect(
      ingredientsContent.includes('ingredient-item') || 
      ingredientsContent.includes('No global ingredients found')
    ).toBe(true);
  });
  
  test('Responsive layout adapts to different screen sizes', async () => {
    // Test desktop layout (already set in beforeEach)
    const desktopColumnCount = await page.$$eval('.content-grid > div', columns => columns.length);
    
    // Check that we have the three-column layout
    expect(desktopColumnCount).toBe(3);
    
    // Test tablet layout
    await page.setViewport({ width: 768, height: 800 });
    await page.waitForTimeout(500); // Wait for layout to adjust
    
    // Check column visibility in tablet mode
    const tabletLeftColumnDisplay = await page.$eval('#left-column', el => getComputedStyle(el).display);
    const tabletMiddleColumnDisplay = await page.$eval('#middle-column', el => getComputedStyle(el).display);
    const tabletRightColumnDisplay = await page.$eval('#right-column', el => getComputedStyle(el).display);
    
    // Verify tablet layout (specifics depend on your responsive design)
    expect([tabletLeftColumnDisplay, tabletMiddleColumnDisplay, tabletRightColumnDisplay].filter(d => d !== 'none').length).toBeGreaterThanOrEqual(1);
    
    // Test mobile layout
    await page.setViewport({ width: 375, height: 800 });
    await page.waitForTimeout(500); // Wait for layout to adjust
    
    // Check column visibility in mobile mode
    const mobileLeftColumnDisplay = await page.$eval('#left-column', el => getComputedStyle(el).display);
    const mobileMiddleColumnDisplay = await page.$eval('#middle-column', el => getComputedStyle(el).display);
    const mobileRightColumnDisplay = await page.$eval('#right-column', el => getComputedStyle(el).display);
    
    // Verify mobile layout (specifics depend on your responsive design)
    // In mobile, we typically stack columns or hide some
    expect([mobileLeftColumnDisplay, mobileMiddleColumnDisplay, mobileRightColumnDisplay].filter(d => d !== 'none').length).toBeGreaterThanOrEqual(1);
  });
});