import { loadRecipes, loadAllIngredients, createNewRecipe, addGlobalIngredient, removeGlobalIngredient, updateRecipeIngredients } from '../js/api.js'; // Removed obsolete imports, added updateRecipeIngredients
import { supabaseClient } from '../js/supabaseClient.js';

jest.mock('../js/supabaseClient.js', () => {
  return {
    supabaseClient: {
      from: jest.fn().mockReturnValue({
        // More granular mocking needed for chained methods
        select: jest.fn().mockReturnThis(), // Return `this` to allow chaining
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        // Mock the final promise resolution
        then: jest.fn((resolve) => resolve({ data: [], error: null })), // Default success
      }),
    },
  };
});

describe('API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loadRecipes should return recipes', async () => {
    const mockData = [{ id: 1, name: 'Recipe 1' }];
    // Refined mock setup for loadRecipes
    const mockSelect = jest.fn().mockResolvedValue({ data: mockData, error: null });
    supabaseClient.from.mockReturnValue({
      select: mockSelect,
    });

    const recipes = await loadRecipes();
    expect(recipes).toEqual(mockData);
    expect(supabaseClient.from).toHaveBeenCalledWith('recipes');
    expect(mockSelect).toHaveBeenCalledWith('*');
  });

  test('loadRecipes should throw error on failure', async () => {
    const mockError = new Error('Supabase fetch failed');
    supabaseClient.from.mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: null, error: mockError }),
    });

    await expect(loadRecipes()).rejects.toThrow('Failed to load recipes: Supabase fetch failed');
  });

  test('loadAllIngredients should return ingredients', async () => {
    const mockData = [{ id: 1, name: 'Ingredient 1' }];
    // Refined mock setup for loadAllIngredients
    const mockLimit = jest.fn().mockResolvedValue({ data: mockData, error: null });
    const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    supabaseClient.from.mockReturnValue({
      select: mockSelect,
    });

    const ingredients = await loadAllIngredients();
    expect(ingredients).toEqual(mockData);
    expect(supabaseClient.from).toHaveBeenCalledWith('ingredients');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true });
    expect(mockLimit).toHaveBeenCalledWith(1000);
  });

  test('loadAllIngredients should throw error on failure', async () => {
    const mockError = new Error('Supabase fetch failed');
     const mockLimit = jest.fn().mockResolvedValue({ data: null, error: mockError });
     const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
     const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
     supabaseClient.from.mockReturnValue({
       select: mockSelect,
     });

    await expect(loadAllIngredients()).rejects.toThrow('Failed to load ingredients: Supabase fetch failed');
  });

  test('createNewRecipe should create a new recipe', async () => {
    const mockRecipe = { id: 1, title: 'New Recipe', instructions: "" }; // Match expected structure
    // Refined mock setup for createNewRecipe
    const mockSelectInsert = jest.fn().mockResolvedValue({ data: [mockRecipe], error: null });
    const mockInsert = jest.fn().mockReturnValue({ select: mockSelectInsert });
    supabaseClient.from.mockReturnValue({
      insert: mockInsert,
    });

    const recipe = await createNewRecipe('New Recipe'); // Only pass name
    expect(recipe).toEqual(mockRecipe);
    expect(supabaseClient.from).toHaveBeenCalledWith('recipes');
    expect(mockInsert).toHaveBeenCalledWith([{ title: 'New Recipe', instructions: "" }]);
    expect(mockSelectInsert).toHaveBeenCalled();
  });

  test('createNewRecipe should throw error on failure', async () => {
    const mockError = new Error('Supabase insert failed');
    const mockSelectInsert = jest.fn().mockResolvedValue({ data: null, error: mockError });
    const mockInsert = jest.fn().mockReturnValue({ select: mockSelectInsert });
    supabaseClient.from.mockReturnValue({
      insert: mockInsert,
    });

    await expect(createNewRecipe('New Recipe')).rejects.toThrow('Failed to create recipe: Supabase insert failed');
  });

  // Removed test for obsolete addNewIngredientToRecipe

  test('addGlobalIngredient should add a new ingredient', async () => {
    const mockIngredient = { id: 1, name: 'New Ingredient' };
    // Refined mock setup
    const mockSelectInsert = jest.fn().mockResolvedValue({ data: [mockIngredient], error: null });
    const mockInsert = jest.fn().mockReturnValue({ select: mockSelectInsert });
    supabaseClient.from.mockReturnValue({
      insert: mockInsert,
    });

    const ingredient = await addGlobalIngredient('New Ingredient');
    expect(ingredient).toEqual(mockIngredient);
    expect(supabaseClient.from).toHaveBeenCalledWith('ingredients');
    expect(mockInsert).toHaveBeenCalledWith([{ name: 'New Ingredient' }]);
    expect(mockSelectInsert).toHaveBeenCalled();
  });

  test('addGlobalIngredient should throw error on failure', async () => {
    const mockError = new Error('Supabase insert failed');
    const mockSelectInsert = jest.fn().mockResolvedValue({ data: null, error: mockError });
    const mockInsert = jest.fn().mockReturnValue({ select: mockSelectInsert });
    supabaseClient.from.mockReturnValue({
      insert: mockInsert,
    });

    await expect(addGlobalIngredient('New Ingredient')).rejects.toThrow('Failed to add global ingredient: Supabase insert failed');
  });

  // Removed test for obsolete removeIngredientFromRecipe

  test('removeGlobalIngredient should remove an ingredient', async () => {
    // Refined mock setup
    const mockEq = jest.fn().mockResolvedValue({ error: null });
    const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
    supabaseClient.from.mockReturnValue({
      delete: mockDelete,
    });

    const result = await removeGlobalIngredient(1);
    expect(result).toBe(true);
    expect(supabaseClient.from).toHaveBeenCalledWith('ingredients');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', 1);
  });
});

