import { loadRecipes, loadAllIngredients, createNewRecipe, addNewIngredientToRecipe, addGlobalIngredient, removeIngredientFromRecipe, removeGlobalIngredient } from '../js/api.js';
import { supabaseClient } from '../js/supabaseClient.js';

jest.mock('../js/supabaseClient.js');

describe('API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loadRecipes should return recipes', async () => {
    const mockData = [{ id: 1, name: 'Recipe 1' }];
    supabaseClient.from.mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
    });

    const recipes = await loadRecipes();
    expect(recipes).toEqual(mockData);
  });

  test('loadAllIngredients should return ingredients', async () => {
    const mockData = [{ id: 1, name: 'Ingredient 1' }];
    supabaseClient.from.mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
    });

    const ingredients = await loadAllIngredients();
    expect(ingredients).toEqual(mockData);
  });

  test('createNewRecipe should create a new recipe', async () => {
    const mockRecipe = { id: 1, name: 'New Recipe' };
    supabaseClient.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: [mockRecipe], error: null }),
    });

    const recipe = await createNewRecipe('New Recipe');
    expect(recipe).toEqual(mockRecipe);
  });

  test('addNewIngredientToRecipe should add an ingredient', async () => {
    const mockRecipe = { id: 1, ingredients: [] };
    const mockIngredient = { name: 'New Ingredient' };
    supabaseClient.from.mockReturnValue({
      update: jest.fn().mockResolvedValue({ error: null }),
    });

    const updatedRecipe = await addNewIngredientToRecipe(mockRecipe, mockIngredient);
    expect(updatedRecipe.ingredients).toContain(mockIngredient);
  });

  test('addGlobalIngredient should add a new ingredient', async () => {
    const mockIngredient = { id: 1, name: 'New Ingredient' };
    supabaseClient.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: [mockIngredient], error: null }),
    });

    const ingredient = await addGlobalIngredient('New Ingredient');
    expect(ingredient).toEqual(mockIngredient);
  });

  test('removeIngredientFromRecipe should remove an ingredient', async () => {
    const mockRecipe = { id: 1, ingredients: [{ name: 'Ingredient 1' }] };
    supabaseClient.from.mockReturnValue({
      update: jest.fn().mockResolvedValue({ error: null }),
    });

    const updatedRecipe = await removeIngredientFromRecipe(mockRecipe, 0);
    expect(updatedRecipe.ingredients).toHaveLength(0);
  });

  test('removeGlobalIngredient should remove an ingredient', async () => {
    supabaseClient.from.mockReturnValue({
      delete: jest.fn().mockResolvedValue({ error: null }),
    });

    const result = await removeGlobalIngredient(1);
    expect(result).toBe(true);
  });
});