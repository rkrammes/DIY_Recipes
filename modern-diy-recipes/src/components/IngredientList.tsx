import React from 'react';
import { useIngredients } from '@/hooks/useIngredients';
import type { Ingredient } from '@/types/models';

export default function IngredientList() {
  const { ingredients, loading, error } = useIngredients();

  if (loading) return <p>Loading ingredients...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">All Ingredients</h2>
      <ul className="list-disc pl-5">
        {ingredients.map((ing: Ingredient) => (
          <li key={ing.id}>
            {ing.name} {ing.description ? `- ${ing.description}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}