import React from 'react';
import RecipeDetails from './RecipeDetails';
import type { FormulationWithIngredientsAndVersions } from '../types/models';

export interface FormulationDetailsProps {
  formulationId: string | null;
  initialFormulationData?: FormulationWithIngredientsAndVersions | null;
}

/**
 * FormulationDetails - A wrapper around RecipeDetails that uses formulation terminology
 * This provides a clean transition path while maintaining backward compatibility
 */
export default function FormulationDetails({ 
  formulationId, 
  initialFormulationData 
}: FormulationDetailsProps) {
  return (
    <RecipeDetails
      recipeId={formulationId}
      initialRecipeData={initialFormulationData}
    />
  );
}

// Re-export original component for backward compatibility
export { RecipeDetails };