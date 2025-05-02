import { useState, useCallback, useEffect } from 'react'; // Added useEffect
import { supabase } from '@/lib/supabase';
import { Recipe, RecipeIteration } from '@/types/models'; // Use RecipeIteration

// Hook to manage recipe iterations
export function useRecipeIteration(initialRecipeId?: string) {
  const [iterations, setIterations] = useState<RecipeIteration[]>([]);
  const [currentIteration, setCurrentIteration] = useState<RecipeIteration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all iterations for a specific recipe
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

      if (error) throw error;

      const fetchedIterations = data as RecipeIteration[] || [];
      setIterations(fetchedIterations);
      if (fetchedIterations.length > 0) {
        setCurrentIteration(fetchedIterations[0]);
      } else {
        setCurrentIteration(null);
      }
      console.log(`Fetched ${fetchedIterations.length} iterations for recipe ${recipeId}`);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch recipe iterations'));
      console.error('Error fetching recipe iterations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Create a new iteration based on an existing recipe or iteration
  const createNewIteration = useCallback(async (baseRecipe: Recipe | RecipeIteration, changes: Partial<RecipeIteration> = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const timestamp = new Date().toISOString();
      const latestVersionNumber = iterations.length > 0 ? iterations[0].version_number : 0;

      const newIterationData: Omit<RecipeIteration, 'id'> = {
        recipe_id: 'recipe_id' in baseRecipe ? baseRecipe.recipe_id : baseRecipe.id,
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

      if (error) throw error;
      if (!data) throw new Error('Failed to create new iteration');

      const createdIteration = data as RecipeIteration;

      // TODO: Handle copying/associating ingredients and instructions if needed

      setIterations(prev => [createdIteration, ...prev].sort((a, b) => b.version_number - a.version_number));
      setCurrentIteration(createdIteration);
      console.log('Created new iteration:', createdIteration);
      return createdIteration;

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create new iteration'));
      console.error('Error creating new iteration:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, iterations]);

  // Update details for a specific iteration (e.g., notes, metrics)
  const updateIterationDetails = useCallback(async (iterationId: string, details: Partial<Pick<RecipeIteration, 'title' | 'description' | 'notes' | 'metrics'>>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('recipe_iterations')
        .update(details)
        .eq('id', iterationId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update iteration details');

      const updatedIteration = data as RecipeIteration;

      setIterations(prev => prev.map(iter => iter.id === iterationId ? updatedIteration : iter)
                                  .sort((a, b) => b.version_number - a.version_number));
      if (currentIteration?.id === iterationId) {
        setCurrentIteration(updatedIteration);
      }
      console.log(`Updated iteration ${iterationId} details:`, details);
      return updatedIteration;

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update iteration details'));
      console.error('Error updating iteration details:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, currentIteration]);

  // Function to compare two iterations (focus on RecipeIteration fields)
  const compareIterations = useCallback((iterationA: RecipeIteration, iterationB: RecipeIteration) => {
    if (!iterationA || !iterationB) return null;

    // TODO: Enhance comparison to include ingredients/instructions if fetched separately
    return {
        titleChanged: iterationA.title !== iterationB.title,
        descriptionChanged: iterationA.description !== iterationB.description,
        notesChanged: iterationA.notes !== iterationB.notes,
        metricsChanged: JSON.stringify(iterationA.metrics) !== JSON.stringify(iterationB.metrics),
        // Add ingredient/instruction comparison logic here if data is available
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
    compareIterations,
    getAISuggestions,
    setCurrentIteration,
  };
}