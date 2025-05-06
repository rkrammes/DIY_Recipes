import React from 'react';
import DocumentCentricRecipe from './DocumentCentricRecipe';
import type { Formulation } from '../types/models';

export interface DocumentCentricFormulationProps {
  formulationId: string;
  initialData?: Formulation | null;
}

/**
 * DocumentCentricFormulation - A wrapper around DocumentCentricRecipe that uses formulation terminology
 * This provides a clean transition path while maintaining backward compatibility
 */
export default function DocumentCentricFormulation({ 
  formulationId, 
  initialData 
}: DocumentCentricFormulationProps) {
  return (
    <DocumentCentricRecipe
      recipeId={formulationId}
      initialData={initialData}
    />
  );
}

// Re-export original component for backward compatibility
export { DocumentCentricRecipe };