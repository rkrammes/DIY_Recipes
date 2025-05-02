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
    <div className="border border-[var(--border-subtle)] p-4 rounded-lg shadow-sm mt-4 bg-[var(--surface-0)] text-[var(--text-primary)]">
      <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">AI Suggestions</h3>
      {suggestions.length === 0 ? (
        <div className="text-[var(--text-secondary)]">No suggestions available.</div>
      ) : (
        <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)]">
          {suggestions.map((s) => (
            <li key={s.id}>
              <strong>Suggestion:</strong> {s.suggestion}
              {s.reason && (
                <div className="text-sm text-[var(--text-tertiary)] mt-1">
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