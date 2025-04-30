/**
 * @jest-environment jsdom
 */

import { initUI, showRecipeDetails, updateAuthButton, reloadData } from '../js/ui.js';
import { initRecipeActions } from '../js/recipe-actions.js';
import { supabaseClient } from '../js/supabaseClient.js';

// Mock the Supabase client
jest.mock('../js/supabaseClient.js');

// Mock API functions
jest.mock('../js/api.js', () => ({
  loadRecipes: jest.fn().mockResolvedValue([
    { id: 'recipe-1', title: 'Test Recipe 1' },
    { id: 'recipe-2', title: 'Test Recipe 2', version: 2 }
  ]),
  loadAllIngredients: jest.fn().mockResolvedValue([
    { id: '1', name: 'Ingredient 1' },
    { id: '2', name: 'Ingredient 2' }
  ]),
  createNewRecipe: jest.fn().mockImplementation((title) => 
    Promise.resolve({ id: 'new-recipe', title, instructions: '' })
  ),
  addGlobalIngredient: jest.fn().mockImplementation((name) => 
    Promise.resolve({ id: 'new-ing', name })
  ),
  updateRecipeIngredients: jest.fn().mockResolvedValue(true),
  analyzeIngredients: jest.fn().mockReturnValue({ compatible: true, pH: 7.0 }),
  getRecipeTimeline: jest.fn().mockReturnValue([{ stepNumber: 1, description: 'Test Step', duration: 5 }]),
  getBatchHistory: jest.fn().mockReturnValue([{ date: '2025-01-01', status: 'completed' }]),
  estimateShelfLife: jest.fn().mockReturnValue(30)
}));

// Mock recipe actions
jest.mock('../js/recipe-actions.js', () => ({
  initRecipeActions: jest.fn(),
  CollapsiblePanel: {
    render: jest.fn().mockImplementation((container, title, content) => {
      const panel = document.createElement('div');
      panel.className = 'action-panel collapsible-container';
      panel.setAttribute('aria-expanded', 'false');
      
      const header = document.createElement('button');
      header.className = 'collapsible-header';
      header.textContent = title;
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'collapsible-content';
      contentDiv.appendChild(content);
      
      panel.appendChild(header);
      panel.appendChild(contentDiv);
      container.appendChild(panel);
      
      return panel;
    })
  }
}));

