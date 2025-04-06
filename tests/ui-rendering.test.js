/**
 * @jest-environment jsdom
 */

import { 
  renderRecipes, 
  renderGlobalIngredients, 
  updateAuthButton, 
  isEditMode, 
  createEditableIngredientRow, 
  renderAdvancedAnalysis 
} from '../js/ui.js';
import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

describe('UI Rendering Components', () => {
  // Setup document structure before each test
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="recipeList"></div>
      <div id="globalIngredientList"></div>
      <div id="btnLogIn">Log In</div>
      <div id="magicLinkForm" style="display:none;"></div>
      <div id="btnEditModeToggle" data-active="false">Edit Mode: OFF</div>
      <div id="advancedAnalysisPanel"></div>
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
    `;

    // Mock global variables
    global.isLoggedIn = false;
    global.allIngredients = [
      { id: '1', name: 'Ingredient 1' },
      { id: '2', name: 'Ingredient 2' },
      { id: '3', name: 'Ingredient 3' }
    ];
    global.window.showNotification = jest.fn();
  });

  describe('renderRecipes', () => {
    test('should render recipe list with correct structure', () => {
      const recipes = [
        { id: '1', title: 'Recipe 1' },
        { id: '2', title: 'Recipe 2', version: 2 }
      ];

      renderRecipes(recipes);

      const recipeList = document.getElementById('recipeList');
      const recipeItems = recipeList.querySelectorAll('.recipe-item');

      expect(recipeItems.length).toBe(2);
      expect(recipeItems[0].querySelector('.recipe-title').textContent).toBe('Recipe 1');
      expect(recipeItems[1].querySelector('.recipe-title').textContent).toBe('Recipe 2');
      
      // Check for version badge on second recipe
      const versionBadge = recipeItems[1].querySelector('.version-badge');
      expect(versionBadge).toBeTruthy();
      expect(versionBadge.textContent).toBe('v2');
      
      // No version badge on first recipe
      expect(recipeItems[0].querySelector('.version-badge')).toBeFalsy();
    });

    test('should handle empty recipe list', () => {
      renderRecipes([]);
      const recipeList = document.getElementById('recipeList');
      expect(recipeList.innerHTML).toBe('');
    });

    test('should sort recipes by title', () => {
      const recipes = [
        { id: '2', title: 'Banana Bread' },
        { id: '1', title: 'Apple Pie' },
        { id: '3', title: 'Chocolate Cake' }
      ];

      renderRecipes(recipes);

      const recipeList = document.getElementById('recipeList');
      const recipeTitles = Array.from(recipeList.querySelectorAll('.recipe-title'))
        .map(title => title.textContent);

      expect(recipeTitles).toEqual(['Apple Pie', 'Banana Bread', 'Chocolate Cake']);
    });
  });

  describe('renderGlobalIngredients', () => {
    test('should render global ingredient list with correct structure', () => {
      const ingredients = [
        { id: '1', name: 'Salt', description: 'Common seasoning' },
        { id: '2', name: 'Sugar', description: 'Sweet ingredient' }
      ];

      renderGlobalIngredients(ingredients);

      const ingredientList = document.getElementById('globalIngredientList');
      const ingredientItems = ingredientList.querySelectorAll('.ingredient-item');

      expect(ingredientItems.length).toBe(2);
      expect(ingredientItems[0].querySelector('.ingredient-name').textContent).toBe('Salt');
      expect(ingredientItems[1].querySelector('.ingredient-name').textContent).toBe('Sugar');
    });

    test('should handle empty ingredient list', () => {
      renderGlobalIngredients([]);
      const ingredientList = document.getElementById('globalIngredientList');
      expect(ingredientList.innerHTML).toBe('<li>No global ingredients found.</li>');
    });

    test('should sort ingredients by name', () => {
      const ingredients = [
        { id: '2', name: 'Pepper' },
        { id: '1', name: 'Basil' },
        { id: '3', name: 'Garlic' }
      ];

      renderGlobalIngredients(ingredients);

      const ingredientList = document.getElementById('globalIngredientList');
      const ingredientNames = Array.from(ingredientList.querySelectorAll('.ingredient-name'))
        .map(name => name.textContent);

      expect(ingredientNames).toEqual(['Basil', 'Garlic', 'Pepper']);
    });
  });

  describe('updateAuthButton', () => {
    test('should update login button text based on login state', () => {
      const loginBtn = document.getElementById('btnLogIn');
      
      // When not logged in
      global.isLoggedIn = false;
      updateAuthButton();
      expect(loginBtn.textContent).toBe('Log In');
      
      // When logged in
      global.isLoggedIn = true;
      updateAuthButton();
      expect(loginBtn.textContent).toBe('Log Out');
    });

    test('should show/hide edit mode button based on login state', () => {
      const editModeBtn = document.getElementById('btnEditModeToggle');
      
      // When not logged in
      global.isLoggedIn = false;
      updateAuthButton();
      expect(editModeBtn.style.display).toBe('none');
      
      // When logged in
      global.isLoggedIn = true;
      updateAuthButton();
      expect(editModeBtn.style.display).toBe('inline-block');
    });

    test('should handle magic link form visibility', () => {
      const loginBtn = document.getElementById('btnLogIn');
      const magicLinkForm = document.getElementById('magicLinkForm');
      
      // When logged in, form should be hidden
      global.isLoggedIn = true;
      loginBtn.dataset.showForm = 'true';
      updateAuthButton();
      expect(magicLinkForm.style.display).toBe('none');
      
      // When not logged in and showForm is true
      global.isLoggedIn = false;
      loginBtn.dataset.showForm = 'true';
      updateAuthButton();
      expect(magicLinkForm.style.display).toBe('block');
      
      // When not logged in and showForm is false
      loginBtn.dataset.showForm = 'false';
      updateAuthButton();
      expect(magicLinkForm.style.display).toBe('none');
    });
  });

  describe('isEditMode', () => {
    test('should return true when edit mode is active and user is logged in', () => {
      const editModeBtn = document.getElementById('btnEditModeToggle');
      editModeBtn.dataset.active = 'true';
      global.isLoggedIn = true;
      
      expect(isEditMode()).toBe(true);
    });

    test('should return false when edit mode is inactive', () => {
      const editModeBtn = document.getElementById('btnEditModeToggle');
      editModeBtn.dataset.active = 'false';
      global.isLoggedIn = true;
      
      expect(isEditMode()).toBe(false);
    });

    test('should return false when user is not logged in', () => {
      const editModeBtn = document.getElementById('btnEditModeToggle');
      editModeBtn.dataset.active = 'true';
      global.isLoggedIn = false;
      
      expect(isEditMode()).toBe(false);
    });
  });

  describe('createEditableIngredientRow', () => {
    test('should create a row with the correct structure', () => {
      const ingredientData = {
        ingredient_id: '1',
        name: 'Ingredient 1',
        quantity: '100',
        unit: 'g',
        notes: 'Test notes'
      };
      
      const row = createEditableIngredientRow(ingredientData);
      
      expect(row.tagName).toBe('TR');
      expect(row.dataset.ingredientId).toBe('1');
      
      // Check cells
      const cells = row.querySelectorAll('td');
      expect(cells.length).toBe(5); // name, quantity, unit, notes, actions
      
      // Check select element for name
      const select = cells[0].querySelector('select');
      expect(select).toBeTruthy();
      expect(select.value).toBe('1');
      
      // Check inputs for other fields
      const quantityInput = cells[1].querySelector('input');
      expect(quantityInput.value).toBe('100');
      
      const unitInput = cells[2].querySelector('input');
      expect(unitInput.value).toBe('g');
      
      const notesInput = cells[3].querySelector('input');
      expect(notesInput.value).toBe('Test notes');
      
      // Check remove button
      const removeBtn = cells[4].querySelector('button');
      expect(removeBtn).toBeTruthy();
      expect(removeBtn.textContent).toBe('X');
    });

    test('should handle empty ingredient data', () => {
      const row = createEditableIngredientRow({});
      
      expect(row.tagName).toBe('TR');
      
      // Check cells
      const cells = row.querySelectorAll('td');
      expect(cells.length).toBe(5);
      
      // Check select element for name has default option selected
      const select = cells[0].querySelector('select');
      expect(select).toBeTruthy();
      
      const defaultOption = select.options[0];
      expect(defaultOption.selected).toBe(true);
      expect(defaultOption.textContent).toBe('Select Ingredient...');
      
      // Check inputs for other fields are empty
      const quantityInput = cells[1].querySelector('input');
      expect(quantityInput.value).toBe('');
      
      const unitInput = cells[2].querySelector('input');
      expect(unitInput.value).toBe('');
      
      const notesInput = cells[3].querySelector('input');
      expect(notesInput.value).toBe('');
    });

    test('should handle remove button click', () => {
      const row = createEditableIngredientRow({
        ingredient_id: '1',
        name: 'Test Ingredient'
      });
      
      // Add row to table
      const tableBody = document.querySelector('#iterationEditTable tbody');
      tableBody.appendChild(row);
      
      // Click remove button
      const removeBtn = row.querySelector('.remove-iteration-ingredient-btn');
      fireEvent.click(removeBtn);
      
      // Check that row was removed
      expect(tableBody.contains(row)).toBe(false);
      
      // Check that placeholder was added since table is now empty
      const placeholder = tableBody.querySelector('td[colspan="5"]');
      expect(placeholder).toBeTruthy();
      expect(placeholder.textContent).toContain('No ingredients');
    });
  });

  describe('renderAdvancedAnalysis', () => {
    // Mock API functions
    const mockAnalyzeIngredients = jest.fn();
    const mockGetRecipeTimeline = jest.fn();
    const mockGetBatchHistory = jest.fn();
    const mockEstimateShelfLife = jest.fn();
    
    beforeEach(() => {
      jest.mock('../js/api.js', () => ({
        analyzeIngredients: mockAnalyzeIngredients,
        getRecipeTimeline: mockGetRecipeTimeline,
        getBatchHistory: mockGetBatchHistory,
        estimateShelfLife: mockEstimateShelfLife
      }));
      
      mockAnalyzeIngredients.mockReturnValue({ compatible: true, pH: 7.0 });
      mockGetRecipeTimeline.mockReturnValue([
        { stepNumber: 1, description: 'Test Step 1', duration: 5 }
      ]);
      mockGetBatchHistory.mockReturnValue([
        { date: '2025-04-01', status: 'completed' }
      ]);
      mockEstimateShelfLife.mockReturnValue(30);
    });
    
    test('should render advanced analysis panels', () => {
      const recipe = {
        id: '1',
        title: 'Test Recipe',
        ingredients: [{ name: 'Test Ingredient' }]
      };
      
      const container = document.getElementById('advancedAnalysisPanel');
      
      // Call the function without mocks since we can't easily mock the imported functions
      renderAdvancedAnalysis(recipe, container);
      
      // Just check the structure of the panels
      const panels = container.querySelectorAll('.action-panel');
      expect(panels.length).toBeGreaterThan(0);
      
      // Check panel titles
      const panelTitles = Array.from(panels).map(panel => 
        panel.querySelector('h3').textContent
      );
      
      expect(panelTitles).toContain('Ingredient Analysis');
      expect(panelTitles).toContain('Recipe Timeline');
      expect(panelTitles).toContain('Batch Tracking');
      expect(panelTitles).toContain('Shelf-life Estimate');
    });
  });
});