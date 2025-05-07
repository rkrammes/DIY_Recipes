/**
 * Direct API access for formulation data
 * 
 * This module provides direct API fetch functions as a last resort fallback
 * when Supabase connections fail. It uses the standard Fetch API to get data.
 */

import { Recipe, Ingredient, RecipeIteration, RecipeIngredient } from '@/types/models';
import { ENDPOINTS, REQUEST_TIMEOUT, FALLBACK_RECIPES } from './supabaseConfig';

// Utility for handling fetch timeouts
const fetchWithTimeout = async (url: string, options = {}, timeout = REQUEST_TIMEOUT) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Custom API base URL - using our local recipe API server
const API_BASE_URL = 'http://localhost:3005';

// Fetch all formulations with basic information
export const fetchFormulations = async (): Promise<Recipe[]> => {
  try {
    // First try our custom API server on port 3005
    try {
      const customApiUrl = `${API_BASE_URL}/api/recipes`;
      console.log(`Attempting to fetch formulations from custom API server: ${customApiUrl}`);
      const response = await fetchWithTimeout(customApiUrl, {}, 2000); // Short timeout
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Successfully fetched ${data.length} formulations from custom API server`);
        return data;
      } else {
        console.warn(`Custom API server returned ${response.status}, falling back to standard endpoint`);
      }
    } catch (customApiError) {
      console.warn(`Error connecting to custom API server:`, customApiError);
    }
    
    // Fall back to the standard endpoint
    const response = await fetchWithTimeout(ENDPOINTS.recipes.list);
    if (!response.ok) {
      console.warn(`HTTP error fetching formulations list: ${response.status}, using fallback formulations`);
      return FALLBACK_RECIPES; // Return fallback formulations instead of empty array
    }
    const data = await response.json();
    return data && data.length > 0 ? data : FALLBACK_RECIPES;
  } catch (error) {
    console.error('Error fetching formulations via direct API:', error);
    // Return fallback formulations
    console.log('Returning fallback formulation list');
    return FALLBACK_RECIPES;
  }
};

// Fetch a single formulation with detailed information
export const fetchFormulationById = async (id: string): Promise<Recipe | null> => {
  try {
    // First, check if we have a matching fallback formulation
    const fallbackFormulation = FALLBACK_RECIPES.find(recipe => recipe.id === id);
    
    // If we found a matching fallback formulation, use it
    if (fallbackFormulation) {
      console.log(`Found matching fallback formulation for ID ${id}, using it`);
      return fallbackFormulation;
    }
    
    // Try our custom API server first
    try {
      const customApiUrl = `${API_BASE_URL}/api/recipes/${id}`;
      console.log(`Attempting to fetch formulation from custom API server: ${customApiUrl}`);
      
      const response = await fetchWithTimeout(customApiUrl, {}, 2000); // Short timeout
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log(`Successfully fetched formulation from custom API server:`, {
            id: data.id,
            title: data.title
          });
          return data;
        } catch (parseError) {
          console.warn(`Error parsing formulation JSON from custom API:`, parseError);
        }
      } else {
        console.warn(`Custom API server returned ${response.status}, falling back to standard endpoint`);
      }
    } catch (customApiError) {
      console.warn(`Error connecting to custom API server:`, customApiError);
    }
    
    // Fall back to standard API endpoint
    const response = await fetchWithTimeout(ENDPOINTS.recipes.detail(id));
    
    // If the API endpoint returned a 404, create a basic formulation fallback
    if (response.status === 404) {
      console.log(`Formulation API endpoint returned 404 for formulation ${id}, creating fallback`);
      
      // Return the first fallback formulation but with the ID modified
      // This ensures we get some data to show
      return {
        ...FALLBACK_RECIPES[0],
        id: id,
        title: "Sample Formulation",
        description: "Sample formulation data (API endpoint not available).",
        user_id: "system"
      };
    }
    
    // Handle other non-successful responses
    if (!response.ok) {
      console.warn(`HTTP error fetching formulation: ${response.status}`);
      // For other errors, return a fallback formulation with error info
      return {
        ...FALLBACK_RECIPES[0],
        id: id,
        title: "Formulation (Unable to Load)",
        description: `Error loading formulation: ${response.statusText}`,
        user_id: "system"
      };
    }
    
    // If the response was successful, parse the data
    try {
      const data = await response.json();
      return data || null;
    } catch (parseError) {
      console.error(`Error parsing formulation JSON response for ${id}:`, parseError);
      return {
        ...FALLBACK_RECIPES[0],
        id: id,
        title: "Formulation (Parse Error)",
        description: "Could not parse formulation data from server.",
        user_id: "system"
      };
    }
  } catch (error) {
    console.error(`Error fetching formulation ${id} via direct API:`, error);
    // Network/connection error fallback - use a fallback formulation
    return {
      ...FALLBACK_RECIPES[0],
      id: id,
      title: "Formulation (Connection Error)",
      description: "Could not connect to formulation server.",
      user_id: "system"
    };
  }
};

// Fetch ingredients for a specific formulation
export const fetchFormulationIngredients = async (formulationId: string): Promise<RecipeIngredient[]> => {
  try {
    // First, check if we have a matching fallback formulation with ingredients
    const fallbackFormulation = FALLBACK_RECIPES.find(recipe => recipe.id === formulationId);
    
    // If we found a matching fallback formulation with ingredients, use those
    if (fallbackFormulation && fallbackFormulation.ingredients && fallbackFormulation.ingredients.length > 0) {
      console.log(`Found matching fallback formulation ingredients for ID ${formulationId}, using them`);
      return fallbackFormulation.ingredients.map(ing => ({
        id: ing.id || `i-${Math.random().toString(36).substring(2, 9)}`,
        recipe_id: formulationId,
        ingredient_id: ing.id || `i-${Math.random().toString(36).substring(2, 9)}`,
        quantity: ing.quantity || 0,
        unit: ing.unit || '',
        created_at: new Date().toISOString()
      }));
    }
    
    // Otherwise, try to fetch from the API
    const response = await fetchWithTimeout(ENDPOINTS.recipes.ingredients(formulationId));
    
    // For any non-successful response, use the first fallback formulation's ingredients
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Ingredients API endpoint not available for formulation ${formulationId}`);
      } else {
        console.warn(`HTTP error fetching ingredients: ${response.status}`);
      }
      
      // Use ingredients from the first fallback formulation
      if (FALLBACK_RECIPES[0].ingredients && FALLBACK_RECIPES[0].ingredients.length > 0) {
        return FALLBACK_RECIPES[0].ingredients.map(ing => ({
          id: ing.id || `i-${Math.random().toString(36).substring(2, 9)}`,
          recipe_id: formulationId,
          ingredient_id: ing.id || `i-${Math.random().toString(36).substring(2, 9)}`,
          quantity: ing.quantity || 0,
          unit: ing.unit || '',
          created_at: new Date().toISOString()
        }));
      }
      
      return [];
    }
    
    // If the response was successful, parse the data
    try {
      const data = await response.json();
      if (data && data.length > 0) {
        return data;
      } else {
        // If we got an empty response, use fallback ingredients
        if (FALLBACK_RECIPES[0].ingredients && FALLBACK_RECIPES[0].ingredients.length > 0) {
          return FALLBACK_RECIPES[0].ingredients.map(ing => ({
            id: ing.id || `i-${Math.random().toString(36).substring(2, 9)}`,
            recipe_id: formulationId,
            ingredient_id: ing.id || `i-${Math.random().toString(36).substring(2, 9)}`,
            quantity: ing.quantity || 0,
            unit: ing.unit || '',
            created_at: new Date().toISOString()
          }));
        }
        return [];
      }
    } catch (parseError) {
      console.warn(`Error parsing ingredients JSON response:`, parseError);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching ingredients for formulation ${formulationId} via direct API:`, error);
    return [];
  }
};

// Fetch versions for a specific formulation
export const fetchFormulationVersions = async (formulationId: string): Promise<RecipeIteration[]> => {
  try {
    const response = await fetchWithTimeout(ENDPOINTS.recipes.iterations(formulationId));
    // If the endpoint doesn't exist (404) or another error, just return empty array
    // This is normal if the versions feature is not available
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Versions API endpoint not available for formulation ${formulationId}`);
      } else {
        console.warn(`HTTP error fetching versions: ${response.status}`);
      }
      return [];
    }
    
    try {
      const data = await response.json();
      return data || [];
    } catch (parseError) {
      console.warn(`Error parsing versions JSON response:`, parseError);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching versions for formulation ${formulationId} via direct API:`, error);
    return [];
  }
};

// Fetch all ingredients
export const fetchIngredients = async (): Promise<Ingredient[]> => {
  try {
    const response = await fetchWithTimeout(ENDPOINTS.ingredients.list);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching ingredients via direct API:', error);
    return [];
  }
};

// Maintain backward compatibility with original function names
export const fetchRecipes = fetchFormulations;
export const fetchRecipeById = fetchFormulationById;
export const fetchRecipeIngredients = fetchFormulationIngredients;
export const fetchRecipeIterations = fetchFormulationVersions;