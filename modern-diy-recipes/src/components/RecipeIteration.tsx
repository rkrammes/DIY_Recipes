import React, { useEffect, useState } from 'react';
import type { RecipeIteration } from '../types/models';
import { supabase } from '../lib/supabase';

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
    return <div>Loading iterations...</div>;
  }

  return (
    <div className="border p-2 rounded">
      <h3 className="font-semibold mb-2">Recipe Versions</h3>
      <ul className="space-y-1 max-h-60 overflow-y-auto">
        {iterations.map((iteration) => (
          <li key={iteration.id}>
            <button
              className={`w-full text-left px-2 py-1 rounded ${
                iteration.id === selectedIterationId
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => onSelectIteration(iteration)}
            >
              v{iteration.version_number}: {iteration.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}