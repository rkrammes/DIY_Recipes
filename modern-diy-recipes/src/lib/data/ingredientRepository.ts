import { Repository, RepositoryOptions } from './repository';
import { Ingredient } from '@/types/models';

/**
 * Repository for ingredients
 */
export class IngredientRepository extends Repository<Ingredient> {
  constructor(options: RepositoryOptions = {}) {
    super('ingredients', options);
  }
  
  /**
   * Search ingredients by name
   */
  async searchByName(query: string) {
    return this.getAll({
      filters: { 'name:ilike': query }
    });
  }
  
  /**
   * Get ingredients used in a particular formulation
   */
  async getByFormulationId(formulationId: string) {
    try {
      // Using join query to get ingredients from a formulation
      const { data, error } = await this.supabase
        .from('recipe_ingredients')
        .select(`
          ingredient_id,
          ingredients:ingredient_id (*)
        `)
        .eq('recipe_id', formulationId);
      
      if (error) throw error;
      
      // Extract the ingredient data from the joined results
      const ingredients = data
        .map(item => item.ingredients)
        .filter(Boolean);
      
      return { data: ingredients, error: null };
    } catch (error) {
      console.error('Error fetching ingredients by formulation:', error);
      return { data: [], error };
    }
  }
  
  /**
   * Get recently used ingredients
   */
  async getRecent(limit = 10) {
    try {
      // Get most recently used ingredients from recipe_ingredients table
      const { data: recentIngredientIds, error } = await this.supabase
        .from('recipe_ingredients')
        .select('ingredient_id')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      // If no recent ingredients, return empty array
      if (!recentIngredientIds || recentIngredientIds.length === 0) {
        return { data: [], error: null };
      }
      
      // Extract unique ingredient IDs
      const uniqueIds = [...new Set(recentIngredientIds.map(item => item.ingredient_id))];
      
      // Get the ingredient details
      const { data: ingredients, error: ingredientsError } = await this.supabase
        .from('ingredients')
        .select('*')
        .in('id', uniqueIds);
      
      if (ingredientsError) throw ingredientsError;
      
      return { data: ingredients || [], error: null };
    } catch (error) {
      console.error('Error fetching recent ingredients:', error);
      return { data: [], error };
    }
  }
  
  /**
   * Access to supabase for custom queries
   */
  get supabase() {
    return require('@/lib/supabase').supabase;
  }
}