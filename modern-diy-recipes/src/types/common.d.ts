/**
 * Common type definitions for DIY Recipes
 */

// Import base types
import { Recipe, Ingredient, RecipeIngredient, TransformedIngredient } from './models';

// Extend Recipe type to include ingredients
export interface RecipeWithIngredients extends Recipe {
  ingredients?: TransformedIngredient[];
  recipe_ingredients?: RecipeIngredient[];
}

// Theme types with proper index signatures
export interface ThemeColors {
  [key: string]: string;
  background: string;
  foreground: string;
  accent: string;
  surface: string;
  text: string;
}

export interface ThemeConfig {
  [themeName: string]: ThemeColors;
}

// Re-export UserPreferences with audio fix
export interface UserPreferencesWithAudio {
  theme: 'hackers' | 'dystopia' | 'neotopia';
  audio_enabled: boolean;
  audioEnabled?: boolean; // Alias for compatibility
  volume: number;
  default_view: string;
  avatar?: string;
  display_name?: string;
  color?: string;
  debug_mode: boolean;
  show_experimental: boolean;
}

// Common function parameter types
export type ItemType = Ingredient | Recipe | { id: string; name: string; [key: string]: any };

// Font variables type
export interface FontVariables {
  [key: string]: string;
}

// Fix for callable expressions
export interface CallableHook<T> {
  (): T;
  (args: any): T;
}