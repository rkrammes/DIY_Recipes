import React from 'react';
import { useIngredients } from '@/hooks/useIngredients';
import type { Ingredient } from '@/types/models';

interface IngredientListProps {
  onAdd: () => void;
  onEdit: (ingredient: Ingredient) => void;
}

export default function IngredientList({ onAdd, onEdit }: IngredientListProps) {
  const { ingredients, loading, error, refetch } = useIngredients(); // Destructure refetch

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this ingredient?')) {
      try {
        const res = await fetch(`/api/ingredients/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        refetch(); // Refetch ingredients after deletion
      } catch (err: any) {
        console.error('Failed to delete ingredient:', err);
        // Optionally, display an error message to the user
      }
    }
  };

  if (loading) return <p>Loading ingredients...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 h-full overflow-y-auto bg-[var(--surface-0)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg shadow-sm"> {/* Added padding, gap, and overflow handling, added theme styles */}
      <h2 className="text-xl font-bold text-[var(--text-primary)]">All Ingredients</h2> {/* Increased heading size */}
      <ul className="list-disc pl-6 space-y-2"> {/* Improved list styling and spacing */}
        {ingredients.map((ing: Ingredient) => (
          <li key={ing.id} className="flex justify-between items-center text-[var(--text-secondary)]"> {/* Added flex and justify-between */}
            <div className="cursor-pointer hover:underline" onClick={() => onEdit(ing)}> {/* Make clickable */}
              {ing.name} {ing.description ? `- ${ing.description}` : ''}
            </div>
            <button
              onClick={() => handleDelete(ing.id)}
              className="text-[var(--error)] hover:text-[var(--error-hover)] text-sm" // Added theme styles and text-sm
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={onAdd}
        className="mt-4 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] rounded hover:bg-[var(--accent-hover)]" // Added button styling
      >
        Add Ingredient
      </button>
    </div>
  );
}