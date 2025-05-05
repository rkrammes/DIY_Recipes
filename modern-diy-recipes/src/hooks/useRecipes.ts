import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Recipe } from '@/types/models';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Supabase recipes fetch error:', fetchError.message);
        setError(fetchError.message);
        setRecipes([]);
      } else {
        setRecipes(data || []);
        setError(null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch recipes';
      console.error('Error fetching recipes:', err);
      setError(message);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('recipes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recipes' },
        () => {
          fetchRecipes();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRecipes]);

  const deleteRecipe = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting recipe:', deleteError.message);
        setError(deleteError.message);
        throw deleteError;
      }

      // Remove the deleted recipe from the local state
      setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== id));
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete recipe';
      console.error('Delete recipe error:', err);
      setError(message);
      throw err;
    }
  }, []);

  const updateRecipe = useCallback(async (id: string, updates: Partial<Recipe>) => {
    // Optimistic update
    const originalRecipes = [...recipes];
    setRecipes((prevRecipes) =>
      prevRecipes.map((recipe) =>
        recipe.id === id ? { ...recipe, ...updates } : recipe
      )
    );

    try {
      const { error: updateError } = await supabase
        .from('recipes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating recipe:', updateError.message);
        setError(updateError.message);
        // Rollback optimistic update on error
        setRecipes(originalRecipes);
        throw updateError;
      }

      // Fetch the updated recipe to ensure we have the latest data
      const { data: updatedRecipe, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching updated recipe:', fetchError.message);
        setError(fetchError.message);
        return null;
      }

      // Update state with the confirmed data from the server
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.id === id ? updatedRecipe : recipe
        )
      );
      setError(null);
      return updatedRecipe;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update recipe';
      console.error('Update recipe error:', err);
      setError(message);
      // Rollback optimistic update on error
      setRecipes(originalRecipes);
      throw err;
    }
  }, [recipes]);

  return { recipes, loading, error, deleteRecipe, updateRecipe, refetch: fetchRecipes };
}