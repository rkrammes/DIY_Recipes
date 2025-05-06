import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Recipe, RecipeIteration, TransformedIngredient,
  Formulation, FormulationVersion
} from '@/types/models';

// Interface for formulation version with ingredients
interface FormulationVersionWithIngredients extends RecipeIteration {
  ingredients?: TransformedIngredient[];
}

// Hook to manage formulation versions (previously recipe iterations)
export function useRecipeIteration(initialRecipeId?: string) {
  const [iterations, setIterations] = useState<FormulationVersionWithIngredients[]>([]);
  const [currentIteration, setCurrentIteration] = useState<FormulationVersionWithIngredients | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch ingredients for a specific formulation version
  const fetchIterationIngredients = useCallback(async (iterationId: string) => {
    try {
      console.log('Fetching ingredients for formulation version:', iterationId);
      
      const { data, error } = await supabase
        .from('iteration_ingredients')
        .select(`
          id,
          quantity,
          unit,
          notes,
          ingredients(id, name, description)
        `)
        .eq('iteration_id', iterationId);

      if (error) {
        console.warn('Error fetching iteration ingredients:', error.message);
        // Don't throw, just return empty array
        return [];
      }

      console.log(`Found ${data?.length || 0} ingredients for formulation version ${iterationId}`);
      
      try {
        // Transform data into TransformedIngredient format
        return (data || []).map(item => {
          // In case the join query doesn't work properly
          if (!item.ingredients) {
            console.warn('Missing ingredients data for item:', item);
            // Try to get the ingredient data directly
            return {
              id: item.ingredient_id || 'unknown',
              quantity: item.quantity || '0',
              unit: item.unit || '',
              notes: item.notes || null,
              name: 'Unknown ingredient',
              description: null,
              recipe_ingredient_id: item.id
            } as TransformedIngredient;
          }
          
          return {
            id: item.ingredients.id,
            quantity: item.quantity,
            unit: item.unit,
            notes: item.notes,
            name: item.ingredients.name,
            description: item.ingredients.description,
            recipe_ingredient_id: item.id
          } as TransformedIngredient;
        });
      } catch (transformErr) {
        console.error('Error transforming ingredient data:', transformErr);
        console.error('Problematic data:', data);
        return [];
      }
    } catch (err) {
      console.error('Error fetching iteration ingredients:', err);
      return [];
    }
  }, [supabase]);

  // Fetch all versions for a specific formulation with their ingredients
  const fetchIterations = useCallback(async (recipeId: string) => {
    if (!recipeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('recipe_iterations')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('version_number', { ascending: false });

      if (error) {
        // Handle errors more gracefully
        console.error('Error fetching formulation versions:', error.message);
        // Don't set the error state to prevent the error UI from showing
        // Just log the error and use empty data
        setIterations([]);
        setCurrentIteration(null);
      } else {
        const fetchedVersions = data as FormulationVersionWithIngredients[] || [];
        
        // For each version, fetch its ingredients
        if (fetchedVersions.length > 0) {
          // Use Promise.all to fetch ingredients for all versions in parallel
          const versionsWithIngredients = await Promise.all(
            fetchedVersions.map(async (version) => {
              const ingredients = await fetchIterationIngredients(version.id);
              return { ...version, ingredients };
            })
          );
          
          setIterations(versionsWithIngredients);
          setCurrentIteration(versionsWithIngredients[0]);
        } else {
          setIterations([]);
          setCurrentIteration(null);
        }
        
        console.log(`Fetched ${fetchedVersions.length} versions for formulation ${recipeId}`);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch formulation versions'));
      console.error('Error fetching recipe iterations:', err);
      setIterations([]);
      setCurrentIteration(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchIterationIngredients]);

  // Create a new version based on an existing formulation or version
  const createNewIteration = useCallback(async (baseRecipe: Recipe | RecipeIteration, changes: Partial<RecipeIteration> = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const timestamp = new Date().toISOString();
      const latestVersionNumber = iterations.length > 0 ? iterations[0].version_number : 0;
      const recipeId = 'recipe_id' in baseRecipe ? baseRecipe.recipe_id : baseRecipe.id;

      const newIterationData: Omit<RecipeIteration, 'id'> = {
        recipe_id: recipeId,
        version_number: latestVersionNumber + 1,
        title: baseRecipe.title,
        description: baseRecipe.description,
        created_at: timestamp,
        notes: '',
        metrics: 'metrics' in baseRecipe ? baseRecipe.metrics : undefined,
        ...changes,
      };

      const { data, error } = await supabase
        .from('recipe_iterations')
        .insert([newIterationData])
        .select()
        .single();

      if (error) {
        console.error('Error creating new formulation version:', error.message);
        // Don't set error state to avoid UI issues
        return null;
      }
      
      if (!data) {
        const err = new Error('Failed to create new formulation version');
        setError(err);
        return null;
      }

      const createdVersion = data as FormulationVersionWithIngredients;

      // Copy ingredients from the formulation to the new version
      // First determine the source of ingredients (from formulation or a previous version)
      let sourceId: string;
      let sourceType: 'recipe' | 'iteration';
      
      if ('recipe_id' in baseRecipe) {
        // It's a version
        sourceId = baseRecipe.id;
        sourceType = 'iteration';
      } else {
        // It's a formulation
        sourceId = baseRecipe.id;
        sourceType = 'recipe';
      }

      if (sourceType === 'recipe') {
        // Copy ingredients from recipe_ingredients
        const { data: recipeIngredients, error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .select(`
            id,
            ingredient_id,
            quantity,
            unit,
            notes
          `)
          .eq('recipe_id', sourceId);

        if (!ingredientsError && recipeIngredients && recipeIngredients.length > 0) {
          // Insert into iteration_ingredients
          const iterationIngredientsData = recipeIngredients.map(ri => ({
            iteration_id: createdVersion.id,
            ingredient_id: ri.ingredient_id,
            quantity: ri.quantity,
            unit: ri.unit,
            notes: ri.notes
          }));

          const { error: insertError } = await supabase
            .from('iteration_ingredients')
            .insert(iterationIngredientsData);

          if (insertError) {
            console.error('Error copying ingredients to formulation version:', insertError);
          }
        }
      } else {
        // Copy ingredients from another version
        const { data: iterationIngredients, error: ingredientsError } = await supabase
          .from('iteration_ingredients')
          .select(`
            id,
            ingredient_id,
            quantity,
            unit,
            notes
          `)
          .eq('iteration_id', sourceId);

        if (!ingredientsError && iterationIngredients && iterationIngredients.length > 0) {
          // Insert into iteration_ingredients for the new version
          const newIterationIngredientsData = iterationIngredients.map(ii => ({
            iteration_id: createdVersion.id,
            ingredient_id: ii.ingredient_id,
            quantity: ii.quantity,
            unit: ii.unit,
            notes: ii.notes
          }));

          const { error: insertError } = await supabase
            .from('iteration_ingredients')
            .insert(newIterationIngredientsData);

          if (insertError) {
            console.error('Error copying ingredients between formulation versions:', insertError);
          }
        }
      }

      // Fetch the ingredients for the new version
      const ingredients = await fetchIterationIngredients(createdVersion.id);
      createdVersion.ingredients = ingredients;

      setIterations(prev => [createdVersion, ...prev].sort((a, b) => b.version_number - a.version_number));
      setCurrentIteration(createdVersion);
      console.log('Created new formulation version:', createdVersion);
      setError(null);
      return createdVersion;

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create new formulation version'));
      console.error('Error creating new iteration:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, iterations, fetchIterationIngredients]);

  // Update details for a specific formulation version (e.g., notes, metrics)
  const updateIterationDetails = useCallback(async (iterationId: string, details: Partial<Pick<RecipeIteration, 'title' | 'description' | 'notes' | 'metrics' | 'instructions'>>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('recipe_iterations')
        .update(details)
        .eq('id', iterationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating formulation version details:', error.message);
        // Don't set error state to avoid UI issues
        return null;
      }
      
      if (!data) {
        const err = new Error('Failed to update formulation version details');
        setError(err);
        return null;
      }

      const updatedVersion = data as FormulationVersionWithIngredients;
      
      // Preserve the ingredients from the existing version object
      const existingVersion = iterations.find(iter => iter.id === iterationId);
      if (existingVersion && existingVersion.ingredients) {
        updatedVersion.ingredients = existingVersion.ingredients;
      } else {
        // Fetch the ingredients for this version if not already loaded
        updatedVersion.ingredients = await fetchIterationIngredients(iterationId);
      }

      setIterations(prev => prev.map(iter => iter.id === iterationId ? updatedVersion : iter)
                                  .sort((a, b) => b.version_number - a.version_number));
      
      if (currentIteration?.id === iterationId) {
        setCurrentIteration(updatedVersion);
      }
      
      console.log(`Updated formulation version ${iterationId} details:`, details);
      setError(null);
      return updatedVersion;

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update formulation version details'));
      console.error('Error updating iteration details:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, currentIteration, iterations, fetchIterationIngredients]);

  // Update ingredients for a specific formulation version
  const updateIterationIngredients = useCallback(async (
    iterationId: string, 
    ingredients: Array<{
      id: string;
      ingredient_id: string;
      quantity: string | number;
      unit: string;
      notes?: string;
    }>
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      // First, remove existing ingredients for this version
      const { error: deleteError } = await supabase
        .from('iteration_ingredients')
        .delete()
        .eq('iteration_id', iterationId);
      
      if (deleteError) {
        console.error('Error deleting existing formulation version ingredients:', deleteError);
        setError(deleteError);
        return null;
      }

      // Then insert the new ingredients
      if (ingredients.length > 0) {
        const iterationIngredientsData = ingredients.map(ing => ({
          iteration_id: iterationId,
          ingredient_id: ing.ingredient_id,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes
        }));

        const { error: insertError } = await supabase
          .from('iteration_ingredients')
          .insert(iterationIngredientsData);

        if (insertError) {
          console.error('Error updating formulation version ingredients:', insertError);
          setError(insertError);
          return null;
        }
      }

      // Fetch the updated ingredients for this version
      const updatedIngredients = await fetchIterationIngredients(iterationId);
      
      // Update the iterations state with the new ingredients
      setIterations(prev => 
        prev.map(iter => 
          iter.id === iterationId 
            ? { ...iter, ingredients: updatedIngredients } 
            : iter
        )
      );
      
      // Update current iteration if necessary
      if (currentIteration?.id === iterationId) {
        setCurrentIteration(prev => prev ? { ...prev, ingredients: updatedIngredients } : null);
      }
      
      console.log(`Updated ingredients for formulation version ${iterationId}`);
      setError(null);
      return updatedIngredients;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update formulation version ingredients'));
      console.error('Error updating iteration ingredients:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, currentIteration, fetchIterationIngredients]);

  // Function to compare two formulation versions including ingredients
  const compareIterations = useCallback((iterationA: FormulationVersionWithIngredients, iterationB: FormulationVersionWithIngredients) => {
    if (!iterationA || !iterationB) return null;

    // Compare basic fields
    const basicComparison = {
      titleChanged: iterationA.title !== iterationB.title,
      descriptionChanged: iterationA.description !== iterationB.description,
      notesChanged: iterationA.notes !== iterationB.notes,
      metricsChanged: JSON.stringify(iterationA.metrics) !== JSON.stringify(iterationB.metrics),
      instructionsChanged: iterationA.instructions !== iterationB.instructions,
    };

    // Compare ingredients if available
    const ingredientsComparison: Record<string, any> = {};
    
    if (iterationA.ingredients && iterationB.ingredients) {
      // Map ingredients by ID for easier comparison
      const ingredientsA = new Map(iterationA.ingredients.map(ing => [ing.id, ing]));
      const ingredientsB = new Map(iterationB.ingredients.map(ing => [ing.id, ing]));
      
      // Find added ingredients (in B but not in A)
      const addedIngredients = iterationB.ingredients.filter(ing => !ingredientsA.has(ing.id));
      
      // Find removed ingredients (in A but not in B)
      const removedIngredients = iterationA.ingredients.filter(ing => !ingredientsB.has(ing.id));
      
      // Find modified ingredients (in both but with different values)
      const modifiedIngredients: Array<{
        id: string;
        name: string;
        changes: Record<string, { from: any; to: any }>;
      }> = [];
      
      // Check each ingredient in A to see if it was modified in B
      iterationA.ingredients.forEach(ingA => {
        const ingB = ingredientsB.get(ingA.id);
        if (ingB) {
          const changes: Record<string, { from: any; to: any }> = {};
          let hasChanges = false;
          
          // Compare quantity
          if (ingA.quantity !== ingB.quantity) {
            changes.quantity = { from: ingA.quantity, to: ingB.quantity };
            hasChanges = true;
          }
          
          // Compare unit
          if (ingA.unit !== ingB.unit) {
            changes.unit = { from: ingA.unit, to: ingB.unit };
            hasChanges = true;
          }
          
          // Compare notes
          if (ingA.notes !== ingB.notes) {
            changes.notes = { from: ingA.notes, to: ingB.notes };
            hasChanges = true;
          }
          
          if (hasChanges) {
            modifiedIngredients.push({
              id: ingA.id,
              name: ingA.name || 'Unknown ingredient',
              changes
            });
          }
        }
      });
      
      // Add ingredient comparisons to the result
      ingredientsComparison.addedIngredients = addedIngredients;
      ingredientsComparison.removedIngredients = removedIngredients;
      ingredientsComparison.modifiedIngredients = modifiedIngredients;
      ingredientsComparison.hasIngredientChanges = addedIngredients.length > 0 || 
                                                  removedIngredients.length > 0 || 
                                                  modifiedIngredients.length > 0;
    }

    return {
      ...basicComparison,
      ...ingredientsComparison,
      hasChanges: Object.values(basicComparison).some(value => value === true) || 
                 (ingredientsComparison.hasIngredientChanges || false),
    };
  }, []);

  // Placeholder for AI suggestions function (using FormulationVersion)
  const getAISuggestions = useCallback(async (iteration: RecipeIteration) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Getting AI suggestions for formulation version ${iteration.id} (v${iteration.version_number})... (Placeholder)`);
      // TODO: Implement API call to an AI service
      // Send relevant iteration data (title, description, notes, metrics)
      // Might need to fetch associated ingredients/instructions for better suggestions
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      return { suggestions: ["Consider adding a pinch of salt.", "Try roasting vegetables instead of boiling."] }; // Placeholder
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get AI suggestions'));
      console.error('Error getting AI suggestions:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);


  // Initialize hook by fetching iterations if an initial recipe ID is provided
  useEffect(() => {
    if (initialRecipeId) {
      fetchIterations(initialRecipeId);
    }
    // Clear state if initialRecipeId becomes null/undefined
    if (!initialRecipeId) {
        setIterations([]);
        setCurrentIteration(null);
    }
  }, [initialRecipeId, fetchIterations]);

  return {
    iterations,
    currentIteration,
    isLoading,
    error,
    fetchIterations,
    createNewIteration,
    updateIterationDetails,
    updateIterationIngredients,
    compareIterations,
    getAISuggestions,
    setCurrentIteration,
    fetchIterationIngredients
  };
}