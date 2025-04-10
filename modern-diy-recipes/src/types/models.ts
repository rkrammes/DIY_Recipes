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