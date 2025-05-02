"use client";  // Ensure this is a Client Component

import { useEffect, useState, useCallback } from 'react';
import type { Recipe, RecipeIngredient, RecipeIteration } from '@/types/models';

interface RecipeUpdate {
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
}

export function useRecipe(id: string | null, initialRecipeData?: (Recipe & { iterations?: RecipeIteration[] }) | null) {
  const [recipe, setRecipe] = useState<(Recipe & { iterations?: RecipeIteration[] }) | null>(initialRecipeData || null);
  const [loading, setLoading] = useState<boolean>(!initialRecipeData);
  const [error, setError] = useState<string | null>(null);

  console.log(`useRecipe hook initialized for ID: ${id}`);  // Added log for diagnosis

  useEffect(() => {
    console.log(`useEffect triggered in useRecipe for ID: ${id}`);  // Added log
    if (!initialRecipeData && id) {
      async function fetchRecipe() {
        setLoading(true);
        try {
          const res = await fetch(`/api/recipes/${id}?include=iterations`);
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
    } else if (!id) {
      setRecipe(null);
      setLoading(false);
      setError('No recipe ID provided');
    } else {
      setLoading(false);
    }
  }, [id, initialRecipeData]);

  const updateRecipe = useCallback(async (updates: RecipeUpdate) => {
    if (!id) {
      throw new Error('No recipe ID provided');
    }
    const previousRecipe = recipe;
    setRecipe((prev) => prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null);
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${await res.text()}`);
      }
      const data = await res.json();
      setRecipe(data);
      setError(null);
      return data;
    } catch (err: unknown) {
      setRecipe(previousRecipe);
      const message = err instanceof Error ? err.message : 'Failed to update recipe';
      setError(message);
      throw err;
    }
  }, [id, recipe]);

  return { recipe, loading, error, updateRecipe };
}