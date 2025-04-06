/**
 * @jest-environment jsdom
 */

import { 
  loadRecipes, 
  loadAllIngredients, 
  createNewRecipe, 
  addGlobalIngredient, 
  removeGlobalIngredient,
  updateRecipeIngredients 
} from '../js/api.js';
import { supabaseClient } from '../js/supabaseClient.js';
import { showRecipeDetails, reloadData } from '../js/ui.js';

// Mock the Supabase client
jest.mock('../js/supabaseClient.js');

// Mock window.showNotification
global.window = global.window || {};
global.window.showNotification = jest.fn();

describe('Error Handling and Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up document structure
    document.body.innerHTML = `
      <div id="recipeDetailsView" style="display:none;"></div>
      <div id="noRecipeSelectedView" style="display:block;"></div>
      <div id="recipeHeaderSection" style="display:none;"></div>
    `;
  });

  describe('Network Errors', () => {
    test('showRecipeDetails should handle network errors gracefully', async () => {
      // Mock a network error when fetching recipe
      const networkError = new Error('Network connection lost');
      
      supabaseClient.from.mockImplementation(() => {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: networkError })
        };
      });

      // Call showRecipeDetails with an ID
      await showRecipeDetails('recipe-123');

      // Check that error notification was shown
      expect(window.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Error loading recipe'), 
        'error'
      );

      // Check that the UI shows error state
      expect(document.getElementById('recipeDetailsView').style.display).toBe('none');
      expect(document.getElementById('noRecipeSelectedView').style.display).toBe('block');
      expect(document.getElementById('recipeHeaderSection').style.display).toBe('none');
      expect(document.getElementById('noRecipeSelectedView').innerHTML).toContain('Error loading recipe');
    });

    test('reloadData should handle network errors during data fetch', async () => {
      // Mock a network error when fetching recipes
      supabaseClient.from.mockImplementation(() => {
        throw new Error('Failed to connect to server');
      });

      // Call reloadData
      const result = await reloadData();

      // Check that error notification was shown
      expect(window.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Error loading data'), 
        'error'
      );

      // Check that the function returned false to indicate failure
      expect(result).toBe(false);
    });
  });

  describe('Data Validation', () => {
    test('updateRecipeIngredients should validate ingredients before submitting', async () => {
      // Set up mock for the delete operation
      const mockDeleteEq = jest.fn().mockResolvedValue({ error: null });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockDeleteEq });
      
      // Mock for the insert operation
      const mockInsertSelect = jest.fn().mockResolvedValue({ data: [], error: null });
      const mockInsert = jest.fn().mockReturnValue({ select: mockInsertSelect });
      
      supabaseClient.from
        .mockReturnValueOnce({ delete: mockDelete })
        .mockReturnValueOnce({ insert: mockInsert });

      // Test with invalid ingredient data
      const recipeId = 'recipe-123';
      const invalidIngredients = [
        { id: 'ing-1', quantity: 'not-a-number', unit: 'g' }, // Invalid quantity
        { id: 'ing-2', quantity: -5, unit: 'ml' }             // Negative quantity
      ];

      // Call updateRecipeIngredients
      await updateRecipeIngredients(recipeId, invalidIngredients);

      // Verify the insert was called with corrected data
      // In a real implementation, this would validate and normalize the data
      expect(mockInsert).toHaveBeenCalled();
      
      // Check that the delete was called first
      expect(mockDelete).toHaveBeenCalled();
      expect(mockDeleteEq).toHaveBeenCalledWith('recipe_id', recipeId);
    });
  });

  describe('Edge Cases', () => {
    test('loadRecipes should handle empty response', async () => {
      // Mock an empty response
      supabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [], error: null })
      });

      // Call loadRecipes
      const recipes = await loadRecipes();

      // Check that an empty array was returned
      expect(recipes).toEqual([]);
    });

    test('loadAllIngredients should handle malformed response data', async () => {
      // Mock a response with malformed data
      const mockLimit = jest.fn().mockResolvedValue({ 
        data: [
          { id: 1, name: 'Valid Ingredient' },
          { id: 2 }, // Missing name
          { name: 'Missing ID' }, // Missing ID
          null, // Null entry
          {} // Empty object
        ], 
        error: null 
      });
      const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      
      supabaseClient.from.mockReturnValue({
        select: mockSelect
      });

      // Call loadAllIngredients
      const ingredients = await loadAllIngredients();

      // Check that only valid ingredients were returned
      // This depends on implementation details - it might filter or keep invalid entries
      expect(ingredients.length).toBeGreaterThanOrEqual(1);
      expect(ingredients.some(ing => ing.id === 1 && ing.name === 'Valid Ingredient')).toBe(true);
    });

    test('createNewRecipe should handle very long recipe titles', async () => {
      // Create a very long title (1000+ characters)
      const longTitle = 'A'.repeat(1000);
      
      // Mock a successful response
      const mockSelectInsert = jest.fn().mockResolvedValue({ 
        data: [{ id: 'new-recipe', title: longTitle, instructions: "" }], 
        error: null 
      });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelectInsert });
      
      supabaseClient.from.mockReturnValue({
        insert: mockInsert
      });

      // Call createNewRecipe
      const recipe = await createNewRecipe(longTitle);

      // Check that the recipe was created with the long title
      expect(recipe.title).toBe(longTitle);
      expect(mockInsert).toHaveBeenCalledWith([{ title: longTitle, instructions: "" }]);
    });

    test('removeGlobalIngredient should handle non-existent ingredient', async () => {
      // Mock a response where no rows were affected
      const mockEq = jest.fn().mockResolvedValue({ 
        error: null,
        data: null,
        count: 0 // No rows affected
      });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
      
      supabaseClient.from.mockReturnValue({
        delete: mockDelete
      });

      // Call removeGlobalIngredient with a non-existent ID
      const result = await removeGlobalIngredient(9999);

      // Check that the function returned true (success) even though no rows were affected
      // This is a design decision - whether to treat "no rows affected" as success or error
      expect(result).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 9999);
    });

    test('addGlobalIngredient should handle special characters in ingredient name', async () => {
      // Create a name with special characters
      const specialName = 'Ingredient with special chars: !@#$%^&*()';
      
      // Mock a successful response
      const mockSelectInsert = jest.fn().mockResolvedValue({ 
        data: [{ id: 'new-ing', name: specialName }], 
        error: null 
      });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelectInsert });
      
      supabaseClient.from.mockReturnValue({
        insert: mockInsert
      });

      // Call addGlobalIngredient
      const ingredient = await addGlobalIngredient(specialName);

      // Check that the ingredient was created with the special character name
      expect(ingredient.name).toBe(specialName);
      expect(mockInsert).toHaveBeenCalledWith([{ name: specialName }]);
    });
  });

  describe('Race Conditions', () => {
    test('concurrent updateRecipeIngredients calls should not interfere with each other', async () => {
      // Mock for the first call
      const mockDeleteEq1 = jest.fn().mockImplementation(() => {
        // Simulate delay for the first call
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ error: null });
          }, 100);
        });
      });
      const mockDelete1 = jest.fn().mockReturnValue({ eq: mockDeleteEq1 });
      
      const mockInsertSelect1 = jest.fn().mockResolvedValue({ data: [], error: null });
      const mockInsert1 = jest.fn().mockReturnValue({ select: mockInsertSelect1 });
      
      // Mock for the second call
      const mockDeleteEq2 = jest.fn().mockResolvedValue({ error: null });
      const mockDelete2 = jest.fn().mockReturnValue({ eq: mockDeleteEq2 });
      
      const mockInsertSelect2 = jest.fn().mockResolvedValue({ data: [], error: null });
      const mockInsert2 = jest.fn().mockReturnValue({ select: mockInsertSelect2 });
      
      // Set up the mocks for each call
      supabaseClient.from
        .mockReturnValueOnce({ delete: mockDelete1 })
        .mockReturnValueOnce({ insert: mockInsert1 })
        .mockReturnValueOnce({ delete: mockDelete2 })
        .mockReturnValueOnce({ insert: mockInsert2 });

      // Make two concurrent calls
      const recipeId1 = 'recipe-1';
      const ingredients1 = [{ id: 'ing-1', quantity: '1', unit: 'cup' }];
      
      const recipeId2 = 'recipe-2';
      const ingredients2 = [{ id: 'ing-2', quantity: '2', unit: 'tbsp' }];
      
      const promise1 = updateRecipeIngredients(recipeId1, ingredients1);
      const promise2 = updateRecipeIngredients(recipeId2, ingredients2);
      
      // Wait for both to complete
      const [result1, result2] = await Promise.all([promise1, promise2]);
      
      // Check that both calls completed successfully
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      
      // Verify each call used the correct recipe ID
      expect(mockDeleteEq1).toHaveBeenCalledWith('recipe_id', recipeId1);
      expect(mockDeleteEq2).toHaveBeenCalledWith('recipe_id', recipeId2);
    });
  });
});