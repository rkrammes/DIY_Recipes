import React from 'react';
import { useIngredients } from '@/hooks/useIngredients';
import type { Ingredient } from '@/types/models';

interface IngredientSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function IngredientSelector({ selectedIds, onChange }: IngredientSelectorProps) {
  const { ingredients, loading, error } = useIngredients();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions);
    const values = options.map((opt) => opt.value);
    onChange(values);
  };

  if (loading) return <p>Loading ingredients...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <label className="block mb-1 font-medium">Select Ingredients:</label>
      <select
        multiple
        className="w-full border border-gray-300 rounded p-2"
        value={selectedIds}
        onChange={handleChange}
      >
        {ingredients.map((ing: Ingredient) => (
          <option key={ing.id} value={ing.id}>
            {ing.name}
          </option>
        ))}
      </select>
    </div>
  );
}