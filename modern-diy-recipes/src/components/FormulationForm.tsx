import React from 'react';
import RecipeForm from './RecipeForm';
import type { 
  Ingredient, 
  TransformedIngredient, 
  FormulationWithIngredientsAndVersions 
} from '../types/models';

export interface FormulationFormProps {
  formulation?: FormulationWithIngredientsAndVersions | null;
  allIngredients: Ingredient[];
  onSave: (updatedFormulation: Partial<FormulationWithIngredientsAndVersions>) => Promise<void>;
  onCancel: () => void;
}

/**
 * FormulationForm - A wrapper around RecipeForm that uses formulation terminology
 * This provides a clean transition path while maintaining backward compatibility
 */
export default function FormulationForm({ 
  formulation, 
  allIngredients, 
  onSave, 
  onCancel 
}: FormulationFormProps) {
  return (
    <RecipeForm
      recipe={formulation}
      allIngredients={allIngredients}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}

// Re-export original component for backward compatibility
export { RecipeForm };