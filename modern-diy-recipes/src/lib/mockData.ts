/**
 * Mock Data Provider
 * 
 * This file provides mock data for the application when the Supabase connection fails
 * or when running in a development environment without a proper backend connection.
 */

import { v4 as uuidv4 } from 'uuid';
import { Recipe, RecipeIngredient, Ingredient, RecipeIteration } from '@/types/models';

// Mock recipes
export const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Classic Sourdough Bread',
    description: 'Traditional sourdough bread recipe with complex flavors.',
    instructions: '1. Feed your starter 12 hours before baking.\n2. Mix flour, water, salt, and starter.\n3. Let rise for 4-6 hours.\n4. Shape and place in proofing basket.\n5. Proof for 2-3 hours or overnight in refrigerator.\n6. Preheat oven to 500°F with Dutch oven inside.\n7. Score and bake covered for 20 minutes.\n8. Remove lid and bake for another 20-25 minutes.\n9. Let cool completely before slicing.',
    notes: 'This recipe works best with a mature starter (at least 2 weeks old).',
    created_at: '2025-05-01T10:00:00Z',
    user_id: 'user1',
  },
  {
    id: '2',
    title: 'Dark Rye Sourdough',
    description: 'Rich dark rye sourdough with caraway seeds.',
    instructions: '1. Mix rye flour, bread flour, water, salt, caraway seeds, and starter.\n2. Let rise for 3-4 hours.\n3. Shape into batard.\n4. Proof for 2 hours.\n5. Bake at 450°F for 35-40 minutes.\n6. Let cool for at least 2 hours before slicing.',
    notes: 'The dough will be stickier than regular sourdough due to the rye flour.',
    created_at: '2025-05-02T10:00:00Z',
    user_id: 'user1',
  },
  {
    id: '3',
    title: 'Whole Wheat Sandwich Bread',
    description: 'Everyday sandwich bread with whole wheat flour.',
    instructions: '1. Mix whole wheat flour, bread flour, water, honey, oil, salt, and yeast.\n2. Knead for 10 minutes.\n3. Let rise until doubled.\n4. Shape and place in loaf pan.\n5. Let rise again until just above the rim of the pan.\n6. Bake at 375°F for 35 minutes.\n7. Cool completely before slicing.',
    notes: 'Substitute up to 25% of the whole wheat flour with other grains for variety.',
    created_at: '2025-05-03T10:00:00Z',
    user_id: 'user1',
  }
];

// Mock ingredients
export const mockIngredients: Ingredient[] = [
  { id: '1', name: 'Bread Flour', description: 'High protein flour ideal for bread baking', created_at: '2025-05-01T09:00:00Z' },
  { id: '2', name: 'Whole Wheat Flour', description: 'Stone-ground whole wheat flour', created_at: '2025-05-01T09:01:00Z' },
  { id: '3', name: 'Rye Flour', description: 'Medium rye flour', created_at: '2025-05-01T09:02:00Z' },
  { id: '4', name: 'Water', description: 'Filtered water, room temperature', created_at: '2025-05-01T09:03:00Z' },
  { id: '5', name: 'Salt', description: 'Fine sea salt', created_at: '2025-05-01T09:04:00Z' },
  { id: '6', name: 'Sourdough Starter', description: '100% hydration, mature starter', created_at: '2025-05-01T09:05:00Z' },
  { id: '7', name: 'Caraway Seeds', description: 'Whole caraway seeds', created_at: '2025-05-01T09:06:00Z' },
  { id: '8', name: 'Honey', description: 'Raw, unfiltered honey', created_at: '2025-05-01T09:07:00Z' },
  { id: '9', name: 'Olive Oil', description: 'Extra virgin olive oil', created_at: '2025-05-01T09:08:00Z' },
  { id: '10', name: 'Yeast', description: 'Active dry yeast', created_at: '2025-05-01T09:09:00Z' },
];

