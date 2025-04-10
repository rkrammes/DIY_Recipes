import React, { useState } from 'react';
import type { Ingredient } from '@/types/models';

interface IngredientEditorProps {
  ingredient?: Ingredient;
  onSave?: (ingredient: Ingredient) => void;
}

export default function IngredientEditor({ ingredient, onSave }: IngredientEditorProps) {
  const [name, setName] = useState(ingredient?.name || '');
  const [description, setDescription] = useState(ingredient?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const method = ingredient ? 'PUT' : 'POST';
      const url = ingredient ? `/api/ingredients/${ingredient.id}` : '/api/ingredients';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const saved = await res.json();
      setSuccess(true);
      onSave?.(saved);
    } catch (err: any) {
      setError(err.message || 'Failed to save ingredient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Name</label>
        <input
          className="w-full border border-gray-300 rounded p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          className="w-full border border-gray-300 rounded p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">Saved successfully!</p>}
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Ingredient'}
      </button>
    </form>
  );
}