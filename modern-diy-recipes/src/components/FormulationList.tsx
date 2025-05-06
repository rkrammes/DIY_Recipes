import React from 'react';
import RecipeList from './RecipeList';

export interface FormulationListItem {
  id: string;
  title: string;
}

export interface ErrorData {
  error: string;
  details?: any;
  code?: string;
}

export interface FormulationListProps {
  initialFormulations: FormulationListItem[] | null;
  initialError?: ErrorData | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

/**
 * FormulationList - A wrapper around RecipeList that uses formulation terminology
 * This provides a clean transition path while maintaining backward compatibility
 */
export default function FormulationList({ 
  initialFormulations, 
  initialError,
  selectedId, 
  onSelect 
}: FormulationListProps) {
  return (
    <RecipeList
      initialRecipes={initialFormulations}
      initialError={initialError}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  );
}

// Re-export original component for backward compatibility
export { RecipeList };