// Mock recipe ingredients relations
export const mockRecipeIngredients: RecipeIngredient[] = [
  // Classic Sourdough
  { id: '1', recipe_id: '1', ingredient_id: '1', quantity: 800, unit: 'g', created_at: '2025-05-01T10:00:00Z' },
  { id: '2', recipe_id: '1', ingredient_id: '4', quantity: 460, unit: 'g', created_at: '2025-05-01T10:00:00Z' },
  { id: '3', recipe_id: '1', ingredient_id: '5', quantity: 12, unit: 'g', created_at: '2025-05-01T10:00:00Z' },
  { id: '4', recipe_id: '1', ingredient_id: '6', quantity: 200, unit: 'g', created_at: '2025-05-01T10:00:00Z' },
  
  // Dark Rye Sourdough
  { id: '5', recipe_id: '2', ingredient_id: '1', quantity: 600, unit: 'g', created_at: '2025-05-02T10:00:00Z' },
  { id: '6', recipe_id: '2', ingredient_id: '3', quantity: 200, unit: 'g', created_at: '2025-05-02T10:00:00Z' },
  { id: '7', recipe_id: '2', ingredient_id: '4', quantity: 480, unit: 'g', created_at: '2025-05-02T10:00:00Z' },
  { id: '8', recipe_id: '2', ingredient_id: '5', quantity: 14, unit: 'g', created_at: '2025-05-02T10:00:00Z' },
  { id: '9', recipe_id: '2', ingredient_id: '6', quantity: 180, unit: 'g', created_at: '2025-05-02T10:00:00Z' },
  { id: '10', recipe_id: '2', ingredient_id: '7', quantity: 10, unit: 'g', created_at: '2025-05-02T10:00:00Z' },
  
  // Whole Wheat Sandwich Bread
  { id: '11', recipe_id: '3', ingredient_id: '1', quantity: 250, unit: 'g', created_at: '2025-05-03T10:00:00Z' },
  { id: '12', recipe_id: '3', ingredient_id: '2', quantity: 250, unit: 'g', created_at: '2025-05-03T10:00:00Z' },
  { id: '13', recipe_id: '3', ingredient_id: '4', quantity: 350, unit: 'g', created_at: '2025-05-03T10:00:00Z' },
  { id: '14', recipe_id: '3', ingredient_id: '5', quantity: 10, unit: 'g', created_at: '2025-05-03T10:00:00Z' },
  { id: '15', recipe_id: '3', ingredient_id: '8', quantity: 30, unit: 'g', created_at: '2025-05-03T10:00:00Z' },
  { id: '16', recipe_id: '3', ingredient_id: '9', quantity: 30, unit: 'g', created_at: '2025-05-03T10:00:00Z' },
  { id: '17', recipe_id: '3', ingredient_id: '10', quantity: 7, unit: 'g', created_at: '2025-05-03T10:00:00Z' },
];

// Mock recipe iterations
export const mockRecipeIterations: RecipeIteration[] = [
  // Classic Sourdough
  { 
    id: '1', 
    recipe_id: '1', 
    version: 1, 
    notes: 'First attempt. Good flavor but could use more rise time.', 
    created_at: '2025-05-02T15:00:00Z'
  },
  { 
    id: '2', 
    recipe_id: '1', 
    version: 2, 
    notes: 'Increased rise time to 6 hours. Much better oven spring.', 
    created_at: '2025-05-09T15:00:00Z'
  },
  
  // Dark Rye Sourdough
  { 
    id: '3', 
    recipe_id: '2', 
    version: 1, 
    notes: 'First attempt. Good flavor but a bit dense.', 
    created_at: '2025-05-04T16:00:00Z'
  },
  
  // Whole Wheat Sandwich Bread
  { 
    id: '4', 
    recipe_id: '3', 
    version: 1, 
    notes: 'First attempt. Good texture, but could use more honey for sweetness.', 
    created_at: '2025-05-04T17:00:00Z'
  },
  { 
    id: '5', 
    recipe_id: '3', 
    version: 2, 
    notes: 'Increased honey to 45g. Perfect sweetness now.', 
    created_at: '2025-05-10T14:00:00Z'
  },
];

