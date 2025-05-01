import { useEffect, useState, useCallback } from 'react';
import type { Recipe } from '@/types/models';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipes() {
      setLoading(true);
      try {
        const res = await fetch('/api/recipes');
        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }
        const data = await res.json();
        setRecipes(data);
        setError(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch recipes';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  const deleteRecipe = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      // Remove the deleted recipe from the local state
      setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== id));
      setError(null); // Clear any previous errors
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete recipe';
      setError(message);
      // Optionally re-throw or handle the error more specifically
      throw err; // Re-throw to allow calling component to handle it
    }
  }, []);

  const updateRecipe = useCallback(async (id: string, updates: Partial<Recipe>) => {
    // Optimistic update (optional but improves UX)
    const originalRecipes = [...recipes];
    setRecipes((prevRecipes) =>
      prevRecipes.map((recipe) =>
        recipe.id === id ? { ...recipe, ...updates } : recipe
      )
    );

    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'PATCH', // or PUT if replacing the whole resource
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const updatedRecipe = await res.json();
      // Update state with the confirmed data from the server
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.id === id ? updatedRecipe : recipe
        )
      );
      setError(null);
      return updatedRecipe; // Return the updated recipe
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update recipe';
      setError(message);
      // Rollback optimistic update on error
      setRecipes(originalRecipes);
      throw err; // Re-throw for the component to handle
    }
  }, [recipes]); // Dependency array includes recipes for optimistic update rollback


  return { recipes, loading, error, deleteRecipe, updateRecipe };
}