test('removeGlobalIngredient should throw error on failure', async () => {
  const mockError = new Error('Supabase delete failed');
  const mockEq = jest.fn().mockResolvedValue({ error: mockError });
  const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
  supabaseClient.from.mockReturnValue({
    delete: mockDelete,
  });

  await expect(removeGlobalIngredient(1)).rejects.toThrow('Failed to remove global ingredient: Supabase delete failed');
});

// --- Tests for updateRecipeIngredients ---
describe('updateRecipeIngredients', () => {
  const recipeId = 'recipe-123';
  const ingredients = [
    { id: 'ing-1', quantity: '1', unit: 'cup', notes: 'Note 1' },
    { id: 'ing-2', quantity: '2', unit: 'tbsp', notes: null },
  ];
  const ingredientsToInsert = ingredients.map(ing => ({
    recipe_id: recipeId,
    ingredient_id: ing.id,
    quantity: ing.quantity,
    unit: ing.unit,
    notes: ing.notes,
  }));

  test('should delete existing and insert new ingredients successfully', async () => {
    const mockDeleteEq = jest.fn().mockResolvedValue({ error: null });
    const mockDelete = jest.fn().mockReturnValue({ eq: mockDeleteEq });
    const mockInsertSelect = jest.fn().mockResolvedValue({ data: ingredientsToInsert, error: null });
    const mockInsert = jest.fn().mockReturnValue({ select: mockInsertSelect });

    // Setup separate mocks for delete and insert calls
    supabaseClient.from
      .mockReturnValueOnce({ delete: mockDelete }) // For the delete call
      .mockReturnValueOnce({ insert: mockInsert }); // For the insert call

    const result = await updateRecipeIngredients(recipeId, ingredients);

    expect(result).toBe(true);
    expect(supabaseClient.from).toHaveBeenCalledWith('recipeingredients');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockDeleteEq).toHaveBeenCalledWith('recipe_id', recipeId);
    expect(mockInsert).toHaveBeenCalledWith(ingredientsToInsert);
    expect(mockInsertSelect).toHaveBeenCalled();
  });

   test('should handle empty ingredients list (only delete)', async () => {
    const mockDeleteEq = jest.fn().mockResolvedValue({ error: null });
    const mockDelete = jest.fn().mockReturnValue({ eq: mockDeleteEq });
    const mockInsert = jest.fn(); // Should not be called

    supabaseClient.from
      .mockReturnValueOnce({ delete: mockDelete }) // For the delete call
      .mockReturnValueOnce({ insert: mockInsert }); // Mock insert but expect no call

    const result = await updateRecipeIngredients(recipeId, []);

    expect(result).toBe(true);
    expect(supabaseClient.from).toHaveBeenCalledWith('recipeingredients');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockDeleteEq).toHaveBeenCalledWith('recipe_id', recipeId);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  test('should throw error if delete fails', async () => {
    const mockError = new Error('Delete failed');
    const mockDeleteEq = jest.fn().mockResolvedValue({ error: mockError });
    const mockDelete = jest.fn().mockReturnValue({ eq: mockDeleteEq });
    const mockInsert = jest.fn(); // Should not be called

    supabaseClient.from
      .mockReturnValueOnce({ delete: mockDelete })
      .mockReturnValueOnce({ insert: mockInsert });

    await expect(updateRecipeIngredients(recipeId, ingredients))
      .rejects.toThrow(`Failed to delete old ingredients: ${mockError.message}`);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  test('should throw error if insert fails', async () => {
    const mockError = new Error('Insert failed');
    const mockDeleteEq = jest.fn().mockResolvedValue({ error: null }); // Delete succeeds
    const mockDelete = jest.fn().mockReturnValue({ eq: mockDeleteEq });
    const mockInsertSelect = jest.fn().mockResolvedValue({ data: null, error: mockError }); // Insert fails
    const mockInsert = jest.fn().mockReturnValue({ select: mockInsertSelect });

    supabaseClient.from
      .mockReturnValueOnce({ delete: mockDelete })
      .mockReturnValueOnce({ insert: mockInsert });

    await expect(updateRecipeIngredients(recipeId, ingredients))
      .rejects.toThrow(`Failed to insert new ingredients: ${mockError.message}`);
    expect(mockDeleteEq).toHaveBeenCalled(); // Verify delete was attempted
  });
});