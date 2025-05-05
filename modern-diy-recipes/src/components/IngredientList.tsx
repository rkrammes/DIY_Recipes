'use client';

import React from 'react';
import type { Ingredient } from '@/types/models';
import { Button } from './ui/button';
import { useAudio } from '@/hooks/useAudio';
import ThemedIcon from './ThemedIcon';

interface IngredientListProps {
  ingredients: Ingredient[];
  loading: boolean;
  error: string | null;
  onAdd: () => void;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export default function IngredientList({ 
  ingredients, 
  loading, 
  error, 
  onAdd, 
  onEdit, 
  onDelete 
}: IngredientListProps) {
  const { playSound } = useAudio();

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const success = await onDelete(id);
      if (success) {
        playSound('delete');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-48 bg-surface rounded-lg border border-border-subtle">
        <div className="animate-pulse flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="mt-2 text-text-secondary">Loading ingredients...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-alert-red/10 border border-alert-red text-alert-red rounded-lg">
        <h3 className="font-semibold mb-2">Error Loading Ingredients</h3>
        <p>{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-3 bg-alert-red text-text-inverse hover:bg-alert-red/90"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface rounded-lg border border-border-subtle shadow-soft">
      <div className="p-4 flex justify-between items-center border-b border-border-subtle">
        <h2 className="text-xl font-semibold text-text">All Ingredients</h2>
        <Button 
          onClick={onAdd}
          className="bg-accent text-text-inverse hover:bg-accent-hover"
          size="sm"
        >
          Add Ingredient
        </Button>
      </div>
      
      <div className="p-4 flex-grow overflow-y-auto">
        {ingredients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary py-8">
            <div className="mb-3">
              <ThemedIcon iconType="ingredient" width={48} height={48} className="opacity-50" />
            </div>
            <p className="mb-2">No ingredients found</p>
            <Button 
              onClick={onAdd}
              variant="outline"
              className="text-accent border-accent hover:bg-accent/10"
            >
              Add Your First Ingredient
            </Button>
          </div>
        ) : (
          <ul className="space-y-1">
            {ingredients.map((ing: Ingredient) => (
              <li 
                key={ing.id} 
                className="group p-3 hover:bg-surface-1 rounded-md flex justify-between items-center border-b border-border-subtle/40 last:border-b-0"
              >
                <div 
                  className="flex flex-col cursor-pointer flex-grow"
                  onClick={() => onEdit(ing)}
                >
                  <span className="font-medium text-text">{ing.name}</span>
                  {ing.description && (
                    <span className="text-sm text-text-secondary line-clamp-1">
                      {ing.description}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(ing)}
                    className="p-1.5 rounded-full hover:bg-surface-1 text-text-secondary"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 themed-icon-edit" fill="none" viewBox="0 0 24 24" stroke="currentColor" 
                      style={{ stroke: 'var(--text-accent, currentColor)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(ing.id, ing.name)}
                    className="p-1.5 rounded-full hover:bg-alert-red/10 text-alert-red"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 themed-icon-delete" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      style={{ stroke: 'var(--alert-red, currentColor)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}