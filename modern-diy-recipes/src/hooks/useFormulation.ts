import { useRecipe } from './useRecipe';
import type { FormulationWithIngredientsAndVersions } from '../types/models';

interface FormulationUpdate {
  title: string;
  description: string;
  ingredients: any[];
}

/**
 * Hook for managing a DIY formulation
 * This is a wrapper around useRecipe that uses formulation terminology
 */
export function useFormulation(
  id: string | null, 
  initialData?: FormulationWithIngredientsAndVersions | null
) {
  const { 
    recipe: formulation, 
    loading, 
    error, 
    updateRecipe: updateFormulation, 
    deleteRecipe: deleteFormulation,
    refetch
  } = useRecipe(id, initialData);

  return { 
    formulation, 
    loading, 
    error, 
    updateFormulation, 
    deleteFormulation,
    refetch
  };
}

// Re-export original hook for backward compatibility
export { useRecipe };