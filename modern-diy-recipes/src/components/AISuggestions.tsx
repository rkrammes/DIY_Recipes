import React, { useEffect, useState } from 'react';
import type { AISuggestion } from '../types/models';
import { supabase } from '../lib/supabase';

interface AISuggestionsProps {
  recipeId: string;
}

export default function AISuggestions({ recipeId }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipe_ai_suggestions')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching AI suggestions:', error);
      } else if (data) {
        setSuggestions(data as AISuggestion[]);
      }
      setLoading(false);
    };

    if (recipeId) {
      fetchSuggestions();
    }
  }, [recipeId]);

  if (loading) {
    return <div>Loading AI suggestions...</div>;
  }

  return (
    <div className="border p-2 rounded mt-4">
      <h3 className="font-semibold mb-2">AI Suggestions</h3>
      {suggestions.length === 0 ? (
        <div>No suggestions available.</div>
      ) : (
        <ul className="list-disc pl-5 space-y-1">
          {suggestions.map((s) => (
            <li key={s.id}>
              <strong>Suggestion:</strong> {s.suggestion}
              {s.reason && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Reason: {s.reason}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}