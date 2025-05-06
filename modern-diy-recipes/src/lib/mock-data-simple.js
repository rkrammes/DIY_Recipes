/**
 * Simple mock data for testing the document-centric formulation interface
 */

// Basic mock recipe data for DIY soap
export const mockSoapRecipe = {
  id: '1',
  title: 'DIY Moisturizing Soap Bar',
  description: 'A nourishing handmade soap with shea butter and essential oils that moisturizes while cleansing.',
  instructions: 'Step 1: Prepare your workspace and gather all ingredients.\nStep 2: Measure all oils and butters precisely using a digital scale.\nStep 3: Melt coconut oil, olive oil, castor oil, and shea butter in a double boiler.\nStep 4: In a well-ventilated area, slowly add lye to cold distilled water in a heat-resistant container.\nStep 5: Allow both the oils and lye water to cool to approximately 100-110°F.\nStep 6: Slowly pour the lye water into the oils while stirring gently.\nStep 7: Use a stick blender to blend until medium trace is achieved (pudding-like consistency).\nStep 8: Add lavender and chamomile essential oils along with vitamin E oil.\nStep 9: Mix briefly to incorporate, being careful not to over-blend.\nStep 10: Pour into prepared molds and tap gently to remove air bubbles.\nStep 11: Cover with parchment paper and insulate with towels.\nStep 12: Let set for 24-48 hours before unmolding.\nStep 13: Cut into bars and cure for 4-6 weeks in a cool, dry place with good air circulation.',
  notes: 'Handle lye with extreme caution. Always wear protective gear including goggles, gloves, and long sleeves. Work in a well-ventilated area.',
  created_at: '2023-05-01T10:00:00Z',
  user_id: 'user1'
};

// Mock ingredients for the soap recipe
export const mockSoapIngredients = [
  { id: '1', name: 'Coconut Oil', quantity: '16', unit: 'oz' },
  { id: '2', name: 'Olive Oil', quantity: '12', unit: 'oz' },
  { id: '3', name: 'Shea Butter', quantity: '4', unit: 'oz' },
  { id: '4', name: 'Distilled Water', quantity: '10', unit: 'oz' },
  { id: '5', name: 'Lye (Sodium Hydroxide)', quantity: '4.7', unit: 'oz' },
  { id: '6', name: 'Castor Oil', quantity: '2', unit: 'oz' },
  { id: '7', name: 'Lavender Essential Oil', quantity: '1.5', unit: 'oz' },
  { id: '8', name: 'Vitamin E Oil', quantity: '1', unit: 'tsp' }
];

// Mock recipe iterations (versions)
export const mockSoapIterations = [
  {
    id: 'iter-1',
    recipe_id: '1',
    version_number: 1,
    title: 'DIY Moisturizing Soap Bar - Basic',
    description: 'A basic moisturizing soap recipe with shea butter. Good for beginners.',
    notes: 'First attempt at soap making. Came out well but needs some adjustments for better lathering.',
    instructions: 'Step 1: Prepare all ingredients and measure them accurately.\nStep 2: Melt the coconut oil and shea butter in a double boiler.\nStep 3: Slowly add the lye to cold water in a separate container (never add water to lye).\nStep 4: Once both mixtures reach about 100°F, slowly pour the lye water into the oils.\nStep 5: Blend with a stick blender until trace is reached.\nStep 6: Add essential oils and mix briefly.\nStep 7: Pour into molds and insulate with towels.\nStep 8: Let set for 24-48 hours before unmolding.\nStep 9: Cure for 4-6 weeks before using.',
    created_at: '2023-05-02T15:00:00Z',
    ingredients: mockSoapIngredients.slice(0, 5).map(ing => ({ 
      ...ing, 
      quantity: (parseFloat(ing.quantity) * 0.8).toString()  // Less quantity in the basic version
    })),
    metrics: {
      ph_level: 9.5,
      hardness: 45,
      cure_time: 28
    }
  },
  {
    id: 'iter-2',
    recipe_id: '1',
    version_number: 2,
    title: 'DIY Moisturizing Soap Bar - Improved',
    description: 'An improved version with better lathering and added essential oils for fragrance.',
    notes: 'Increased the amount of coconut oil for better lathering. Added lavender essential oil for fragrance.',
    instructions: 'Step 1: Prepare all ingredients and measure them accurately.\nStep 2: Melt the coconut oil, olive oil, and shea butter in a double boiler.\nStep 3: Slowly add the lye to cold water in a separate container (never add water to lye).\nStep 4: Once both mixtures reach about 100°F, slowly pour the lye water into the oils.\nStep 5: Blend with a stick blender until medium trace is reached.\nStep 6: Add lavender essential oil and mix briefly.\nStep 7: Pour into molds and insulate with towels.\nStep 8: Let set for 24-48 hours before unmolding.\nStep 9: Cure for 4-6 weeks before using.',
    created_at: '2023-05-09T15:00:00Z',
    ingredients: mockSoapIngredients.slice(0, 7).map(ing => ({ ...ing })),  // More ingredients in the improved version
    metrics: {
      ph_level: 8.9,
      hardness: 50,
      cure_time: 28
    }
  },
  {
    id: 'iter-3',
    recipe_id: '1',
    version_number: 3,
    title: 'DIY Moisturizing Soap Bar - Advanced',
    description: 'The most advanced version with a perfect balance of ingredients for maximum moisturizing effect.',
    notes: 'Final iteration with balanced oils for optimal cleansing and moisturizing. Added vitamin E as a natural preservative.',
    instructions: 'Step 1: Prepare your workspace and gather all ingredients.\nStep 2: Measure all oils and butters precisely using a digital scale.\nStep 3: Melt coconut oil, olive oil, castor oil, and shea butter in a double boiler.\nStep 4: In a well-ventilated area, slowly add lye to cold distilled water in a heat-resistant container.\nStep 5: Allow both the oils and lye water to cool to approximately 100-110°F.\nStep 6: Slowly pour the lye water into the oils while stirring gently.\nStep 7: Use a stick blender to blend until medium trace is achieved (pudding-like consistency).\nStep 8: Add lavender and chamomile essential oils along with vitamin E oil.\nStep 9: Mix briefly to incorporate, being careful not to over-blend.\nStep 10: Pour into prepared molds and tap gently to remove air bubbles.\nStep 11: Cover with parchment paper and insulate with towels.\nStep 12: Let set for 24-48 hours before unmolding.\nStep 13: Cut into bars and cure for 4-6 weeks in a cool, dry place with good air circulation.',
    created_at: '2023-05-12T15:00:00Z',
    ingredients: mockSoapIngredients,  // All ingredients in the advanced version
    metrics: {
      ph_level: 8.2,
      hardness: 55,
      cure_time: 35
    }
  }
];

// Helper function to get current iteration or specific one
export function getMockIteration(id = null) {
  if (id) {
    return mockSoapIterations.find(iter => iter.id === id) || mockSoapIterations[2];
  }
  // Return the latest version by default
  return mockSoapIterations[2];
}

// Helper for creating a simple mock response like from an API
export function createMockResponse(data) {
  return { 
    data, 
    error: null,
    status: 200
  };
}