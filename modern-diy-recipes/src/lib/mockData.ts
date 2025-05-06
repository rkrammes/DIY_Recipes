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
    title: 'DIY Moisturizing Soap Bar',
    description: 'A nourishing handmade soap with shea butter and essential oils that moisturizes while cleansing.',
    instructions: 'Step 1: Prepare your workspace and gather all ingredients.\nStep 2: Measure all oils and butters precisely using a digital scale.\nStep 3: Melt coconut oil, olive oil, castor oil, and shea butter in a double boiler.\nStep 4: In a well-ventilated area, slowly add lye to cold distilled water in a heat-resistant container.\nStep 5: Allow both the oils and lye water to cool to approximately 100-110°F.\nStep 6: Slowly pour the lye water into the oils while stirring gently.\nStep 7: Use a stick blender to blend until medium trace is achieved (pudding-like consistency).\nStep 8: Add lavender and chamomile essential oils along with vitamin E oil.\nStep 9: Mix briefly to incorporate, being careful not to over-blend.\nStep 10: Pour into prepared molds and tap gently to remove air bubbles.\nStep 11: Cover with parchment paper and insulate with towels.\nStep 12: Let set for 24-48 hours before unmolding.\nStep 13: Cut into bars and cure for 4-6 weeks in a cool, dry place with good air circulation.',
    notes: 'Handle lye with extreme caution. Always wear protective gear including goggles, gloves, and long sleeves. Work in a well-ventilated area.',
    created_at: '2025-05-01T10:00:00Z',
    user_id: 'user1',
  },
  {
    id: '2',
    title: 'Natural Aloe & Mint Face Cream',
    description: 'A lightweight, hydrating face cream with aloe vera and refreshing peppermint.',
    instructions: 'Step 1: Sanitize all equipment with rubbing alcohol and work on clean surfaces.\nStep 2: Combine all oil phase ingredients in a heat-resistant container.\nStep 3: Combine all water phase ingredients in a separate heat-resistant container.\nStep 4: Heat both phases to 158°F (70°C) and maintain temperature for 20 minutes to ensure proper sanitization.\nStep 5: Slowly pour the water phase into the oil phase while continuously stirring.\nStep 6: Blend with a stick blender for 2-3 minutes until emulsified.\nStep 7: Allow to cool to 104°F (40°C) before adding the cooling phase ingredients.\nStep 8: Add preservative and mix thoroughly.\nStep 9: Pour into sterilized containers and allow to cool completely before sealing.\nStep 10: Label with ingredients and production date.',
    notes: 'Always use a broad-spectrum preservative to prevent bacterial and fungal growth. Shelf life is approximately 3-6 months when stored properly.',
    created_at: '2025-05-02T10:00:00Z',
    user_id: 'user1',
  },
  {
    id: '3',
    title: 'Lavender Bath Bombs',
    description: 'Relaxing lavender-scented bath bombs with skin-nourishing ingredients.',
    instructions: 'Step 1: Combine all dry ingredients in a large bowl, mixing thoroughly.\nStep 2: In a separate small container, mix the wet ingredients.\nStep 3: Very slowly add the wet mixture to the dry ingredients, a few drops at a time, while constantly stirring.\nStep 4: Test the mixture by squeezing it in your hand - it should hold together like wet sand.\nStep 5: Quickly press the mixture firmly into molds.\nStep 6: Let the bath bombs set in the molds for 24 hours.\nStep 7: Carefully remove from molds and allow to cure for an additional 24-48 hours.\nStep 8: Store in an airtight container in a cool, dry place.',
    notes: "If the mixture fizzes during preparation, you are adding the wet ingredients too quickly. Work in a low humidity environment for best results.",
    created_at: '2025-05-03T10:00:00Z',
    user_id: 'user1',
  }
];

