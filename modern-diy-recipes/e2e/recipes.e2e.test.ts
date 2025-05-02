import puppeteer from 'puppeteer';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

describe('DIY Recipes Modern App E2E Tests', () => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;

  // Set longer timeout for Puppeteer tests
  jest.setTimeout(60000);

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true, // Use true for standard headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    // Navigate to the modern app, assuming it runs on port 3001
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
  });

  afterEach(async () => {
    await page.close();
  });

  test('App loads successfully and displays recipe list', async () => {
    // Check that the recipe list container is present
    const recipeList = await page.waitForSelector('#recipeList', { visible: true });
    expect(recipeList).toBeTruthy();

    // Optional: Take a screenshot for visual regression
    const image = await page.screenshot();
    expect(image).toMatchImageSnapshot({
      customSnapshotIdentifier: 'initial-recipe-list',
      failureThreshold: 0.01,
      failureThresholdType: 'percent',
    });
  });

  // Add more E2E tests here for critical user flows:
  test('User can log in and log out', async () => {
    // Assuming a sign-in page at /signin
    await page.goto('http://localhost:3001/signin', { waitUntil: 'networkidle0' });

    // Assuming input fields with specific selectors for email and password
    // Replace with actual selectors
    const emailInputSelector = '#email';
    const passwordInputSelector = '#password';
    const loginButtonSelector = '#loginButton'; // Replace with actual selector

    // Wait for login form to be visible
    await page.waitForSelector(emailInputSelector, { visible: true });
    await page.waitForSelector(passwordInputSelector, { visible: true });
    await page.waitForSelector(loginButtonSelector, { visible: true });

    // Replace with actual test credentials
    const testEmail = 'testuser@example.com';
    const testPassword = 'password123';

    await page.type(emailInputSelector, testEmail);
    await page.type(passwordInputSelector, testPassword);

    // Click the login button
    await page.click(loginButtonSelector);

    // Wait for navigation to the main page after successful login
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    expect(page.url()).toBe('http://localhost:3001/'); // Assuming main page is at root

    // Assuming a logout button with a specific selector
    const logoutButtonSelector = '#logoutButton'; // Replace with actual selector
    await page.waitForSelector(logoutButtonSelector, { visible: true });

    // Click the logout button
    await page.click(logoutButtonSelector);

    // Wait for navigation back to the sign-in page after logout
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    expect(page.url()).toBe('http://localhost:3001/signin');
  });

  test('Viewing Recipe Details', async () => {
    // Assuming the user is already logged in and on the main page
    // Select the first recipe in the list
    const firstRecipeSelector = '.recipe-item:first-child'; // Replace with actual selector for a recipe item
    await page.waitForSelector(firstRecipeSelector, { visible: true });
    await page.click(firstRecipeSelector);

    // Wait for the recipe details view to load
    const recipeDetailsViewSelector = '#recipeDetailsView'; // Replace with actual selector for recipe details container
    await page.waitForSelector(recipeDetailsViewSelector, { visible: true });

    // Check if key elements of the recipe details are visible
    // Replace with actual selectors for title, description, ingredients, steps
    expect(await page.$(recipeDetailsViewSelector + ' h2')).toBeTruthy();
    expect(await page.$(recipeDetailsViewSelector + ' .recipe-description')).toBeTruthy();
    expect(await page.$(recipeDetailsViewSelector + ' .ingredient-list')).toBeTruthy();
    expect(await page.$(recipeDetailsViewSelector + ' .step-list')).toBeTruthy();
  });

  test('Adding a New Recipe', async () => {
    // Assuming the user is already logged in and on the main page
    // Assuming a button to open the add recipe form
    const addRecipeButtonSelector = '#addRecipeButton'; // Replace with actual selector
    await page.waitForSelector(addRecipeButtonSelector, { visible: true });
    await page.click(addRecipeButtonSelector);

    // Assuming the recipe form appears in a modal or on a new page
    const recipeFormSelector = '#recipeForm'; // Replace with actual selector for the form
    await page.waitForSelector(recipeFormSelector, { visible: true });

    // Fill in the form fields
    // Replace with actual selectors for title, description, ingredient inputs, etc.
    const titleInputSelector = recipeFormSelector + ' input[placeholder="Title"]';
    const descriptionTextareaSelector = recipeFormSelector + ' textarea[placeholder="Description"]';
    const addIngredientButtonSelector = recipeFormSelector + ' #addIngredientButton'; // Replace with actual selector
    const saveRecipeButtonSelector = recipeFormSelector + ' #saveRecipeButton'; // Replace with actual selector

    await page.type(titleInputSelector, 'New Test Recipe');
    await page.type(descriptionTextareaSelector, 'This is a new recipe for testing.');

    // Add an ingredient (assuming a simple ingredient structure in the form)
    await page.click(addIngredientButtonSelector);
    // Assuming selectors for the newly added ingredient row's inputs
    const ingredientNameInputSelector = recipeFormSelector + ' .ingredient-row:last-child input[placeholder="Name"]'; // Replace
    const ingredientQuantityInputSelector = recipeFormSelector + ' .ingredient-row:last-child input[placeholder="Qty"]'; // Replace
    const ingredientUnitInputSelector = recipeFormSelector + ' .ingredient-row:last-child input[placeholder="Unit"]'; // Replace

    await page.type(ingredientNameInputSelector, 'Test Ingredient');
    await page.type(ingredientQuantityInputSelector, '10');
    await page.type(ingredientUnitInputSelector, 'g');

    // Click save
    await page.click(saveRecipeButtonSelector);

    // Wait for the form to disappear or for the new recipe to appear in the list
    await page.waitForSelector(recipeFormSelector, { hidden: true });
    // Verify the new recipe appears in the list (might need to wait for data fetch)
    await page.waitForSelector('.recipe-item', { visible: true }); // Wait for at least one recipe item
    const newRecipeTitle = await page.evaluate(() => {
      const recipeItems = Array.from(document.querySelectorAll('.recipe-item .recipe-title')); // Replace selector
      return recipeItems.map(item => item.textContent).find(text => text === 'New Test Recipe');
    });
    expect(newRecipeTitle).toBe('New Test Recipe');
  });

  test('Editing an Existing Recipe', async () => {
    // Assuming the user is already logged in and on the main page
    // Select the first recipe
    const firstRecipeSelector = '.recipe-item:first-child'; // Replace
    await page.waitForSelector(firstRecipeSelector, { visible: true });
    await page.click(firstRecipeSelector);

    // Wait for details to load and click the edit button
    const editRecipeButtonSelector = '#editRecipeButton'; // Replace
    await page.waitForSelector(editRecipeButtonSelector, { visible: true });
    await page.click(editRecipeButtonSelector);

    // Wait for the form to appear
    const recipeFormSelector = '#recipeForm'; // Replace
    await page.waitForSelector(recipeFormSelector, { visible: true });

    // Modify the title
    const titleInputSelector = recipeFormSelector + ' input[placeholder="Title"]';
    await page.type(titleInputSelector, ' - Edited');

    // Click save
    const saveRecipeButtonSelector = recipeFormSelector + ' #saveRecipeButton'; // Replace
    await page.click(saveRecipeButtonSelector);

    // Wait for the form to disappear and details to update
    await page.waitForSelector(recipeFormSelector, { hidden: true });
    const updatedTitleSelector = '#selectedRecipeTitle'; // Replace with actual selector for displayed title
    await page.waitForSelector(updatedTitleSelector, { visible: true });
    const updatedTitle = await page.$eval(updatedTitleSelector, el => el.textContent);
    expect(updatedTitle).toContain(' - Edited');
  });

  test('Deleting a Recipe', async () => {
    // Assuming the user is already logged in and on the main page
    // Add a new recipe first to ensure there's something to delete
    // (This avoids deleting a potentially important existing recipe)
    const addRecipeButtonSelector = '#addRecipeButton'; // Replace
    await page.waitForSelector(addRecipeButtonSelector, { visible: true });
    await page.click(addRecipeButtonSelector);

    const recipeFormSelector = '#recipeForm'; // Replace
    await page.waitForSelector(recipeFormSelector, { visible: true });

    const titleInputSelector = recipeFormSelector + ' input[placeholder="Title"]';
    const addIngredientButtonSelector = recipeFormSelector + ' #addIngredientButton'; // Replace
    const saveRecipeButtonSelector = recipeFormSelector + ' #saveRecipeButton'; // Replace

    await page.type(titleInputSelector, 'Recipe to Delete');
    await page.click(addIngredientButtonSelector); // Add a dummy ingredient
    const ingredientNameInputSelector = recipeFormSelector + ' .ingredient-row:last-child input[placeholder="Name"]'; // Replace
    await page.type(ingredientNameInputSelector, 'Dummy');

    await page.click(saveRecipeButtonSelector);
    await page.waitForSelector(recipeFormSelector, { hidden: true });

    // Find the recipe to delete in the list
    const recipeToDeleteSelector = '.recipe-item:has-text("Recipe to Delete")'; // Replace with a more robust selector if needed
    await page.waitForSelector(recipeToDeleteSelector, { visible: true });
    await page.click(recipeToDeleteSelector); // Select it first

    // Wait for details to load and click the delete button
    const deleteRecipeButtonSelector = '#deleteRecipeButton'; // Replace
    await page.waitForSelector(deleteRecipeButtonSelector, { visible: true });
    await page.click(deleteRecipeButtonSelector);

    // Handle confirmation dialog if any (assuming a simple browser confirm dialog)
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    // Wait for the recipe to be removed from the list
    await page.waitForSelector(recipeToDeleteSelector, { hidden: true });
    const deletedRecipe = await page.$(recipeToDeleteSelector);
    expect(deletedRecipe).toBeNull();
  });

  test('Ingredient Management within Recipe Form', async () => {
    // Assuming the user is logged in and editing a recipe
    // Select the first recipe and open the edit form
    const firstRecipeSelector = '.recipe-item:first-child'; // Replace
    await page.waitForSelector(firstRecipeSelector, { visible: true });
    await page.click(firstRecipeSelector);

    const editRecipeButtonSelector = '#editRecipeButton'; // Replace
    await page.waitForSelector(editRecipeButtonSelector, { visible: true });
    await page.click(editRecipeButtonSelector);

    const recipeFormSelector = '#recipeForm'; // Replace
    await page.waitForSelector(recipeFormSelector, { visible: true });

    const addIngredientButtonSelector = recipeFormSelector + ' #addIngredientButton'; // Replace
    const removeIngredientButtonSelector = recipeFormSelector + ' .ingredient-row:first-child #removeIngredientButton'; // Replace with actual selector for remove button

    // Add a new ingredient
    await page.click(addIngredientButtonSelector);
    const ingredientRowsAfterAdd = await page.$$(recipeFormSelector + ' .ingredient-row'); // Replace
    expect(ingredientRowsAfterAdd.length).toBeGreaterThan(0); // Check if a row was added

    // Remove an ingredient (assuming at least one exists initially or after adding)
    const initialIngredientCount = ingredientRowsAfterAdd.length;
    if (initialIngredientCount > 0) {
      await page.click(removeIngredientButtonSelector);
      const ingredientRowsAfterRemove = await page.$$(recipeFormSelector + ' .ingredient-row'); // Replace
      expect(ingredientRowsAfterRemove.length).toBe(initialIngredientCount - 1);
    } else {
      console.log('Skipping ingredient removal test as no ingredients are present.');
    }

    // Click cancel to close the form without saving changes from this test
    const cancelButtonSelector = recipeFormSelector + ' #cancelRecipeButton'; // Replace
    await page.click(cancelButtonSelector);
    await page.waitForSelector(recipeFormSelector, { hidden: true });
  });

  test('Recipe Iterations Display and Creation', async () => {
    // Assuming the user is logged in and viewing a recipe with iterations section
    // Select a recipe that is expected to have iterations, or add one and create an iteration
    // For simplicity, select the first recipe and assume it has an iterations section
    const firstRecipeSelector = '.recipe-item:first-child'; // Replace
    await page.waitForSelector(firstRecipeSelector, { visible: true });
    await page.click(firstRecipeSelector);

    // Assuming the iterations section is part of the recipe details view and is collapsible
    const iterationsSectionHeaderSelector = '#recipeIterationsSectionHeader'; // Replace with actual selector for the header
    const iterationsListSelector = '#recipeIterationsList'; // Replace with actual selector for the list container

    await page.waitForSelector(iterationsSectionHeaderSelector, { visible: true });
    await page.click(iterationsSectionHeaderSelector); // Expand the section if collapsed

    // Check if the iterations list is visible
    await page.waitForSelector(iterationsListSelector, { visible: true });
    const iterationsList = await page.$(iterationsListSelector);
    expect(iterationsList).toBeTruthy();

    // Assuming a button to create a new iteration within the section
    const createIterationButtonSelector = '#createNewIterationButton'; // Replace
    await page.waitForSelector(createIterationButtonSelector, { visible: true });
    await page.click(createIterationButtonSelector);

    // Assuming a form or modal appears for creating a new iteration
    const newIterationFormSelector = '#newIterationForm'; // Replace
    await page.waitForSelector(newIterationFormSelector, { visible: true });

    // Fill in notes for the new iteration
    const notesTextareaSelector = newIterationFormSelector + ' textarea[placeholder="Notes"]'; // Replace
    await page.type(notesTextareaSelector, 'Notes for new iteration.');

    // Click save (or create)
    const saveIterationButtonSelector = newIterationFormSelector + ' #saveIterationButton'; // Replace
    await page.click(saveIterationButtonSelector);

    // Wait for the form to disappear and the new iteration to appear in the list
    await page.waitForSelector(newIterationFormSelector, { hidden: true });
    await page.waitForSelector(iterationsListSelector, { visible: true }); // Ensure list is still visible
    // Verify the new iteration appears in the list (might need to check version number or notes)
    const newIterationNotes = await page.evaluate((selector) => {
        const iterationItems = Array.from(document.querySelectorAll(selector)); // Replace with actual selector for iteration items
        return iterationItems.map(item => item.textContent).find(text => text.includes('Notes for new iteration.'));
    }, iterationsListSelector + ' .iteration-item'); // Example selector for iteration item

    expect(newIterationNotes).toContain('Notes for new iteration.');
  });

  // Basic Accessibility Check
  test('Page should have no accessibility issues', async () => {
    // Inject axe-core into the page
    await page.evaluate(async () => {
      // Get axe-core script from a CDN or local file
      const axeScript = document.createElement('script');
      axeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.3.5/axe.min.js'; // Use a reliable CDN
      const head = document.head || document.getElementsByTagName('head')[0];
      head.appendChild(axeScript);
      return new Promise((resolve) => {
        axeScript.onload = resolve;
      });
    });

    // Run axe-core accessibility checks
    const results = await page.evaluate(async () => {
      // @ts-ignore // Ignore TypeScript error for axe is not defined
      return await axe.run();
    });

    // Assert that there are no accessibility violations
    expect(results.violations.length).toBe(0);
  });

  // Add tests for Error Scenarios and Edge Cases as needed
  // Examples:
  // - Attempting to save a recipe with missing required fields
  // - Attempting to delete a non-existent recipe
  // - Testing with empty ingredient lists
  // - Testing with very long input strings
});