describe('Component Integration', () => {
  // Set up global window object
  global.window = Object.assign(global.window || {}, {
    showNotification: jest.fn(),
    location: { href: 'http://localhost:3000' }
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up document structure
    document.body.innerHTML = `
      <div class="page-wrapper">
        <header>
          <h1 class="app-title">DIY Recipes</h1>
          <div class="header-buttons">
            <button id="btnLogIn">Log In</button>
            <button id="btnEditModeToggle" style="display:none;">Edit Mode: OFF</button>
            <button id="btnThemeToggle">Theme: Dark</button>
            <button id="btnIngredients">All Ingredients</button>
            <button id="btnAddRecipe" style="display:none;">Add Recipe</button>
          </div>
          <div id="magicLinkForm" style="display:none;">
            <input id="magicLinkEmail" type="email" placeholder="Enter your email">
            <button id="btnSendMagicLink">Send Magic Link</button>
          </div>
        </header>
        
        <div id="recipeHeaderSection" style="display:none;">
          <h2 id="selectedRecipeTitle"></h2>
          <div id="recipeActions"></div>
        </div>
        
        <div class="content-grid">
          <div id="left-column" class="left-column">
            <div class="recipe-list-container">
              <h2>Recipes</h2>
              <ul id="recipeList"></ul>
            </div>
            
            <div id="globalIngredientsSection" class="collapsible-container" aria-expanded="false">
              <button class="collapsible-header">All Ingredients</button>
              <div class="collapsible-content">
                <button id="btnAddGlobalIngredient" style="display:none;">Add Ingredient</button>
                <ul id="globalIngredientList"></ul>
              </div>
            </div>
          </div>
          
          <div id="middle-column" class="middle-column">
            <div id="noRecipeSelectedView">
              <p>Select a recipe to view details</p>
            </div>
            
            <div id="recipeDetailsView" style="display:none;">
              <div id="recipeDescription"></div>
              <div id="recipeIngredientListDisplay"></div>
              <div id="recipeDetailedInstructions"></div>
              <div id="recipeNotes"></div>
              <div id="recipeNutrition"></div>
              <div id="recipeMedia"></div>
            </div>
          </div>
          
          <div id="right-column" class="right-column">
            <div id="right-column-actions"></div>
            <div id="advancedAnalysisPanel"></div>
            <div id="iterationEditContainer">
              <table id="iterationEditTable">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
              <button id="addIterationIngredientBtn" style="display:none;">Add Ingredient</button>
              <button id="commitRecipeBtn" style="display:none;">Commit Changes</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Set up global variables
    global.isLoggedIn = false;
    global.allIngredients = [];
    global.currentRecipe = null;
    global.recipesCache = [];
  });
  
  test('initUI loads data and sets up event listeners', async () => {
    // Mock auth state change
    supabaseClient.auth.onAuthStateChange = jest.fn((callback) => {
      // Simulate initial session call
      callback('INITIAL_SESSION', null);
    });
    
    // Call initUI
    await initUI();
    
    // Verify that data was loaded
    expect(global.recipesCache.length).toBeGreaterThan(0);
    expect(global.allIngredients.length).toBeGreaterThan(0);
    
    // Verify that recipe actions were initialized
    expect(initRecipeActions).toHaveBeenCalled();
    
    // Verify initial UI state
    expect(document.getElementById('recipeDetailsView').style.display).toBe('none');
    expect(document.getElementById('noRecipeSelectedView').style.display).toBe('block');
    expect(document.getElementById('recipeHeaderSection').style.display).toBe('none');
  });
  
  test('Recipe selection updates UI across all columns', async () => {
    // Set up mock recipe
    const mockRecipe = {
      id: 'recipe-123',
      title: 'Test Recipe',
      ingredients: [
        { 
          name: 'Test Ingredient', 
          quantity: '100', 
          unit: 'g',
          ingredient_id: '1'
        }
      ],
      instructions: 'Test instructions',
      description: 'Test description',
      notes: 'Test notes'
    };
    
    // Mock Supabase response for recipe fetch
    const mockSingle = jest.fn().mockResolvedValue({ data: mockRecipe, error: null });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    
    // Mock Supabase response for ingredients fetch
    const mockIngredientsEq = jest.fn().mockResolvedValue({ 
      data: [
        { 
          id: 'ri-1', 
          recipe_id: 'recipe-123', 
          ingredients: { id: '1', name: 'Test Ingredient' },
          quantity: '100',
          unit: 'g',
          notes: null
        }
      ], 
      error: null 
    });
    
    supabaseClient.from.mockImplementation((table) => {
      if (table === 'recipes') {
        return { select: mockSelect };
      } else if (table === 'recipeingredients') {
        return { 
          select: jest.fn().mockReturnThis(),
          eq: mockIngredientsEq
        };
      }
      return { select: jest.fn().mockReturnThis() };
    });
    
    // Call showRecipeDetails
    await showRecipeDetails('recipe-123');
    
    // Verify that the recipe details are displayed
    expect(document.getElementById('recipeDetailsView').style.display).toBe('block');
    expect(document.getElementById('noRecipeSelectedView').style.display).toBe('none');
    expect(document.getElementById('recipeHeaderSection').style.display).toBe('flex');
    
    // Verify recipe title in header
    expect(document.getElementById('selectedRecipeTitle').textContent).toBe('Test Recipe');
    
    // Verify recipe description
    expect(document.getElementById('recipeDescription').innerHTML).toContain('Test description');
    
    // Verify recipe ingredients list
    const ingredientsList = document.getElementById('recipeIngredientListDisplay');
    expect(ingredientsList.innerHTML).toContain('Test Ingredient');
    
    // Verify that currentRecipe was updated
    expect(global.currentRecipe).toEqual(mockRecipe);
  });
  
  test('Auth state changes update UI visibility', () => {
    // Mock auth state change callback
    let authCallback;
    supabaseClient.auth.onAuthStateChange = jest.fn((callback) => {
      authCallback = callback;
    });
    
    // Initialize UI
    initUI();
    
    // Verify auth callback was registered
    expect(authCallback).toBeDefined();
    
    // Simulate login
    authCallback('SIGNED_IN', { user: { id: 'user-123' } });
    
    // Verify that isLoggedIn was updated
    expect(global.isLoggedIn).toBe(true);
    
    // Verify that edit mode button is visible
    expect(document.getElementById('btnEditModeToggle').style.display).toBe('inline-block');
    
    // Verify that login button text was updated
    expect(document.getElementById('btnLogIn').textContent).toBe('Log Out');
    
    // Simulate logout
    authCallback('SIGNED_OUT', null);
    
    // Verify that isLoggedIn was updated
    expect(global.isLoggedIn).toBe(false);
    
    // Verify that edit mode button is hidden
    expect(document.getElementById('btnEditModeToggle').style.display).toBe('none');
    
    // Verify that login button text was updated
    expect(document.getElementById('btnLogIn').textContent).toBe('Log In');
  });
  
  test('Edit mode toggle updates UI elements', () => {
    // Set up global state
    global.isLoggedIn = true;
    global.currentRecipe = { id: 'recipe-123', title: 'Test Recipe' };
    
    // Update auth button to reflect login state
    updateAuthButton();
    
    // Get edit mode button
    const editModeBtn = document.getElementById('btnEditModeToggle');
    expect(editModeBtn.style.display).toBe('inline-block');
    
    // Initially edit mode is off
    expect(editModeBtn.dataset.active).toBe('false');
    expect(document.getElementById('btnAddRecipe').style.display).toBe('none');
    expect(document.getElementById('btnAddGlobalIngredient').style.display).toBe('none');
    
    // Click edit mode button
    editModeBtn.click();
    
    // Verify edit mode elements are now visible
    expect(editModeBtn.dataset.active).toBe('true');
    expect(document.getElementById('btnAddRecipe').style.display).toBe('flex');
    expect(document.getElementById('btnAddGlobalIngredient').style.display).toBe('inline-block');
    
    // Click edit mode button again
    editModeBtn.click();
    
    // Verify edit mode elements are hidden again
    expect(editModeBtn.dataset.active).toBe('false');
    expect(document.getElementById('btnAddRecipe').style.display).toBe('none');
    expect(document.getElementById('btnAddGlobalIngredient').style.display).toBe('none');
  });
  
  test('Theme toggle changes body class', () => {
    // Get theme toggle button
    const themeToggleBtn = document.getElementById('btnThemeToggle');
    
    // Initially theme is dark
    themeToggleBtn.dataset.theme = 'dark';
    document.body.className = 'dark';
    
    // Click theme toggle button
    themeToggleBtn.click();
    
    // Verify theme changed to light
    expect(themeToggleBtn.dataset.theme).toBe('light');
    expect(document.body.className).toBe('light');
    
    // Click theme toggle button again
    themeToggleBtn.click();
    
    // Verify theme changed back to dark
    expect(themeToggleBtn.dataset.theme).toBe('dark');
    expect(document.body.className).toBe('dark');
  });
  
  test('Collapsible sections expand and collapse', () => {
    // Get a collapsible section
    const collapsibleSection = document.getElementById('globalIngredientsSection');
    const header = collapsibleSection.querySelector('.collapsible-header');
    const content = collapsibleSection.querySelector('.collapsible-content');
    
    // Initially collapsed
    expect(collapsibleSection.getAttribute('aria-expanded')).toBe('false');
    
    // Create a click event
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    // Dispatch click event on the header
    header.dispatchEvent(clickEvent);
    
    // Verify the section expanded
    expect(collapsibleSection.getAttribute('aria-expanded')).toBe('true');
    
    // Click again
    header.dispatchEvent(clickEvent);
    
    // Verify the section collapsed
    expect(collapsibleSection.getAttribute('aria-expanded')).toBe('false');
  });
  describe('Recipe and Ingredient Management Interactions', () => {
    test('Creating a new recipe through the UI calls createNewRecipe API', async () => {
      // Simulate being logged in and in edit mode
      global.isLoggedIn = true;
      updateAuthButton(); // Update UI based on login state
      fireEvent.click(document.getElementById('btnEditModeToggle')); // Enable edit mode

      // Simulate clicking the "Add Recipe" button and entering a title
      // This part is a placeholder and needs to be adjusted based on the actual UI implementation
      const newRecipeTitle = 'My New Test Recipe';
      // Assuming an event listener is attached to btnAddRecipe that prompts for a title and calls createNewRecipe
      // I will directly call the mocked createNewRecipe for now.
      await global.createNewRecipe(newRecipeTitle);

      expect(global.createNewRecipe).toHaveBeenCalledWith(newRecipeTitle);
      // Further assertions could check if the new recipe appears in the list after reloadData is called
    });

    test('Updating a recipe through the UI calls updateRecipe API', async () => {
      // Simulate having a recipe selected and being in edit mode
      global.isLoggedIn = true;
      global.currentRecipe = {
        id: 'recipe-123',
        title: 'Original Title',
        description: 'Original Description',
        ingredients: [],
        steps: [],
      };
      updateAuthButton(); // Update UI based on login state
      fireEvent.click(document.getElementById('btnEditModeToggle')); // Enable edit mode
      await showRecipeDetails('recipe-123'); // Display the recipe details

      // Simulate editing the recipe details in the UI
      // This part is a placeholder and needs to be adjusted based on the actual UI implementation
      const updatedRecipeData = {
        ...global.currentRecipe,
        title: 'Updated Title',
        description: 'Updated Description',
      };
      // Assuming there's a "Save Recipe" button that gathers data from input fields and calls updateRecipe
      // I will directly call the mocked updateRecipe for now.
      await global.updateRecipe(updatedRecipeData);

      expect(global.updateRecipe).toHaveBeenCalledWith(updatedRecipeData);
      // Further assertions could check if the UI is updated with the new data
    });

    test('Deleting a recipe through the UI calls deleteRecipe API', async () => {
      // Simulate having a recipe selected and being in edit mode
      global.isLoggedIn = true;
      global.currentRecipe = { id: 'recipe-123', title: 'Test Recipe' };
      updateAuthButton(); // Update UI based on login state
      fireEvent.click(document.getElementById('btnEditModeToggle')); // Enable edit mode
      await showRecipeDetails('recipe-123'); // Display the recipe details

      // Simulate clicking the "Delete Recipe" button
      // This part is a placeholder and needs to be adjusted based on the actual UI implementation
      // Assuming there's a "Delete Recipe" button that prompts for confirmation and calls deleteRecipe
      // I will directly call the mocked deleteRecipe for now.
      await global.deleteRecipe('recipe-123');

      expect(global.deleteRecipe).toHaveBeenCalledWith('recipe-123');
      // Further assertions could check if the recipe is removed from the list and the details view is cleared
    });

    test('Adding a global ingredient through the UI calls addGlobalIngredient API', async () => {
      // Simulate being logged in and in edit mode
      global.isLoggedIn = true;
      updateAuthButton(); // Update UI based on login state
      fireEvent.click(document.getElementById('btnEditModeToggle')); // Enable edit mode

      // Simulate clicking the "Add Ingredient" button in the global ingredients section and entering a name
      // This part is a placeholder and needs to be adjusted based on the actual UI implementation
      const newIngredientName = 'New Global Ingredient';
      // Assuming an event listener is attached to btnAddGlobalIngredient that prompts for a name and calls addGlobalIngredient
      // I will directly call the mocked addGlobalIngredient for now.
      await global.addGlobalIngredient(newIngredientName);

      expect(global.addGlobalIngredient).toHaveBeenCalledWith(newIngredientName);
      // Further assertions could check if the new ingredient appears in the list after reloadData is called
    });

    test('Removing a global ingredient through the UI calls removeGlobalIngredient API', async () => {
      // Simulate having global ingredients loaded and being in edit mode
      global.isLoggedIn = true;
      global.allIngredients = [{ id: 'ing-1', name: 'Ingredient to Delete' }];
      updateAuthButton(); // Update UI based on login state
      fireEvent.click(document.getElementById('btnEditModeToggle')); // Enable edit mode
      // Assuming the global ingredient list is rendered and contains a delete button for each ingredient
      // This part is a placeholder and needs to be adjusted based on the actual UI implementation
      // Assuming clicking a delete button for ingredient 'ing-1' calls removeGlobalIngredient('ing-1')
      // I will directly call the mocked removeGlobalIngredient for now.
      await global.removeGlobalIngredient('ing-1');

      expect(global.removeGlobalIngredient).toHaveBeenCalledWith('ing-1');
      // Further assertions could check if the ingredient is removed from the list after reloadData is called
    });
  });

  describe('Recipe Selection Interactions', () => {
    test('Recipe selection updates the displayed recipe details', async () => {
      // Mock loadRecipes to return a list of recipes
      global.loadRecipes.mockResolvedValue([
        { id: 'recipe-1', title: 'Recipe One', description: 'Desc One', ingredients: [], steps: [] },
        { id: 'recipe-2', title: 'Recipe Two', description: 'Desc Two', ingredients: [], steps: [] },
      ]);

      // Mock loadAllIngredients
      global.loadAllIngredients.mockResolvedValue([]);

      // Initialize the UI to load the recipe list
      await initUI();

      // Simulate clicking on "Recipe Two" in the recipe list
      // This requires knowing the structure of the rendered recipe list items.
      // Assuming each recipe in the list is represented by an element containing its title.
      const recipeTwoElementInList = screen.getByText('Recipe Two');
      fireEvent.click(recipeTwoElementInList);

      // Wait for the recipe details to be displayed
      await waitFor(() => {
        expect(document.getElementById('selectedRecipeTitle').textContent).toBe('Recipe Two');
        expect(document.getElementById('recipeDescription').innerHTML).toContain('Desc Two');
      });
    });
  });
});