// Helper function to get a complete recipe with ingredients and iterations
export function getMockRecipeWithDetails(recipeId: string) {
  const recipe = mockRecipes.find(r => r.id === recipeId);
  
  if (!recipe) {
    return null;
  }
  
  // Get recipe ingredients
  const recipeIngredients = mockRecipeIngredients.filter(ri => ri.recipe_id === recipeId);
  
  // Transform ingredients to the expected format
  const transformedIngredients = recipeIngredients.map(ri => {
    const ingredient = mockIngredients.find(i => i.id === ri.ingredient_id);
    return {
      id: ingredient?.id || '',
      name: ingredient?.name || 'Unknown',
      description: ingredient?.description || '',
      quantity: ri.quantity,
      unit: ri.unit,
      recipe_ingredient_id: ri.id
    };
  });
  
  // Get recipe iterations
  const iterations = mockRecipeIterations.filter(it => it.recipe_id === recipeId);
  
  return {
    ...recipe,
    ingredients: transformedIngredients,
    iterations: iterations
  };
}

// Helper function to get all recipes with their ingredients
export function getAllMockRecipes() {
  return mockRecipes.map(recipe => {
    const recipeIngredients = mockRecipeIngredients.filter(ri => ri.recipe_id === recipe.id);
    
    const transformedIngredients = recipeIngredients.map(ri => {
      const ingredient = mockIngredients.find(i => i.id === ri.ingredient_id);
      return {
        id: ingredient?.id || '',
        name: ingredient?.name || 'Unknown',
        description: ingredient?.description || '',
        quantity: ri.quantity,
        unit: ri.unit,
        recipe_ingredient_id: ri.id,
        notes: null
      };
    });
    
    const iterations = mockRecipeIterations.filter(it => it.recipe_id === recipe.id);
    
    return {
      ...recipe,
      ingredients: transformedIngredients,
      iterations: iterations
    };
  });
}

// Helper function to get all ingredients
export function getAllMockIngredients() {
  return mockIngredients;
}

