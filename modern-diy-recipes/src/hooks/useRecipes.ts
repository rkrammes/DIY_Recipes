import { useEffect, useState } from 'react';
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
      } catch (err: any) {
        setError(err.message || 'Failed to fetch recipes');
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  return { recipes, loading, error };
}