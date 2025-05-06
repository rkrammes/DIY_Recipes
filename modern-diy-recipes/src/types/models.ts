export interface User {
  id: string;
  email: string;
  username?: string;
  created_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

/**
 * Core model for DIY formulations (previously called recipes)
 */
export interface Recipe {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  user_id: string;
}

// Define Formulation as an alias to Recipe to help with transition
export type Formulation = Recipe;

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  created_at: string;
}

// Define FormulationIngredient as an alias
export type FormulationIngredient = RecipeIngredient;

export interface TransformedIngredient {
  id: string;
  quantity: number;
  unit: string;
  notes?: string | null;
  name: string | null;
  description: string | null;
  recipe_ingredient_id: string;
}

/**
 * Represents a version of a DIY formulation (previously called recipe iteration)
 */
export interface RecipeIteration {
  id: string;
  recipe_id: string;
  version_number: number;
  title: string;
  description?: string;
  created_at: string;
  notes?: string;
  metrics?: Record<string, number>; // e.g., viscosity, pH, cost
  instructions?: string; // Process steps for creating the formulation
  ingredients?: TransformedIngredient[]; // Included for document-centric view
}

// Define FormulationVersion as an alias to RecipeIteration
export type FormulationVersion = RecipeIteration;

export interface IterationComparisonResult {
  baseIterationId: string;
  compareIterationId: string;
  differences: Record<string, { from: unknown; to: unknown }>;
}

// Define VersionComparisonResult as an alias
export type VersionComparisonResult = IterationComparisonResult;

export interface RecipeAnalysisData {
  metrics: Record<string, number>;
  insights?: string[];
}

// Define FormulationAnalysisData as an alias
export type FormulationAnalysisData = RecipeAnalysisData;

export interface AISuggestion {
  id: string;
  recipe_id: string;
  suggestion: string;
  reason?: string;
  created_at: string;
}

// Define FormulationSuggestion as an alias
export type FormulationSuggestion = AISuggestion;

export interface RecipeWithIterations extends Recipe {
  iterations?: RecipeIteration[];
}

// Define FormulationWithVersions as an alias
export type FormulationWithVersions = RecipeWithIterations;

export interface RecipeWithIngredientsAndIterations extends Recipe {
  ingredients?: TransformedIngredient[];
  iterations?: RecipeIteration[];
}

// Define FormulationWithIngredientsAndVersions as an alias
export type FormulationWithIngredientsAndVersions = RecipeWithIngredientsAndIterations;