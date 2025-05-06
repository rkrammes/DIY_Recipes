// useFormulationVersion.ts
import { useRecipeIteration } from './useRecipeIteration';
import type { Formulation, FormulationVersion } from '../types/models';

/**
 * Hook for managing formulation versions
 * This is a wrapper around useRecipeIteration that uses formulation terminology
 */
export function useFormulationVersion(initialFormulationId?: string) {
  const {
    iterations: versions,
    currentIteration: currentVersion,
    isLoading,
    error,
    fetchIterations: fetchVersions,
    createNewIteration: createNewVersion,
    updateIterationDetails: updateVersionDetails,
    updateIterationIngredients: updateVersionIngredients,
    compareIterations: compareVersions,
    getAISuggestions,
    setCurrentIteration: setCurrentVersion,
    fetchIterationIngredients: fetchVersionIngredients
  } = useRecipeIteration(initialFormulationId);
  
  return {
    versions,
    currentVersion,
    isLoading,
    error,
    fetchVersions,
    createNewVersion,
    updateVersionDetails,
    updateVersionIngredients,
    compareVersions,
    getAISuggestions,
    setCurrentVersion,
    fetchVersionIngredients
  };
}

// Re-export original hook for backward compatibility
export { useRecipeIteration };