// Mock ingredients
export const mockIngredients: Ingredient[] = [
  { id: '1', name: 'Coconut Oil', description: 'Provides cleansing and lathering properties', created_at: '2025-05-01T09:00:00Z' },
  { id: '2', name: 'Olive Oil', description: 'Adds moisturizing properties to skincare formulations', created_at: '2025-05-01T09:01:00Z' },
  { id: '3', name: 'Shea Butter', description: 'Provides extra moisturizing and skin-nourishing benefits', created_at: '2025-05-01T09:02:00Z' },
  { id: '4', name: 'Distilled Water', description: 'Used as a base for water phase in formulations', created_at: '2025-05-01T09:03:00Z' },
  { id: '5', name: 'Lye (Sodium Hydroxide)', description: 'Required for saponification process in soap making', created_at: '2025-05-01T09:04:00Z' },
  { id: '6', name: 'Castor Oil', description: 'Creates a stable, creamy lather in soap and adds shine to lip products', created_at: '2025-05-01T09:05:00Z' },
  { id: '7', name: 'Lavender Essential Oil', description: 'Provides fragrance and mild therapeutic properties', created_at: '2025-05-01T09:06:00Z' },
  { id: '8', name: 'Vitamin E Oil', description: 'Natural preservative and skin-nourishing antioxidant', created_at: '2025-05-01T09:07:00Z' },
  { id: '9', name: 'Baking Soda', description: 'Base component for bath bombs and provides mild exfoliation', created_at: '2025-05-01T09:08:00Z' },
  { id: '10', name: 'Citric Acid', description: 'Reacts with baking soda in bath bombs to create fizzing action', created_at: '2025-05-01T09:09:00Z' },
  { id: '11', name: 'Aloe Vera Gel', description: 'Soothing, hydrating base for skincare products', created_at: '2025-05-01T09:10:00Z' },
  { id: '12', name: 'Emulsifying Wax', description: 'Helps bind oil and water phases in lotions and creams', created_at: '2025-05-01T09:11:00Z' },
  { id: '13', name: 'Peppermint Essential Oil', description: 'Cooling, refreshing scent for skincare products', created_at: '2025-05-01T09:12:00Z' },
  { id: '14', name: 'Broad Spectrum Preservative', description: 'Prevents bacterial and fungal growth in water-containing formulations', created_at: '2025-05-01T09:13:00Z' },
];

// Mock recipe ingredients relations
export const mockRecipeIngredients: RecipeIngredient[] = [
  // DIY Moisturizing Soap Bar
  { id: '1', recipe_id: '1', ingredient_id: '1', quantity: 16, unit: 'oz', created_at: '2025-05-01T10:00:00Z' },
  { id: '2', recipe_id: '1', ingredient_id: '2', quantity: 12, unit: 'oz', created_at: '2025-05-01T10:00:00Z' },
  { id: '3', recipe_id: '1', ingredient_id: '3', quantity: 4, unit: 'oz', created_at: '2025-05-01T10:00:00Z' },
  { id: '4', recipe_id: '1', ingredient_id: '4', quantity: 10, unit: 'oz', created_at: '2025-05-01T10:00:00Z' },
  { id: '5', recipe_id: '1', ingredient_id: '5', quantity: 4.7, unit: 'oz', created_at: '2025-05-01T10:00:00Z' },
  { id: '6', recipe_id: '1', ingredient_id: '6', quantity: 2, unit: 'oz', created_at: '2025-05-01T10:00:00Z' },
  { id: '7', recipe_id: '1', ingredient_id: '7', quantity: 1.5, unit: 'oz', created_at: '2025-05-01T10:00:00Z' },
  { id: '8', recipe_id: '1', ingredient_id: '8', quantity: 1, unit: 'tsp', created_at: '2025-05-01T10:00:00Z' },
  
  // Natural Aloe & Mint Face Cream
  { id: '9', recipe_id: '2', ingredient_id: '11', quantity: 60, unit: 'g', created_at: '2025-05-02T10:00:00Z' },
  { id: '10', recipe_id: '2', ingredient_id: '4', quantity: 30, unit: 'g', created_at: '2025-05-02T10:00:00Z' },
  { id: '11', recipe_id: '2', ingredient_id: '12', quantity: 10, unit: 'g', created_at: '2025-05-02T10:00:00Z' },
  { id: '12', recipe_id: '2', ingredient_id: '3', quantity: 5, unit: 'g', created_at: '2025-05-02T10:00:00Z' },
  { id: '13', recipe_id: '2', ingredient_id: '13', quantity: 3, unit: 'drops', created_at: '2025-05-02T10:00:00Z' },
  { id: '14', recipe_id: '2', ingredient_id: '8', quantity: 0.5, unit: 'g', created_at: '2025-05-02T10:00:00Z' },
  { id: '15', recipe_id: '2', ingredient_id: '14', quantity: 1, unit: 'g', created_at: '2025-05-02T10:00:00Z' },
  
  // Lavender Bath Bombs
  { id: '16', recipe_id: '3', ingredient_id: '9', quantity: 200, unit: 'g', created_at: '2025-05-03T10:00:00Z' },
  { id: '17', recipe_id: '3', ingredient_id: '10', quantity: 100, unit: 'g', created_at: '2025-05-03T10:00:00Z' },
  { id: '18', recipe_id: '3', ingredient_id: '4', quantity: 10, unit: 'ml', created_at: '2025-05-03T10:00:00Z' },
  { id: '19', recipe_id: '3', ingredient_id: '7', quantity: 15, unit: 'drops', created_at: '2025-05-03T10:00:00Z' },
  { id: '20', recipe_id: '3', ingredient_id: '1', quantity: 15, unit: 'g', created_at: '2025-05-03T10:00:00Z' },
  { id: '21', recipe_id: '3', ingredient_id: '3', quantity: 10, unit: 'g', created_at: '2025-05-03T10:00:00Z' },
];

