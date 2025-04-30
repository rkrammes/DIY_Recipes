import React, { useState } from 'react';
import type { Ingredient } from '@/types/models';
import { Label } from '@/components/ui/label'; // Import standard Label
import { Input } from '@/components/ui/input'; // Import standard Input
import { Textarea } from '@/components/ui/textarea'; // Import standard Textarea
import { Button } from '@/components/ui/button'; // Import standard Button

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
    <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6"> {/* Added padding */}
      <div>
        <Label htmlFor="ingredient-name">Name</Label> {/* Use standard Label */}
        <Input // Use standard Input
          id="ingredient-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="ingredient-description">Description</Label> {/* Use standard Label */}
        <Textarea // Use standard Textarea
          id="ingredient-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>} {/* Added text-sm */}
      {success && <p className="text-green-600 text-sm">Saved successfully!</p>} {/* Added text-sm */}
      <Button // Use standard Button
        type="submit"
        disabled={loading}
        className="w-full justify-center" // Make button full width
      >
        {loading ? 'Saving...' : 'Save Ingredient'}
      </Button>
    </form>
  );
}