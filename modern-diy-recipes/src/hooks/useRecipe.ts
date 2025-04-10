import { useEffect, useState } from 'react';
import type { Recipe } from '@/types/models';

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
      } catch (err: any) {
        setError(err.message || 'Failed to fetch recipe');
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipe();
  }, [id]);

  return { recipe, loading, error };
}