// Mock recipe iterations
export const mockRecipeIterations: RecipeIteration[] = [
  // DIY Moisturizing Soap Bar
  { 
    id: '1', 
    recipe_id: '1', 
    version_number: 1, 
    title: 'DIY Moisturizing Soap Bar - Basic',
    description: 'A basic moisturizing soap recipe with shea butter. Good for beginners.',
    notes: 'First attempt at soap making. Came out well but needs some adjustments for better lathering.', 
    instructions: 'Step 1: Prepare all your ingredients and measure them accurately.\nStep 2: Melt the coconut oil and shea butter in a double boiler.\nStep 3: Slowly add the lye to cold water in a separate container (never add water to lye).\nStep 4: Once both mixtures reach about 100°F, slowly pour the lye water into the oils.\nStep 5: Blend with a stick blender until trace is reached.\nStep 6: Add essential oils and mix briefly.\nStep 7: Pour into molds and insulate with towels.\nStep 8: Let set for 24-48 hours before unmolding.\nStep 9: Cure for 4-6 weeks before using.',
    created_at: '2025-05-02T15:00:00Z',
    metrics: {
      ph_level: 9.5,
      hardness: 45,
      cure_time: 28
    }
  },
  { 
    id: '2', 
    recipe_id: '1', 
    version_number: 2, 
    title: 'DIY Moisturizing Soap Bar - Improved',
    description: 'An improved version with better lathering and added essential oils for fragrance.',
    notes: 'Increased the amount of coconut oil for better lathering. Added lavender essential oil for fragrance.', 
    instructions: 'Step 1: Prepare all your ingredients and measure them accurately.\nStep 2: Melt the coconut oil, olive oil, and shea butter in a double boiler.\nStep 3: Slowly add the lye to cold water in a separate container (never add water to lye).\nStep 4: Once both mixtures reach about 100°F, slowly pour the lye water into the oils.\nStep 5: Blend with a stick blender until medium trace is reached.\nStep 6: Add lavender essential oil and mix briefly.\nStep 7: Pour into molds and insulate with towels.\nStep 8: Let set for 24-48 hours before unmolding.\nStep 9: Cure for 4-6 weeks before using.',
    created_at: '2025-05-09T15:00:00Z',
    metrics: {
      ph_level: 8.9,
      hardness: 50,
      cure_time: 28
    }
  },
  { 
    id: '3', 
    recipe_id: '1', 
    version_number: 3, 
    title: 'DIY Moisturizing Soap Bar - Advanced',
    description: 'The most advanced version with a perfect balance of ingredients for maximum moisturizing effect.',
    notes: 'Final iteration with balanced oils for optimal cleansing and moisturizing. Added vitamin E as a natural preservative.', 
    instructions: 'Step 1: Prepare your workspace and gather all ingredients.\nStep 2: Measure all oils and butters precisely using a digital scale.\nStep 3: Melt coconut oil, olive oil, castor oil, and shea butter in a double boiler.\nStep 4: In a well-ventilated area, slowly add lye to cold distilled water in a heat-resistant container.\nStep 5: Allow both the oils and lye water to cool to approximately 100-110°F.\nStep 6: Slowly pour the lye water into the oils while stirring gently.\nStep 7: Use a stick blender to blend until medium trace is achieved (pudding-like consistency).\nStep 8: Add lavender and chamomile essential oils along with vitamin E oil.\nStep 9: Mix briefly to incorporate, being careful not to over-blend.\nStep 10: Pour into prepared molds and tap gently to remove air bubbles.\nStep 11: Cover with parchment paper and insulate with towels.\nStep 12: Let set for 24-48 hours before unmolding.\nStep 13: Cut into bars and cure for 4-6 weeks in a cool, dry place with good air circulation.',
    created_at: '2025-05-12T15:00:00Z',
    metrics: {
      ph_level: 8.2,
      hardness: 55,
      cure_time: 35
    }
  },
  
  // Natural Aloe & Mint Face Cream
  { 
    id: '4', 
    recipe_id: '2', 
    version_number: 1, 
    title: 'Natural Aloe & Mint Face Cream - Initial',
    description: 'First attempt at a lightweight face cream with aloe vera.',
    notes: 'Good texture but the mint scent is too subtle. Could use more hydrating ingredients.', 
    instructions: 'Step 1: Sanitize all equipment with rubbing alcohol.\nStep 2: Combine oil phase ingredients and heat to 70°C.\nStep 3: Combine water phase ingredients and heat to 70°C.\nStep 4: Add water phase to oil phase while stirring.\nStep 5: Cool to 40°C and add preservative and essential oils.\nStep 6: Package in sterilized containers.',
    created_at: '2025-05-04T16:00:00Z',
    metrics: {
      ph_level: 6.2,
      viscosity: 35,
      shelf_life: 90
    }
  },
  { 
    id: '5', 
    recipe_id: '2', 
    version_number: 2, 
    title: 'Natural Aloe & Mint Face Cream - Enhanced',
    description: 'Improved version with enhanced hydration and stronger mint scent.',
    notes: 'Increased the peppermint essential oil for a more pronounced cooling effect. Added more aloe vera for hydration.', 
    instructions: 'Step 1: Sanitize all equipment with rubbing alcohol and work on clean surfaces.\nStep 2: Combine all oil phase ingredients in a heat-resistant container.\nStep 3: Combine all water phase ingredients in a separate heat-resistant container.\nStep 4: Heat both phases to 158°F (70°C) and maintain temperature for 20 minutes to ensure proper sanitization.\nStep 5: Slowly pour the water phase into the oil phase while continuously stirring.\nStep 6: Blend with a stick blender for 2-3 minutes until emulsified.\nStep 7: Allow to cool to 104°F (40°C) before adding the cooling phase ingredients.\nStep 8: Add preservative and mix thoroughly.\nStep 9: Pour into sterilized containers and allow to cool completely before sealing.\nStep 10: Label with ingredients and production date.',
    created_at: '2025-05-11T14:00:00Z',
    metrics: {
      ph_level: 5.8,
      viscosity: 42,
      shelf_life: 120
    }
  },
  
  // Lavender Bath Bombs
  { 
    id: '6', 
    recipe_id: '3', 
    version_number: 1, 
    title: 'Lavender Bath Bombs - Basic',
    description: 'Simple lavender bath bombs with basic ingredients.',
    notes: 'Good fizzing action but crumbled a bit too easily. Needs better binding.', 
    instructions: 'Step 1: Mix dry ingredients.\nStep 2: Add wet ingredients slowly.\nStep 3: Press into molds.\nStep 4: Let dry for 24 hours.',
    created_at: '2025-05-05T17:00:00Z',
    metrics: {
      hardness: 35,
      fizz_intensity: 60,
      moisture: 5
    }
  },
  { 
    id: '7', 
    recipe_id: '3', 
    version_number: 2, 
    title: "Lavender Bath Bombs - Improved",
    description: "Improved lavender bath bombs with better binding and longer-lasting fizz.",
    notes: "Added coconut oil and shea butter for better binding. More stable structure and excellent fizzing.", 
    instructions: 'Step 1: Combine all dry ingredients in a large bowl, mixing thoroughly.\nStep 2: In a separate small container, mix the wet ingredients.\nStep 3: Very slowly add the wet mixture to the dry ingredients, a few drops at a time, while constantly stirring.\nStep 4: Test the mixture by squeezing it in your hand - it should hold together like wet sand.\nStep 5: Quickly press the mixture firmly into molds.\nStep 6: Let the bath bombs set in the molds for 24 hours.\nStep 7: Carefully remove from molds and allow to cure for an additional 24-48 hours.\nStep 8: Store in an airtight container in a cool, dry place.',
    created_at: '2025-05-12T14:00:00Z',
    metrics: {
      hardness: 62,
      fizz_intensity: 85,
      moisture: 3
    }
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