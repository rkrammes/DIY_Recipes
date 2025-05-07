/**
 * Data Layer Exports
 * 
 * This file exports all data layer components for easy access.
 * It includes the base repository, specific repositories, repository factory,
 * and convenience re-exports of common data model types.
 */

// Export the base repository and core types
export * from './repository';

// Export specific repositories
export * from './formulationRepository';
export * from './ingredientRepository';

// Export the repository factory for creating repositories
export * from './repositoryFactory';

// Re-export types from models for convenience
export type {
  Formulation,
  FormulationIngredient,
  FormulationWithIngredientsAndVersions,
  FormulationVersion,
  Ingredient
} from '@/types/models';