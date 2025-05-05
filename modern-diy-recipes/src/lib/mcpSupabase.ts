/**
 * Centralized MCP Supabase Client
 * 
 * This file provides a standardized way to interact with Supabase via the MCP adapter.
 * It combines proper error handling with the MCP approach for more robust database operations.
 */

import { logSupabaseError } from './supabaseErrors';
import { supabase } from './supabase';

// Export supabase client for direct access when needed
export { supabase };

// Connection state
let isConnectedToMcp = false;
let isMcpAvailable = true;

// Import the needed MCP adapter if available
let mcpAdapter: any;
try {
  // Check if in a browser environment
  if (typeof window !== 'undefined') {
    // Dynamic import for client-side use
    import('./mcp/adapters/simplifiedSupabaseMcpAdapter')
      .then((module) => {
        mcpAdapter = module.default;
        // Check MCP connectivity
        checkMcpConnection();
      })
      .catch((err) => {
        console.warn('MCP adapter not available, using direct Supabase:', err);
        isMcpAvailable = false;
      });
  } else {
    // Server-side - always use direct Supabase
    isMcpAvailable = false;
  }
} catch (error) {
  console.warn('Error importing MCP adapter, using direct Supabase:', error);
  isMcpAvailable = false;
}

/**
 * Checks if MCP connection is available
 */
async function checkMcpConnection(): Promise<boolean> {
  if (!isMcpAvailable || !mcpAdapter) return false;
  
  try {
    // Simple test to check MCP connectivity
    const result = await mcpAdapter.testConnection();
    isConnectedToMcp = result.success;
    return isConnectedToMcp;
  } catch (error) {
    console.warn('MCP connection test failed:', error);
    isConnectedToMcp = false;
    return false;
  }
}

/**
 * Executes a query through MCP if available, falls back to direct Supabase otherwise
 */
async function executeMcpQuery<T = any>(
  operation: () => Promise<{ data: T | null; error: any }>,
  mcpOperation?: () => Promise<T>,
  operationName: string = 'database_operation'
): Promise<{ data: T | null; error: any }> {
  // If MCP is available and we have an MCP operation, use it
  if (isMcpAvailable && isConnectedToMcp && mcpAdapter && mcpOperation) {
    try {
      const data = await mcpOperation();
      return { data, error: null };
    } catch (error) {
      logSupabaseError(error, `MCP ${operationName}`);
      
      // Fall back to direct Supabase if MCP fails
      console.warn(`MCP operation "${operationName}" failed, falling back to direct Supabase`);
      return operation();
    }
  }
  
  // If MCP is not available, use direct Supabase
  return operation();
}

/**
 * Enhanced database operations with MCP integration
 */
export const mcpSupabase = {
  /**
   * Get recipes with MCP fallback
   */
  async getRecipes() {
    return executeMcpQuery(
      // Direct Supabase operation
      () => supabase.from('recipes').select('*').order('created_at', { ascending: false }),
      // Equivalent MCP operation
      mcpAdapter?.isAvailable ? 
        () => mcpAdapter.executeQuery('SELECT * FROM recipes ORDER BY created_at DESC') : 
        undefined,
      'get_recipes'
    );
  },
  
  /**
   * Get a single recipe by ID with MCP fallback
   */
  async getRecipeById(id: string) {
    return executeMcpQuery(
      // Direct Supabase operation
      () => supabase.from('recipes').select('*').eq('id', id).single(),
      // Equivalent MCP operation
      mcpAdapter?.isAvailable ? 
        () => mcpAdapter.executeQuery(`SELECT * FROM recipes WHERE id = '${id}' LIMIT 1`) : 
        undefined,
      'get_recipe_by_id'
    );
  },
  
  /**
   * Get ingredients with MCP fallback
   */
  async getIngredients() {
    return executeMcpQuery(
      // Direct Supabase operation
      () => supabase.from('ingredients').select('*').order('created_at', { ascending: false }),
      // Equivalent MCP operation
      mcpAdapter?.isAvailable ? 
        () => mcpAdapter.executeQuery('SELECT * FROM ingredients ORDER BY created_at DESC') : 
        undefined,
      'get_ingredients'
    );
  },
  
  /**
   * Get recipe ingredients with MCP fallback
   */
  async getRecipeIngredients(recipeId: string) {
    return executeMcpQuery(
      // Direct Supabase operation
      () => supabase
        .from('recipeingredients')
        .select(`
          ingredient_id,
          quantity,
          unit,
          notes,
          ingredients (id, name, description)
        `)
        .eq('recipe_id', recipeId),
      // Equivalent MCP operation
      mcpAdapter?.isAvailable ? 
        () => mcpAdapter.executeQuery(`
          SELECT ri.ingredient_id, ri.quantity, ri.unit, ri.notes, 
                 i.id, i.name, i.description
          FROM recipeingredients ri
          JOIN ingredients i ON ri.ingredient_id = i.id
          WHERE ri.recipe_id = '${recipeId}'
        `) : 
        undefined,
      'get_recipe_ingredients'
    );
  },
  
  /**
   * Create a recipe with MCP fallback
   */
  async createRecipe(recipe: any) {
    return executeMcpQuery(
      // Direct Supabase operation
      () => supabase.from('recipes').insert([recipe]).select().single(),
      // Equivalent MCP operation
      mcpAdapter?.isAvailable ? 
        () => mcpAdapter.createRecord('recipes', recipe) : 
        undefined,
      'create_recipe'
    );
  },
  
  /**
   * Update a recipe with MCP fallback
   */
  async updateRecipe(id: string, updates: any) {
    return executeMcpQuery(
      // Direct Supabase operation
      () => supabase.from('recipes').update(updates).eq('id', id).select().single(),
      // Equivalent MCP operation
      mcpAdapter?.isAvailable ? 
        () => mcpAdapter.updateRecord('recipes', id, updates) : 
        undefined,
      'update_recipe'
    );
  },
  
  /**
   * Delete a recipe with MCP fallback
   */
  async deleteRecipe(id: string) {
    return executeMcpQuery(
      // Direct Supabase operation
      () => supabase.from('recipes').delete().eq('id', id),
      // Equivalent MCP operation
      mcpAdapter?.isAvailable ? 
        () => mcpAdapter.deleteRecord('recipes', id) : 
        undefined,
      'delete_recipe'
    );
  },
  
  /**
   * Create an ingredient with MCP fallback
   */
  async createIngredient(ingredient: any) {
    return executeMcpQuery(
      // Direct Supabase operation
      () => supabase.from('ingredients').insert([ingredient]).select().single(),
      // Equivalent MCP operation
      mcpAdapter?.isAvailable ? 
        () => mcpAdapter.createRecord('ingredients', ingredient) : 
        undefined,
      'create_ingredient'
    );
  },
  
  /**
   * Utility function to get connection status
   */
  async getConnectionStatus() {
    const mcpStatus = await checkMcpConnection();
    
    let directStatus = false;
    try {
      // Simple ping to check direct Supabase connection
      const { data, error } = await supabase.from('recipes').select('count', { count: 'exact', head: true });
      directStatus = !error;
    } catch (error) {
      directStatus = false;
    }
    
    return {
      isMcpAvailable,
      isConnectedToMcp: mcpStatus,
      directSupabaseConnected: directStatus,
      usingMcp: isMcpAvailable && mcpStatus,
    };
  }
};