import { supabaseClient } from './supabaseClient.js';
import ErrorHandler from './error-handler.js';

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
  }
};

export default ApiClient;