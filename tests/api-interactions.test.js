/**
 * @jest-environment jsdom
 */

import { 
  loadRecipes, 
  loadAllIngredients, 
  createNewRecipe, 
  addGlobalIngredient, 
  removeGlobalIngredient, 
  updateRecipeIngredients,
  analyzeIngredients,
  getRecipeTimeline,
  getBatchHistory,
  estimateShelfLife 
} from '../js/api.js';
import { supabaseClient } from '../js/supabaseClient.js';

// Mock the Supabase client
jest.mock('../js/supabaseClient.js');

describe('API Interactions with Supabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error Handling', () => {
    test('loadRecipes should handle network errors', async () => {
      // Set up the mock to simulate a network error
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';
      
      supabaseClient.from.mockImplementation(() => {
        throw networkError;
      });

      await expect(loadRecipes()).rejects.toThrow('Failed to load recipes: Network error');
    });

    test('loadAllIngredients should handle empty response', async () => {
      // Set up the mock to return null data but no error
      const mockLimit = jest.fn().mockResolvedValue({ data: null, error: null });
      const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      
      supabaseClient.from.mockReturnValue({
        select: mockSelect
      });

      const result = await loadAllIngredients();
      expect(result).toEqual([]);
    });

    test('createNewRecipe should handle validation errors', async () => {
      // Set up the mock to simulate a validation error
      const validationError = new Error('Validation error: title is required');
      
      const mockSelectInsert = jest.fn().mockResolvedValue({ data: null, error: validationError });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelectInsert });
      
      supabaseClient.from.mockReturnValue({
        insert: mockInsert
      });

      await expect(createNewRecipe('')).rejects.toThrow('Failed to create recipe: Validation error: title is required');
    });

    test('addGlobalIngredient should handle duplicate name errors', async () => {
      // Set up the mock to simulate a duplicate constraint error
      const duplicateError = new Error('duplicate key value violates unique constraint');
      
      const mockSelectInsert = jest.fn().mockResolvedValue({ data: null, error: duplicateError });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelectInsert });
      
      supabaseClient.from.mockReturnValue({
        insert: mockInsert
      });

      await expect(addGlobalIngredient('Existing Ingredient')).rejects.toThrow('Failed to add global ingredient: duplicate key value violates unique constraint');
    });

    test('removeGlobalIngredient should handle foreign key constraint errors', async () => {
      // Set up the mock to simulate a foreign key constraint error
      const constraintError = new Error('violates foreign key constraint');
      
      const mockEq = jest.fn().mockResolvedValue({ error: constraintError });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
      
      supabaseClient.from.mockReturnValue({
        delete: mockDelete
      });

      await expect(removeGlobalIngredient(1)).rejects.toThrow('Failed to remove global ingredient: violates foreign key constraint');
    });

    test('updateRecipeIngredients should handle transaction errors', async () => {
      // Set up the mock to simulate a delete success but insert failure
      const insertError = new Error('Insert failed');
      
      const mockDeleteEq = jest.fn().mockResolvedValue({ error: null });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockDeleteEq });
      
      const mockInsertSelect = jest.fn().mockResolvedValue({ data: null, error: insertError });
      const mockInsert = jest.fn().mockReturnValue({ select: mockInsertSelect });
      
      supabaseClient.from
        .mockReturnValueOnce({ delete: mockDelete })
        .mockReturnValueOnce({ insert: mockInsert });

      const recipeId = 'recipe-123';
      const ingredients = [
        { id: 'ing-1', quantity: '1', unit: 'cup', notes: 'Note 1' }
      ];

      await expect(updateRecipeIngredients(recipeId, ingredients))
        .rejects.toThrow('Failed to insert new ingredients: Insert failed');
    });
  });

  describe('Recipe Analysis Functions', () => {
    test('analyzeIngredients should return compatibility and pH data', () => {
      const recipe = {
        ingredients: [
          { name: 'Water', category: 'water' },
          { name: 'Salt', category: 'neutral' }
        ]
      };

      const result = analyzeIngredients(recipe);
      expect(result).toHaveProperty('compatible');
      expect(result).toHaveProperty('pH');
      expect(typeof result.compatible).toBe('boolean');
      expect(typeof result.pH).toBe('number');
    });

    test('analyzeIngredients should handle empty ingredients', () => {
      const recipe = { ingredients: [] };
      const result = analyzeIngredients(recipe);
      
      expect(result.compatible).toBe(true);
      expect(result.pH).toBe(7); // Neutral pH
    });

    test('getRecipeTimeline should convert steps to timeline format', () => {
      const recipe = {
        steps: [
          { description: 'Mix ingredients', duration: 5 },
          { description: 'Heat mixture', duration: 10 }
        ]
      };

      const timeline = getRecipeTimeline(recipe);
      expect(timeline).toHaveLength(2);
      expect(timeline[0]).toHaveProperty('stepNumber', 1);
      expect(timeline[0]).toHaveProperty('description', 'Mix ingredients');
      expect(timeline[0]).toHaveProperty('duration', 5);
      expect(timeline[1]).toHaveProperty('stepNumber', 2);
    });

    test('getRecipeTimeline should handle missing steps', () => {
      const recipe = {};
      const timeline = getRecipeTimeline(recipe);
      expect(timeline).toEqual([]);
    });

    test('getBatchHistory should return formatted batch data', () => {
      const recipe = {
        batches: [
          { date: '2025-01-01', status: 'completed' },
          { date: '2025-02-01', status: 'in-progress' }
        ]
      };

      const batches = getBatchHistory(recipe);
      expect(batches).toHaveLength(2);
      expect(batches[0]).toHaveProperty('date', '2025-01-01');
      expect(batches[0]).toHaveProperty('status', 'completed');
    });

    test('getBatchHistory should handle missing batches', () => {
      const recipe = {};
      const batches = getBatchHistory(recipe);
      expect(batches).toEqual([]);
    });

    test('estimateShelfLife should calculate minimum shelf life', () => {
      const recipe = {
        ingredients: [
          { name: 'Milk', shelfLifeDays: 7 },
          { name: 'Honey', shelfLifeDays: 365 * 2 }
        ]
      };

      const shelfLife = estimateShelfLife(recipe);
      expect(shelfLife).toBe(7); // Should be the minimum shelf life
    });

    test('estimateShelfLife should handle missing shelf life data', () => {
      const recipe = {
        ingredients: [
          { name: 'Salt' }, // No shelf life specified
          { name: 'Pepper' } // No shelf life specified
        ]
      };

      const shelfLife = estimateShelfLife(recipe);
      expect(shelfLife).toBe(365); // Default is 365 days
    });
  });

  describe('Edge Cases', () => {
    test('loadRecipes should handle large result sets', async () => {
      // Create a large array of mock recipes
      const largeRecipeArray = Array(1000).fill(0).map((_, i) => ({
        id: `recipe-${i}`,
        title: `Recipe ${i}`
      }));
      
      const mockSelect = jest.fn().mockResolvedValue({ data: largeRecipeArray, error: null });
      
      supabaseClient.from.mockReturnValue({
        select: mockSelect
      });

      const recipes = await loadRecipes();
      expect(recipes).toHaveLength(1000);
      expect(recipes[0].id).toBe('recipe-0');
      expect(recipes[999].id).toBe('recipe-999');
    });

    test('updateRecipeIngredients should handle empty ingredients array', async () => {
      const mockDeleteEq = jest.fn().mockResolvedValue({ error: null });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockDeleteEq });
      
      supabaseClient.from.mockReturnValue({
        delete: mockDelete
      });

      const recipeId = 'recipe-123';
      const result = await updateRecipeIngredients(recipeId, []);
      
      expect(result).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
      expect(mockDeleteEq).toHaveBeenCalledWith('recipe_id', recipeId);
    });

    test('createNewRecipe should handle special characters in title', async () => {
      const specialTitle = 'Recipe with special chars: !@#$%^&*()';
      const mockRecipe = { id: 1, title: specialTitle, instructions: "" };
      
      const mockSelectInsert = jest.fn().mockResolvedValue({ data: [mockRecipe], error: null });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelectInsert });
      
      supabaseClient.from.mockReturnValue({
        insert: mockInsert
      });

      const recipe = await createNewRecipe(specialTitle);
      
      expect(recipe).toEqual(mockRecipe);
      expect(mockInsert).toHaveBeenCalledWith([{ title: specialTitle, instructions: "" }]);
    });

    test('addGlobalIngredient should handle long ingredient names', async () => {
      const longName = 'A'.repeat(255); // Max varchar length in many DBs
      const mockIngredient = { id: 1, name: longName };
      
      const mockSelectInsert = jest.fn().mockResolvedValue({ data: [mockIngredient], error: null });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelectInsert });
      
      supabaseClient.from.mockReturnValue({
        insert: mockInsert
      });

      const ingredient = await addGlobalIngredient(longName);
      
      expect(ingredient).toEqual(mockIngredient);
      expect(mockInsert).toHaveBeenCalledWith([{ name: longName }]);
    });
  });
});