import React, { useEffect, useState } from 'react';
import type { RecipeIteration } from '../types/models';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button'; // Assuming Button is in a ui directory

interface RecipeIterationProps {
  recipeId: string;
  onSelectIteration: (iteration: RecipeIteration) => void;
  selectedIterationId?: string;
}

export default function RecipeIteration({
  recipeId,
  onSelectIteration,
  selectedIterationId,
}: RecipeIterationProps) {
  const [iterations, setIterations] = useState<RecipeIteration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIterations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipe_iterations')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('version_number', { ascending: false });

      if (error) {
        console.error('Error fetching iterations:', error);
      } else if (data) {
        setIterations(data as RecipeIteration[]);
      }
      setLoading(false);
    };

    if (recipeId) {
      fetchIterations();
    }
  }, [recipeId]);

  if (loading) {
    return <div className="p-4 text-center">Loading iterations...</div>;
  }

  return (
    <div className="border border-[var(--border-subtle)] rounded-lg p-4 shadow-sm bg-[var(--surface-0)] text-[var(--text-primary)]">
      <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">Recipe Versions</h3>
      <ul className="space-y-2 max-h-60 overflow-y-auto pr-2"> {/* Added pr-2 for scrollbar */}
        {iterations.map((iteration) => (
          <li key={iteration.id}>
            <Button
              variant={iteration.id === selectedIterationId ? 'default' : 'ghost'}
              className={`w-full justify-start text-left ${
                iteration.id === selectedIterationId
                  ? 'bg-[var(--accent)] text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]' // Use accent for selected
                  : 'hover:bg-[var(--surface-1)] text-[var(--text-primary)]' // Added text color for ghost
              }`}
              onClick={() => onSelectIteration(iteration)}
            >
              v{iteration.version_number}: {iteration.title}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}