// Create a mock Supabase client that returns the mock data
export const createMockSupabaseClient = () => {
  return {
    from: (table: string) => ({
      select: (query: string = '*') => {
        // For simple select calls, return the appropriate mock data immediately
        if (table === 'recipes') {
          // When selecting all recipes, return complete recipe data with ingredients and iterations
          const allRecipesWithDetails = getAllMockRecipes();
          return {
            data: allRecipesWithDetails,
            error: null,
            // Add query modifiers
            eq: (field: string, value: any) => {
              if (field === 'id') {
                const recipe = mockRecipes.find(r => r.id === value);
                if (recipe) {
                  // If we're looking up a recipe by ID, return the complete recipe with ingredients
                  const completeRecipe = getMockRecipeWithDetails(recipe.id);
                  return {
                    data: completeRecipe,
                    error: null,
                    single: () => Promise.resolve({ data: completeRecipe, error: null })
                  };
                }
                return Promise.resolve({ data: recipe, error: null });
              }
              const filteredRecipes = mockRecipes.filter(r => (r as any)[field] === value);
              return Promise.resolve({ data: filteredRecipes, error: null });
            },
            in: (field: string, values: any[]) => {
              const filtered = mockRecipes.filter(r => values.includes((r as any)[field]));
              return Promise.resolve({ data: filtered, error: null });
            },
            single: () => {
              return Promise.resolve({ data: mockRecipes[0], error: null });
            },
            order: (field: string, { ascending = true }: { ascending: boolean }) => {
              // Order by the specified field
              const sorted = [...mockRecipes].sort((a, b) => {
                const aValue = (a as any)[field];
                const bValue = (b as any)[field];
                return ascending 
                  ? aValue > bValue ? 1 : -1
                  : aValue < bValue ? 1 : -1;
              });
              return Promise.resolve({ 
                data: sorted, 
                error: null,
                eq: (field: string, value: any) => {
                  if (field === 'id') {
                    const recipe = sorted.find(r => r.id === value);
                    if (recipe) {
                      return {
                        data: recipe,
                        error: null,
                        single: () => Promise.resolve({ data: recipe, error: null })
                      };
                    }
                  }
                  const filtered = sorted.filter(r => (r as any)[field] === value);
                  return Promise.resolve({ data: filtered, error: null });
                }
              });
            }
          };
        }
        
        if (table === 'ingredients') {
          return {
            data: mockIngredients,
            error: null,
            eq: (field: string, value: any) => {
              if (field === 'id') {
                const ingredient = mockIngredients.find(i => i.id === value);
                return Promise.resolve({ data: ingredient, error: null });
              }
              const filteredIngredients = mockIngredients.filter(i => (i as any)[field] === value);
              return Promise.resolve({ data: filteredIngredients, error: null });
            },
            in: (field: string, values: any[]) => {
              const filtered = mockIngredients.filter(i => values.includes((i as any)[field]));
              return Promise.resolve({ data: filtered, error: null });
            },
            single: () => {
              return Promise.resolve({ data: mockIngredients[0], error: null });
            },
            order: (field: string, { ascending = true }: { ascending: boolean }) => {
              // Order by the specified field
              const sorted = [...mockIngredients].sort((a, b) => {
                const aValue = (a as any)[field];
                const bValue = (b as any)[field];
                return ascending 
                  ? aValue > bValue ? 1 : -1
                  : aValue < bValue ? 1 : -1;
              });
              return Promise.resolve({ data: sorted, error: null });
            }
          };
        }
        
        if (table === 'recipe_ingredients') {
          return {
            data: mockRecipeIngredients,
            error: null,
            eq: (field: string, value: any) => {
              const filtered = mockRecipeIngredients.filter(ri => (ri as any)[field] === value);
              return Promise.resolve({ 
                data: filtered, 
                error: null,
                select: () => Promise.resolve({ data: filtered, error: null })
              });
            },
            in: (field: string, values: any[]) => {
              const filtered = mockRecipeIngredients.filter(ri => values.includes((ri as any)[field]));
              return Promise.resolve({ 
                data: filtered, 
                error: null,
                select: () => Promise.resolve({ data: filtered, error: null })
              });
            },
            select: () => Promise.resolve({ data: mockRecipeIngredients, error: null })
          };
        }
        
        if (table === 'iterations') {
          return {
            data: mockRecipeIterations,
            error: null,
            eq: (field: string, value: any) => {
              const filtered = mockRecipeIterations.filter(it => (it as any)[field] === value);
              return Promise.resolve({ data: filtered, error: null });
            },
            order: (field: string, { ascending = true }: { ascending: boolean }) => {
              const sorted = [...mockRecipeIterations].sort((a, b) => {
                const aValue = (a as any)[field];
                const bValue = (b as any)[field];
                return ascending 
                  ? aValue > bValue ? 1 : -1
                  : aValue < bValue ? 1 : -1;
              });
              return Promise.resolve({ data: sorted, error: null });
            }
          };
        }
        
        // Default empty response for unknown tables
        return {
          data: [],
          error: null,
          eq: () => Promise.resolve({ data: [], error: null }),
          in: () => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => Promise.resolve({ data: [], error: null })
        };
      },
      insert: (data: any) => {
        if (table === 'recipes') {
          const newRecipe = {
            ...data,
            id: uuidv4(),
            created_at: new Date().toISOString()
          };
          return Promise.resolve({ data: newRecipe, error: null });
        }
        
        return Promise.resolve({ data: null, error: null });
      },
      update: (data: any) => ({
        eq: (field: string, value: any) => {
          if (table === 'recipes' && field === 'id') {
            return Promise.resolve({ data: { ...data, id: value }, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        }
      }),
      delete: () => ({
        eq: () => {
          return Promise.resolve({ data: null, error: null });
        }
      })
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: { user: { id: 'mock-user-id' } } }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    channel: (channelName: string) => ({
      on: () => ({
        subscribe: () => {}
      })
    }),
    removeChannel: () => {}
  };
};