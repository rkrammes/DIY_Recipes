import React, { useState } from 'react';
import type { Recipe, Ingredient, TransformedIngredient, RecipeWithIngredientsAndIterations } from '../types/models';
import { Button } from './ui/button';

interface RecipeFormProps {
  recipe?: RecipeWithIngredientsAndIterations | null;
  allIngredients: Ingredient[];
  onSave: (updatedRecipe: Partial<RecipeWithIngredientsAndIterations>) => Promise<void>;
  onCancel: () => void;
}

export default function RecipeForm({ recipe, allIngredients, onSave, onCancel }: RecipeFormProps) {
  const [title, setTitle] = useState(recipe?.title || '');
  const [description, setDescription] = useState(recipe?.description || '');
  const [ingredients, setIngredients] = useState<TransformedIngredient[]>(recipe?.ingredients || []);

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

  const updateIngredient = (index: number, updated: Partial<TransformedIngredient>) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, ...updated } : ing))
    );
  };

  const addIngredient = () => {
    const newIngredient: TransformedIngredient = {
      id: crypto.randomUUID(),
      quantity: 0,
      unit: '',
      notes: null,
      name: null,
      description: null
    };
    setIngredients((prev) => [...prev, newIngredient]);
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 bg-surface text-text border border-subtle rounded-lg shadow-soft">
      <h2 className="text-lg font-bold">{recipe ? 'Edit Recipe' : 'Add Recipe'}</h2>

      {error && <div id="form-error" className="text-alert-red" role="alert">{error}</div>}

      <label className="flex flex-col">
        Title
        <input
          className={`border px-2 py-1 bg-surface-1 text-text ${error && !title.trim() ? 'border-alert-red' : 'border-subtle'}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          aria-describedby={error && !title.trim() ? 'form-error' : undefined}
        />
      </label>

      <label className="flex flex-col">
        Description
        <textarea
          className="border border-subtle px-2 py-1 bg-surface-1 text-text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <div className={`${error && ingredients.length === 0 ? 'border border-alert-red p-2 rounded' : ''}`} 
           aria-describedby={error && ingredients.length === 0 ? 'form-error' : undefined}>
        <h3 className="font-semibold mb-2">Ingredients</h3>
        {ingredients.map((ing, index) => (
          <div key={ing.id} className="flex gap-2 mb-2 items-center">
            <select
              className="border border-subtle px-2 py-1 flex-1 bg-surface-1 text-text"
              value={ing.id}
              onChange={(e) => {
                const selectedIngredient = allIngredients.find(i => i.id === e.target.value);
                updateIngredient(index, {
                  id: e.target.value,
                  name: selectedIngredient?.name || null,
                  description: selectedIngredient?.description || null
                });
              }}
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
              className="border border-subtle px-2 py-1 w-20 bg-surface-1 text-text"
              placeholder="Qty"
              type="number"
              step="0.01"
              value={ing.quantity || ''}
              onChange={(e) => updateIngredient(index, { quantity: parseFloat(e.target.value) })}
              required
            />
            <input
              className="border border-subtle px-2 py-1 w-20 bg-surface-1 text-text"
              placeholder="Unit"
              value={ing.unit}
              onChange={(e) => updateIngredient(index, { unit: e.target.value })}
              required
            />
            <Button
              type="button"
              onClick={() => removeIngredient(index)}
              className="text-alert-red hover:text-alert-red-hover"
              variant="ghost"
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={addIngredient}
          className="mt-2 px-2 py-1 border border-subtle text-text hover:bg-surface-1"
          variant="outline"
        >
          Add Ingredient
        </Button>
      </div>

      <div className="flex gap-2 mt-4">
        <Button
          type="submit"
          disabled={saving}
          className="bg-accent text-text-inverse hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          className="border border-subtle text-text hover:bg-surface-1 disabled:opacity-50"
          variant="outline"
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}