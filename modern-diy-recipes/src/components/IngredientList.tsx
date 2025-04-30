import React from 'react';
import { useIngredients } from '@/hooks/useIngredients';
import type { Ingredient } from '@/types/models';

export default function IngredientList() {
  const { ingredients, loading, error } = useIngredients();

  if (loading) return <p>Loading ingredients...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 h-full overflow-y-auto"> {/* Added padding, gap, and overflow handling */}
      <h2 className="text-xl font-bold">All Ingredients</h2> {/* Increased heading size */}
      <ul className="list-disc pl-6 space-y-2"> {/* Improved list styling and spacing */}
        {ingredients.map((ing: Ingredient) => (
          <li key={ing.id} className="text-gray-700 dark:text-gray-300"> {/* Added text color */}
            {ing.name} {ing.description ? `- ${ing.description}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}