import React, { useState } from 'react';
import type { Recipe as BaseRecipe, RecipeIngredient, Ingredient } from '../types/models';
import { Button } from './ui/button'; // Import the standard Button component

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 bg-[var(--surface-0)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg shadow-sm"> {/* Added theme styles */}
      <h2 className="text-lg font-bold text-[var(--text-primary)]">{recipe ? 'Edit Recipe' : 'Add Recipe'}</h2> {/* Added theme styles */}

      {error && <div className="text-[var(--error)]">{error}</div>} {/* Added theme styles */}

      <label className="flex flex-col text-[var(--text-primary)]"> {/* Added theme styles */}
        Title
        <input
          className="border border-[var(--border-subtle)] px-2 py-1 bg-[var(--surface-1)] text-[var(--text-primary)]" // Added theme styles
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col text-[var(--text-primary)]"> {/* Added theme styles */}
        Description
        <textarea
          className="border border-[var(--border-subtle)] px-2 py-1 bg-[var(--surface-1)] text-[var(--text-primary)]" // Added theme styles
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <div>
        <h3 className="font-semibold mb-2 text-[var(--text-primary)]">Ingredients</h3> {/* Added theme styles */}
        {ingredients.map((ing, index) => (
          <div key={ing.id} className="flex gap-2 mb-2 items-center"> {/* Added items-center for alignment */}
            <select
              className="border border-[var(--border-subtle)] px-2 py-1 flex-1 bg-[var(--surface-1)] text-[var(--text-primary)]" // Added theme styles
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
              className="border border-[var(--border-subtle)] px-2 py-1 w-20 bg-[var(--surface-1)] text-[var(--text-primary)]" // Added theme styles
              placeholder="Qty"
              value={ing.quantity}
              onChange={(e) => updateIngredient(index, { quantity: parseFloat(e.target.value) })}
              required
            />
            <input
              className="border border-[var(--border-subtle)] px-2 py-1 w-20 bg-[var(--surface-1)] text-[var(--text-primary)]" // Added theme styles
              placeholder="Unit"
              value={ing.unit}
              onChange={(e) => updateIngredient(index, { unit: e.target.value })}
            />
            <Button // Use the standard Button component
              type="button"
              onClick={() => removeIngredient(index)}
              className="text-[var(--error)] hover:text-[var(--error-hover)]" // Added theme styles
              variant="ghost" // Use ghost variant for a less prominent button
            >
              Remove
            </Button>
          </div>
        ))}
        <Button // Use the standard Button component
          type="button"
          onClick={addIngredient}
          className="mt-2 px-2 py-1 border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--surface-1)]" // Added theme styles
          variant="outline" // Use outline variant
        >
          Add Ingredient
        </Button>
      </div>

      <div className="flex gap-2 mt-4">
        <Button // Use the standard Button component
          type="submit"
          disabled={saving}
          className="bg-[var(--accent)] text-[var(--text-inverse)] hover:bg-[var(--accent-hover)] disabled:opacity-50" // Added theme styles
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button // Use the standard Button component
          type="button"
          onClick={onCancel}
          className="border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--surface-1)] disabled:opacity-50" // Added theme styles
          variant="outline" // Use outline variant
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}