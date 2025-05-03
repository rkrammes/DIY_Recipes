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

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  user_id: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  created_at: string;
}

export interface TransformedIngredient {
  id: string;
  quantity: number;
  unit: string;
  notes: string | null;
  name: string | null;
  description: string | null;
}

export interface RecipeIteration {
  id: string;
  recipe_id: string;
  version_number: number;
  title: string;
  description?: string;
  created_at: string;
  notes?: string;
  metrics?: Record<string, number>; // e.g., calories, prep_time, cost
}

export interface IterationComparisonResult {
  baseIterationId: string;
  compareIterationId: string;
  differences: Record<string, { from: unknown; to: unknown }>;
}

export interface RecipeAnalysisData {
  metrics: Record<string, number>;
  insights?: string[];
}

export interface AISuggestion {
  id: string;
  recipe_id: string;
  suggestion: string;
  reason?: string;
  created_at: string;
}

export interface RecipeWithIterations extends Recipe {
  iterations?: RecipeIteration[];
}

export interface RecipeWithIngredientsAndIterations extends Recipe {
  ingredients?: TransformedIngredient[];
  iterations?: RecipeIteration[];
}