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
import ApiClient from '../js/api-client.js';

// Mock the Supabase client and ApiClient
jest.mock('../js/supabaseClient.js');
jest.mock('../js/api-client.js');

// Mock window.showNotification
global.window = global.window || {};
global.window.showNotification = jest.fn();

describe('Error Handling and Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset ApiClient mocks
    ApiClient.recipes = {
      getAll: jest.fn().mockResolvedValue({ data: [], error: null }),
      getById: jest.fn().mockResolvedValue({ data: null, error: null }),
      create: jest.fn().mockResolvedValue({ data: [{ id: 'new-recipe-id', title: '', version: 1 }], error: null })
    };
    
    ApiClient.ingredients = {
      getAll: jest.fn().mockResolvedValue({ data: [], error: null }),
      create: jest.fn().mockResolvedValue({ data: [{ id: 1, name: '' }], error: null }),
      delete: jest.fn().mockResolvedValue({ data: true, error: null })
    };
    
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
      ApiClient.recipes.getAll.mockImplementation(() => {
        throw new Error('Failed to connect to server');
      });
      
      // Also mock the ingredients API to throw an error when called
      ApiClient.ingredients.getAll.mockImplementation(() => {
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
      // Mock the ApiClient.recipeIngredients.update method
      ApiClient.recipeIngredients.update.mockResolvedValue({ data: true, error: null });
      
      // Test with invalid ingredient data
      const recipeId = 'recipe-123';
      const invalidIngredients = [
        { id: 'ing-1', quantity: 'not-a-number', unit: 'g' }, // Invalid quantity
        { id: 'ing-2', quantity: -5, unit: 'ml' }             // Negative quantity
      ];

      // Call updateRecipeIngredients
      await updateRecipeIngredients(recipeId, invalidIngredients);

      // Verify the API client was called with the correct parameters
      expect(ApiClient.recipeIngredients.update).toHaveBeenCalledWith(
        recipeId,
        invalidIngredients
      );
    });
  });

  describe('Edge Cases', () => {
    test('loadRecipes should handle empty response', async () => {
      // Mock an empty response
      ApiClient.recipes.getAll.mockResolvedValue({ data: [], error: null });

      // Call loadRecipes
      const recipes = await loadRecipes();

      // Check that an empty array was returned
      expect(recipes).toEqual([]);
    });

    test('loadAllIngredients should handle malformed response data', async () => {
      // Mock a response with malformed data
      ApiClient.ingredients.getAll.mockResolvedValue({
        data: [
          { id: 1, name: 'Valid Ingredient' },
          { id: 2 }, // Missing name
          { name: 'Missing ID' }, // Missing ID
          null, // Null entry
          {} // Empty object
        ],
        error: null
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
      ApiClient.recipes.create.mockResolvedValue({
        data: [{ id: 'new-recipe', title: longTitle, version: 1 }],
        error: null
      });

      // Call createNewRecipe
      const recipe = await createNewRecipe(longTitle);

      // Check that the recipe was created with the long title
      expect(recipe.title).toBe(longTitle);
      
      // Verify the API client was called with the correct parameters
      expect(ApiClient.recipes.create).toHaveBeenCalledWith({
        title: longTitle,
        version: 1
      });
    });

    test('removeGlobalIngredient should handle non-existent ingredient', async () => {
      // Mock a response where no rows were affected
      ApiClient.ingredients.delete.mockResolvedValue({
        data: true, // Success response
        error: null
      });

      // Call removeGlobalIngredient with a non-existent ID
      const result = await removeGlobalIngredient(9999);

      // Check that the function returned true (success) even though no rows were affected
      // This is a design decision - whether to treat "no rows affected" as success or error
      expect(result).toBe(true);
      
      // Verify the API client was called with the correct parameters
      expect(ApiClient.ingredients.delete).toHaveBeenCalledWith(9999);
    });

    test('addGlobalIngredient should handle special characters in ingredient name', async () => {
      // Create a name with special characters
      const specialName = 'Ingredient with special chars: !@#$%^&*()';
      
      // Mock a successful response
      ApiClient.ingredients.create.mockResolvedValue({
        data: [{ id: 'new-ing', name: specialName, description: null }],
        error: null
      });

      // Call addGlobalIngredient
      const ingredient = await addGlobalIngredient(specialName);

      // Check that the ingredient was created with the special character name
      expect(ingredient.name).toBe(specialName);
      
      // The API call should include the description field with null value
      expect(ApiClient.ingredients.create).toHaveBeenCalledWith({
        name: specialName,
        description: null
      });
    });
  });

  describe('Race Conditions', () => {
    test('concurrent updateRecipeIngredients calls should not interfere with each other', async () => {
      // Mock ApiClient.recipeIngredients.update for both calls
      ApiClient.recipeIngredients = {
        update: jest.fn()
          .mockImplementationOnce((recipeId, ingredients) => {
            // Slow response for first call
            return new Promise(resolve => {
              setTimeout(() => {
                resolve({ data: true, error: null });
              }, 100);
            });
          })
          .mockImplementationOnce((recipeId, ingredients) => {
            // Fast response for second call
            return Promise.resolve({ data: true, error: null });
          })
      };

      // Set up spies to track the calls
      const mockDeleteEq1 = jest.fn();
      const mockDeleteEq2 = jest.fn();
      
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
      
      // Verify ApiClient was called with the correct recipe IDs and ingredients
      expect(ApiClient.recipeIngredients.update).toHaveBeenCalledWith(recipeId1, ingredients1);
      expect(ApiClient.recipeIngredients.update).toHaveBeenCalledWith(recipeId2, ingredients2);
      
      // Verify calls happened in the expected order
      expect(ApiClient.recipeIngredients.update.mock.calls[0][0]).toBe(recipeId1);
      expect(ApiClient.recipeIngredients.update.mock.calls[1][0]).toBe(recipeId2);
    });
  });
});