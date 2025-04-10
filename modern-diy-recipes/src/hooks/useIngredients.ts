import { useEffect, useState } from 'react';
import type { Ingredient } from '@/types/models';

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIngredients() {
      setLoading(true);
      try {
        const res = await fetch('/api/ingredients');
        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }
        const data = await res.json();
        setIngredients(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch ingredients');
      } finally {
        setLoading(false);
      }
    }

    fetchIngredients();
  }, []);

  return { ingredients, loading, error };
}