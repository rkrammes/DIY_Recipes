import { supabaseClient } from './supabaseClient.js';
import ErrorHandler from './error-handler.js';
import * as githubMcpAdapter from './adapters/github-mcp-adapter.js';

const ApiClient = {
  recipes: {
    async getAll() {
      try {
        const { data, error } = await supabaseClient.from('recipes').select('*');
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        ErrorHandler.handleApiError(error, 'Failed to fetch recipes.');
        return { data: null, error };
      }
    },

    async getById(id) {
      try {
        const { data, error } = await supabaseClient
          .from('recipes')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        ErrorHandler.handleApiError(error, `Failed to fetch recipe ${id}.`);
        return { data: null, error };
      }
    },

    async create(recipe) {
      try {
        const { data, error } = await supabaseClient
          .from('recipes')
          .insert([recipe])
          .select();
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        ErrorHandler.handleApiError(error, 'Failed to create recipe.');
        return { data: null, error };
      }
    },

    async update(id, updates) {
      try {
        const { data, error } = await supabaseClient
          .from('recipes')
          .update(updates)
          .eq('id', id)
          .select();
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        ErrorHandler.handleApiError(error, `Failed to update recipe ${id}.`);
        return { data: null, error };
      }
    },

    async delete(id) {
      try {
        const { error } = await supabaseClient
          .from('recipes')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return { data: true, error: null };
      } catch (error) {
        ErrorHandler.handleApiError(error, `Failed to delete recipe ${id}.`);
        return { data: null, error };
      }
    }
  },

  ingredients: {
    async getAll() {
      try {
        const { data, error } = await supabaseClient.from('ingredients').select('*');
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        ErrorHandler.handleApiError(error, 'Failed to fetch ingredients.');
        return { data: null, error };
      }
    },

    async create(ingredient) {
      try {
        const { data, error } = await supabaseClient
          .from('ingredients')
          .insert([ingredient])
          .select();
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        ErrorHandler.handleApiError(error, 'Failed to add ingredient.');
        return { data: null, error };
      }
    },

    async delete(id) {
      try {
        const { error } = await supabaseClient
          .from('ingredients')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return { data: true, error: null };
      } catch (error) {
        ErrorHandler.handleApiError(error, `Failed to delete ingredient ${id}.`);
        return { data: null, error };
      }
    }
  },
users: {
  // Placeholder for user-related API calls
},

recipeIngredients: {
  async update(recipeId, ingredients) {
    try {
      // Step 1: Delete existing ingredients
      const { error: deleteError } = await supabaseClient
        .from('recipeingredients')
        .delete()
        .eq('recipe_id', recipeId);
        
      if (deleteError) throw deleteError;
      
      // Step 2: If there are ingredients to add, insert them
      if (ingredients && ingredients.length > 0) {
        const ingredientsToInsert = ingredients
          .filter(ing => ing.id) // Validate each ingredient has required ID
          .map(ing => ({
            recipe_id: recipeId,
            ingredient_id: ing.id,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes
          }));
          
        if (ingredientsToInsert.length > 0) {
          const { data: insertData, error: insertError } = await supabaseClient
            .from('recipeingredients')
            .insert(ingredientsToInsert)
            .select();
            
          if (insertError) throw insertError;
        }
      }
      
      return { data: true, error: null };
    } catch (error) {
      ErrorHandler.handleApiError(error, `Failed to update ingredients for recipe ${recipeId}.`);
      return { data: null, error };
    }
  }
}
},
github: {
  async searchRepositories(query, options = {}) {
    try {
      return await githubMcpAdapter.searchRepositories(query, options);
    } catch (error) {
      ErrorHandler.handleApiError(error, 'Failed to search repositories.');
      return { data: null, error };
    }
  },
  async getFileContents(owner, repo, path, branch) {
    try {
      return await githubMcpAdapter.getFileContents(owner, repo, path, branch);
    } catch (error) {
      ErrorHandler.handleApiError(error, 'Failed to get file contents.');
      return { data: null, error };
    }
  },
  async getRepositoryInfo(owner, repo) {
    try {
      return await githubMcpAdapter.getRepositoryInfo(owner, repo);
    } catch (error) {
      ErrorHandler.handleApiError(error, 'Failed to get repository info.');
      return { data: null, error };
    }
  },
  async createIssue(owner, repo, title, body, options = {}) {
    try {
      return await githubMcpAdapter.createIssue(owner, repo, title, body, options);
    } catch (error) {
      ErrorHandler.handleApiError(error, 'Failed to create issue.');
      return { data: null, error };
    }
  },
  async listIssues(owner, repo, options = {}) {
    try {
      return await githubMcpAdapter.listIssues(owner, repo, options);
    } catch (error) {
      ErrorHandler.handleApiError(error, 'Failed to list issues.');
      return { data: null, error };
    }
  }
}
};

export default ApiClient;