import React, { useState } from 'react';
import type { Recipe as BaseRecipe, RecipeIngredient, Ingredient } from '../types/models';

interface RecipeWithIngredients extends BaseRecipe {
  ingredients?: RecipeIngredient[];
}

interface RecipeFormProps {
  recipe?: RecipeWithIngredients | null;
  allIngredients: Ingredient[];
  onSave: (updatedRecipe: Partial<RecipeWithIngredients>) => Promise<void>;
  onCancel: () => void;
}

export default function RecipeForm({ recipe, allIngredients, onSave, onCancel }: RecipeFormProps) {
  const [title, setTitle] = useState(recipe?.title || '');
  const [description, setDescription] = useState(recipe?.description || '');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(recipe?.ingredients || []);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (ingredients.length === 0) {
      setError('At least one ingredient is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...recipe,
        title,
        description,
        ingredients,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save recipe.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const updateIngredient = (index: number, updated: Partial<RecipeIngredient>) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, ...updated } : ing))
    );
  };

  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        recipe_id: '',
        ingredient_id: '',
        quantity: 0,
        unit: '',
        created_at: new Date().toISOString()
      } as RecipeIngredient,
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-bold">{recipe ? 'Edit Recipe' : 'Add Recipe'}</h2>

      {error && <div className="text-red-500">{error}</div>}

      <label className="flex flex-col">
        Title
        <input
          className="border px-2 py-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col">
        Description
        <textarea
          className="border px-2 py-1"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <div>
        <h3 className="font-semibold mb-2">Ingredients</h3>
        {ingredients.map((ing, index) => (
          <div key={ing.id} className="flex gap-2 mb-2">
            <select
              className="border px-2 py-1 flex-1"
              value={ing.ingredient_id}
              onChange={(e) => updateIngredient(index, { ingredient_id: e.target.value })}
              required
            >
              <option value="">Select Ingredient</option>
              {allIngredients.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name}
                </option>
              ))}
            </select>
            <input
              className="border px-2 py-1 w-20"
              placeholder="Qty"
              value={ing.quantity}
              onChange={(e) => updateIngredient(index, { quantity: parseFloat(e.target.value) })}
              required
            />
            <input
              className="border px-2 py-1 w-20"
              placeholder="Unit"
              value={ing.unit}
              onChange={(e) => updateIngredient(index, { unit: e.target.value })}
            />
            <button type="button" onClick={() => removeIngredient(index)} className="text-red-500">
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addIngredient} className="mt-2 px-2 py-1 border">
          Add Ingredient
        </button>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded"
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}