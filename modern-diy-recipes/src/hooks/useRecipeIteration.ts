import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Recipe, RecipeIteration, TransformedIngredient } from '@/types/models';

// Interface for iteration with ingredients
interface RecipeIterationWithIngredients extends RecipeIteration {
  ingredients?: TransformedIngredient[];
}

// Hook to manage recipe iterations
export function useRecipeIteration(initialRecipeId?: string) {
  const [iterations, setIterations] = useState<RecipeIterationWithIngredients[]>([]);
  const [currentIteration, setCurrentIteration] = useState<RecipeIterationWithIngredients | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch ingredients for a specific iteration
  const fetchIterationIngredients = useCallback(async (iterationId: string) => {
    try {
      console.log('Fetching ingredients for iteration:', iterationId);
      
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

      console.log(`Found ${data?.length || 0} ingredients for iteration ${iterationId}`);
      
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

  // Fetch all iterations for a specific recipe with their ingredients
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
        console.error('Error fetching recipe iterations:', error.message);
        // Don't set the error state to prevent the error UI from showing
        // Just log the error and use empty data
        setIterations([]);
        setCurrentIteration(null);
      } else {
        const fetchedIterations = data as RecipeIterationWithIngredients[] || [];
        
        // For each iteration, fetch its ingredients
        if (fetchedIterations.length > 0) {
          // Use Promise.all to fetch ingredients for all iterations in parallel
          const iterationsWithIngredients = await Promise.all(
            fetchedIterations.map(async (iteration) => {
              const ingredients = await fetchIterationIngredients(iteration.id);
              return { ...iteration, ingredients };
            })
          );
          
          setIterations(iterationsWithIngredients);
          setCurrentIteration(iterationsWithIngredients[0]);
        } else {
          setIterations([]);
          setCurrentIteration(null);
        }
        
        console.log(`Fetched ${fetchedIterations.length} iterations for recipe ${recipeId}`);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch recipe iterations'));
      console.error('Error fetching recipe iterations:', err);
      setIterations([]);
      setCurrentIteration(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchIterationIngredients]);

  // Create a new iteration based on an existing recipe or iteration
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
        console.error('Error creating new iteration:', error.message);
        // Don't set error state to avoid UI issues
        return null;
      }
      
      if (!data) {
        const err = new Error('Failed to create new iteration');
        setError(err);
        return null;
      }

      const createdIteration = data as RecipeIterationWithIngredients;

      // Copy ingredients from the recipe to the new iteration
      // First determine the source of ingredients (from recipe or a previous iteration)
      let sourceId: string;
      let sourceType: 'recipe' | 'iteration';
      
      if ('recipe_id' in baseRecipe) {
        // It's an iteration
        sourceId = baseRecipe.id;
        sourceType = 'iteration';
      } else {
        // It's a recipe
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
            iteration_id: createdIteration.id,
            ingredient_id: ri.ingredient_id,
            quantity: ri.quantity,
            unit: ri.unit,
            notes: ri.notes
          }));

          const { error: insertError } = await supabase
            .from('iteration_ingredients')
            .insert(iterationIngredientsData);

          if (insertError) {
            console.error('Error copying ingredients to iteration:', insertError);
          }
        }
      } else {
        // Copy ingredients from another iteration
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
          // Insert into iteration_ingredients for the new iteration
          const newIterationIngredientsData = iterationIngredients.map(ii => ({
            iteration_id: createdIteration.id,
            ingredient_id: ii.ingredient_id,
            quantity: ii.quantity,
            unit: ii.unit,
            notes: ii.notes
          }));

          const { error: insertError } = await supabase
            .from('iteration_ingredients')
            .insert(newIterationIngredientsData);

          if (insertError) {
            console.error('Error copying ingredients between iterations:', insertError);
          }
        }
      }

      // Fetch the ingredients for the new iteration
      const ingredients = await fetchIterationIngredients(createdIteration.id);
      createdIteration.ingredients = ingredients;

      setIterations(prev => [createdIteration, ...prev].sort((a, b) => b.version_number - a.version_number));
      setCurrentIteration(createdIteration);
      console.log('Created new iteration:', createdIteration);
      setError(null);
      return createdIteration;

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create new iteration'));
      console.error('Error creating new iteration:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, iterations, fetchIterationIngredients]);

  // Update details for a specific iteration (e.g., notes, metrics)
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
        console.error('Error updating iteration details:', error.message);
        // Don't set error state to avoid UI issues
        return null;
      }
      
      if (!data) {
        const err = new Error('Failed to update iteration details');
        setError(err);
        return null;
      }

      const updatedIteration = data as RecipeIterationWithIngredients;
      
      // Preserve the ingredients from the existing iteration object
      const existingIteration = iterations.find(iter => iter.id === iterationId);
      if (existingIteration && existingIteration.ingredients) {
        updatedIteration.ingredients = existingIteration.ingredients;
      } else {
        // Fetch the ingredients for this iteration if not already loaded
        updatedIteration.ingredients = await fetchIterationIngredients(iterationId);
      }

      setIterations(prev => prev.map(iter => iter.id === iterationId ? updatedIteration : iter)
                                  .sort((a, b) => b.version_number - a.version_number));
      
      if (currentIteration?.id === iterationId) {
        setCurrentIteration(updatedIteration);
      }
      
      console.log(`Updated iteration ${iterationId} details:`, details);
      setError(null);
      return updatedIteration;

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update iteration details'));
      console.error('Error updating iteration details:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, currentIteration, iterations, fetchIterationIngredients]);

  // Update ingredients for a specific iteration
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
      // First, remove existing ingredients for this iteration
      const { error: deleteError } = await supabase
        .from('iteration_ingredients')
        .delete()
        .eq('iteration_id', iterationId);
      
      if (deleteError) {
        console.error('Error deleting existing iteration ingredients:', deleteError);
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
          console.error('Error updating iteration ingredients:', insertError);
          setError(insertError);
          return null;
        }
      }

      // Fetch the updated ingredients for this iteration
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
      
      console.log(`Updated ingredients for iteration ${iterationId}`);
      setError(null);
      return updatedIngredients;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update iteration ingredients'));
      console.error('Error updating iteration ingredients:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, currentIteration, fetchIterationIngredients]);

  // Function to compare two iterations including ingredients
  const compareIterations = useCallback((iterationA: RecipeIterationWithIngredients, iterationB: RecipeIterationWithIngredients) => {
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

  // Placeholder for AI suggestions function (using RecipeIteration)
  const getAISuggestions = useCallback(async (iteration: RecipeIteration) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Getting AI suggestions for iteration ${iteration.id} (v${iteration.version_number})... (Placeholder)`);
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