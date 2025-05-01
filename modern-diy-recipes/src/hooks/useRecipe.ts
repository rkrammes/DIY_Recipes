import { useEffect, useState, useCallback } from 'react';
import type { Recipe, RecipeIngredient } from '@/types/models';

interface RecipeUpdate {
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
}

export function useRecipe(id: string | null) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setRecipe(null);
      setLoading(false);
      setError('No recipe ID provided');
      return;
    }

    async function fetchRecipe() {
      setLoading(true);
      try {
        const res = await fetch(`/api/recipes/${id}`);
        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }
        const data = await res.json();
        setRecipe(data);
        setError(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch recipe';
        setError(message);
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipe();
  }, [id]);

  const updateRecipe = useCallback(async (updates: RecipeUpdate) => {
    if (!id) {
      throw new Error('No recipe ID provided');
    }

    // Store current state for rollback
    const previousRecipe = recipe;

    // Optimistic update
    setRecipe((prev) => prev ? {
      ...prev,
      ...updates,
      updated_at: new Date().toISOString()
    } : null);

    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      
      // Update with server response
      setRecipe(data);
      setError(null);
      
      return data;
    } catch (err: unknown) {
      // Rollback on error
      setRecipe(previousRecipe);
      const message = err instanceof Error ? err.message : 'Failed to update recipe';
      setError(message);
      throw err;
    }
  }, [id, recipe]);

  return { recipe, loading, error, updateRecipe };
}