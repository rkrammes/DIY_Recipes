import React from 'react';
import { useRecipes } from '../hooks/useRecipes';
import type { Recipe } from '../types/models';

interface RecipeListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function RecipeList({ selectedId, onSelect }: RecipeListProps) {
  const { recipes, loading, error } = useRecipes();

  if (loading) return <div>Loading recipes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul className="w-full max-w-xs border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
      {recipes.map((recipe: Recipe) => (
        <li
          key={recipe.id}
          onClick={() => onSelect(recipe.id)}
          className={`cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
            selectedId === recipe.id ? 'bg-gray-200 dark:bg-gray-700 font-semibold' : ''
          }`}
        >
          {recipe.title || 'Untitled Recipe'}
        </li>
      ))}
    </ul>
  );
}