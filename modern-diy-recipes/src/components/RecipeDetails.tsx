import React from 'react';
import { useRecipe } from '../hooks/useRecipe';
import type { Recipe as BaseRecipe, RecipeIngredient } from '../types/models';

interface RecipeWithIngredients extends BaseRecipe {
  ingredients?: RecipeIngredient[];
}

interface RecipeDetailsProps {
  recipeId: string | null;
}

export default function RecipeDetails({ recipeId }: RecipeDetailsProps) {
  const { recipe, loading, error } = useRecipe(recipeId) as {
    recipe: RecipeWithIngredients | null;
    loading: boolean;
    error: string | null;
  };

  if (!recipeId) return <div className="p-4">Select a recipe to view details.</div>;
  if (loading) return <div className="p-4">Loading recipe...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!recipe) return <div className="p-4">Recipe not found.</div>;

  return (
    <div className="p-4 flex flex-col gap-4 overflow-y-auto">
      <h2 className="text-xl font-bold">{recipe.title}</h2>
      {recipe.description && <p>{recipe.description}</p>}

      <div>
        <h3 className="font-semibold mb-2">Ingredients</h3>
        <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Quantity</th>
              <th className="border px-2 py-1">Unit</th>
            </tr>
          </thead>
          <tbody>
            {(recipe.ingredients as RecipeIngredient[] | undefined)?.map((ing) => (
              <tr key={ing.id}>
                <td className="border px-2 py-1">{ing.ingredient_id}</td>
                <td className="border px-2 py-1">{ing.quantity}</td>
                <td className="border px-2 py-1">{ing.unit}</td>
              </tr>
            )) ?? (
              <tr>
                <td colSpan={3} className="border px-2 py-1 text-center">No ingredients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}