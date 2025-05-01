import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Ingredient } from '@/types/models';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredients = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('ingredients')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setIngredients(data || []);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch ingredients';
      setError(message);
      console.error('Error fetching ingredients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredients(); // Initial fetch

    // Set up real-time subscription
    const channel: RealtimeChannel = supabase
      .channel('ingredients-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ingredients' },
        (payload) => {
          console.log('Change received!', payload);
          // Re-fetch ingredients on any change for simplicity
          // More granular updates can be implemented based on payload.eventType
          fetchIngredients();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to ingredients changes');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setError(`Subscription error: ${err?.message || status}`);
          console.error('Subscription error:', err || status);
        }
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchIngredients]);

  return { ingredients, loading, error, refetch: fetchIngredients };
}