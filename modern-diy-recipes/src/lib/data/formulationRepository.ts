import { supabase } from '@/lib/supabase';
import { Repository, RepositoryResponse, RepositoryOptions } from './repository';
import { 
  Formulation, 
  FormulationWithVersions, 
  FormulationIngredient, 
  FormulationVersion, 
  TransformedIngredient,
  FormulationWithIngredientsAndVersions
} from '@/types/models';

export interface FormulationIngredientData {
  formulationId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  notes?: string;
}

interface FormulationRepositoryOptions extends RepositoryOptions {
  includeIngredients?: boolean;
  includeVersions?: boolean;
}

/**
 * Repository for formulations (recipes)
 */
export class FormulationRepository extends Repository<Formulation> {
  private defaultOptions: FormulationRepositoryOptions;
  
  constructor(options: FormulationRepositoryOptions = {}) {
    // Use the underlying table name (recipes) rather than the terminology
    super('recipes', options);
    
    this.defaultOptions = {
      includeIngredients: options.includeIngredients ?? false,
      includeVersions: options.includeVersions ?? false,
      enableRealtime: options.enableRealtime ?? false,
      useFallbackData: options.useFallbackData ?? true
    };
  }
  
  /**
   * Get a formulation with its ingredients
   */
  async getWithIngredients(id: string): Promise<RepositoryResponse<FormulationWithIngredientsAndVersions>> {
    try {
      // Get the base formulation
      const { data: formulation, error } = await this.getById(id);
      
      if (error || !formulation) {
        return { data: null, error };
      }
      
      // Get the ingredients for this formulation
      const transformedIngredients = await this.getFormulationIngredients(id);
      
      // Get the versions for this formulation
      const versions = await this.getFormulationVersions(id);
      
      // Combine everything
      const result: FormulationWithIngredientsAndVersions = {
        ...formulation,
        ingredients: transformedIngredients,
        iterations: versions
      };
      
      return { data: result, error: null };
    } catch (err) {
      console.error(`Exception in FormulationRepository.getWithIngredients:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  }
  
  /**
   * Add an ingredient to a formulation
   */
  async addIngredient(data: FormulationIngredientData): Promise<RepositoryResponse<FormulationIngredient>> {
    try {
      const { data: createdData, error } = await supabase
        .from('recipe_ingredients')
        .insert({
          recipe_id: data.formulationId,
          ingredient_id: data.ingredientId,
          quantity: data.quantity,
          unit: data.unit,
          notes: data.notes,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding ingredient to formulation:', error.message);
        return { data: null, error };
      }
      
      return { data: createdData as FormulationIngredient, error: null };
    } catch (err) {
      console.error(`Exception in FormulationRepository.addIngredient:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  }
  
  /**
   * Update a formulation ingredient
   */
  async updateIngredient(
    recipeIngredientId: string, 
    data: Partial<FormulationIngredientData>
  ): Promise<RepositoryResponse<FormulationIngredient>> {
    try {
      // Transform data from formulation terminology to recipe terminology
      const updateData: Record<string, any> = {};
      
      if (data.quantity !== undefined) updateData.quantity = data.quantity;
      if (data.unit !== undefined) updateData.unit = data.unit;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.formulationId !== undefined) updateData.recipe_id = data.formulationId;
      if (data.ingredientId !== undefined) updateData.ingredient_id = data.ingredientId;
      
      // Add updated_at timestamp
      updateData.updated_at = new Date().toISOString();
      
      const { data: updatedData, error } = await supabase
        .from('recipe_ingredients')
        .update(updateData)
        .eq('id', recipeIngredientId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating formulation ingredient:', error.message);
        return { data: null, error };
      }
      
      return { data: updatedData as FormulationIngredient, error: null };
    } catch (err) {
      console.error(`Exception in FormulationRepository.updateIngredient:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  }
  
  /**
   * Remove an ingredient from a formulation
   */
  async removeIngredient(recipeIngredientId: string): Promise<RepositoryResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('id', recipeIngredientId);
      
      if (error) {
        console.error('Error removing ingredient from formulation:', error.message);
        return { data: false, error };
      }
      
      return { data: true, error: null };
    } catch (err) {
      console.error(`Exception in FormulationRepository.removeIngredient:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: false, error };
    }
  }
  
  /**
   * Create a new version of a formulation
   */
  async createVersion(
    formulationId: string, 
    data: Partial<FormulationVersion>
  ): Promise<RepositoryResponse<FormulationVersion>> {
    try {
      // Get the latest version number
      const { data: versions, error: versionsError } = await supabase
        .from('iterations')
        .select('version_number')
        .eq('recipe_id', formulationId)
        .order('version_number', { ascending: false })
        .limit(1);
      
      // Start with version 1 if no versions exist
      let nextVersionNumber = 1;
      
      if (!versionsError && versions && versions.length > 0) {
        nextVersionNumber = (versions[0].version_number || 0) + 1;
      }
      
      const { data: createdData, error } = await supabase
        .from('iterations')
        .insert({
          recipe_id: formulationId,
          version_number: nextVersionNumber,
          title: data.title || '',
          description: data.description || '',
          notes: data.notes || '',
          metrics: data.metrics || {},
          instructions: data.instructions || '',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating formulation version:', error.message);
        return { data: null, error };
      }
      
      return { data: createdData as FormulationVersion, error: null };
    } catch (err) {
      console.error(`Exception in FormulationRepository.createVersion:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  }
  
  /**
   * Update a formulation version
   */
  async updateVersion(
    versionId: string, 
    data: Partial<FormulationVersion>
  ): Promise<RepositoryResponse<FormulationVersion>> {
    try {
      const updateData: Record<string, any> = {};
      
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.metrics !== undefined) updateData.metrics = data.metrics;
      if (data.instructions !== undefined) updateData.instructions = data.instructions;
      
      // Add updated_at timestamp
      updateData.updated_at = new Date().toISOString();
      
      const { data: updatedData, error } = await supabase
        .from('iterations')
        .update(updateData)
        .eq('id', versionId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating formulation version:', error.message);
        return { data: null, error };
      }
      
      return { data: updatedData as FormulationVersion, error: null };
    } catch (err) {
      console.error(`Exception in FormulationRepository.updateVersion:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  }
  
  /**
   * Delete a formulation version
   */
  async deleteVersion(versionId: string): Promise<RepositoryResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('iterations')
        .delete()
        .eq('id', versionId);
      
      if (error) {
        console.error('Error deleting formulation version:', error.message);
        return { data: false, error };
      }
      
      return { data: true, error: null };
    } catch (err) {
      console.error(`Exception in FormulationRepository.deleteVersion:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: false, error };
    }
  }
  
  /**
   * Private method to get all ingredients for a formulation
   */
  private async getFormulationIngredients(
    formulationId: string
  ): Promise<TransformedIngredient[]> {
    try {
      // First try using a join query for efficiency
      try {
        const { data: joinResult, error: joinError } = await supabase
          .from('recipe_ingredients')
          .select(`
            id,
            quantity,
            unit,
            recipe_id,
            ingredient_id,
            notes,
            ingredients:ingredient_id (id, name, description)
          `)
          .eq('recipe_id', formulationId);
        
        if (!joinError && joinResult && joinResult.length > 0) {
          // Transform the join result for consistency
          return joinResult.map(item => ({
            id: item.ingredient_id || `unknown-${Date.now()}-${Math.random()}`,
            quantity: item.quantity || 0,
            unit: item.unit || '',
            notes: item.notes || null,
            name: item.ingredients?.name || 'Unknown Ingredient',
            description: item.ingredients?.description || null,
            recipe_ingredient_id: item.id
          }));
        }
      } catch (joinErr) {
        console.warn('Join query failed, falling back to separate queries:', joinErr);
      }
      
      // Fallback to separate queries approach
      // 1. Get recipe_ingredients
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .select(`
          id,
          quantity,
          unit,
          notes,
          ingredient_id
        `)
        .eq('recipe_id', formulationId);
      
      if (ingredientsError || !ingredients || ingredients.length === 0) {
        console.log('No ingredients found or error fetching ingredients');
        return [];
      }
      
      // 2. Get the ingredient details
      const ingredientIds = ingredients.map(i => i.ingredient_id).filter(Boolean);
      
      if (ingredientIds.length === 0) {
        console.warn('No valid ingredient IDs found');
        return [];
      }
      
      const { data: ingredientDetails, error: detailsError } = await supabase
        .from('ingredients')
        .select('id, name, description')
        .in('id', ingredientIds);
      
      if (detailsError) {
        console.error('Error fetching ingredient details:', detailsError.message);
        
        // Return with limited information
        return ingredients.map(item => ({
          id: item.ingredient_id || `unknown-${Date.now()}-${Math.random()}`,
          quantity: item.quantity || 0,
          unit: item.unit || '',
          notes: item.notes || null,
          name: 'Unknown Ingredient',
          description: null,
          recipe_ingredient_id: item.id
        }));
      }
      
      // 3. Combine the data
      return ingredients.map(item => {
        const ingredientDetail = ingredientDetails?.find(d => d.id === item.ingredient_id);
        
        return {
          id: item.ingredient_id || `unknown-${Date.now()}-${Math.random()}`,
          quantity: item.quantity || 0,
          unit: item.unit || '',
          notes: item.notes || null,
          name: ingredientDetail?.name || 'Unknown Ingredient',
          description: ingredientDetail?.description || null,
          recipe_ingredient_id: item.id
        };
      });
    } catch (err) {
      console.error('Error fetching formulation ingredients:', err);
      return [];
    }
  }
  
  /**
   * Private method to get all versions for a formulation
   */
  private async getFormulationVersions(
    formulationId: string
  ): Promise<FormulationVersion[]> {
    try {
      const { data, error } = await supabase
        .from('iterations')
        .select('*')
        .eq('recipe_id', formulationId)
        .order('version_number', { ascending: false });
      
      if (error) {
        console.error('Error fetching formulation versions:', error.message);
        return [];
      }
      
      return data as FormulationVersion[] || [];
    } catch (err) {
      console.error('Error fetching formulation versions:', err);
      return [];
    }
  }
  
  /**
   * Override delete to handle related data
   */
  async delete(id: string): Promise<RepositoryResponse<boolean>> {
    try {
      // First delete related data
      // 1. Delete recipe_ingredients
      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id);
      
      if (ingredientsError) {
        console.error('Error deleting formulation ingredients:', ingredientsError.message);
      }
      
      // 2. Delete iterations
      try {
        const { error: versionsError } = await supabase
          .from('iterations')
          .delete()
          .eq('recipe_id', id);
        
        if (versionsError && !versionsError.message.includes('does not exist')) {
          console.error('Error deleting formulation versions:', versionsError.message);
        }
      } catch (err) {
        // Ignore errors with iterations table - it might not exist
        console.log('Skipping iterations deletion - table might not exist');
      }
      
      // Now delete the formulation itself
      return super.delete(id);
    } catch (err) {
      console.error(`Exception in FormulationRepository.delete:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: false, error };
    }
  }
}