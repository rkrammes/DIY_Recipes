import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Button } from './ui/button';
import { Input } from '@/components/ui/input'; // Assuming an Input component exists

interface RecipeListItem {
  id: string;
  title: string;
}

interface UpdatedRecipeResult {
  title: string;
  // Add other properties if updateRecipe returns more
}

interface RecipeListProps {
  initialRecipes: RecipeListItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function RecipeList({ initialRecipes, selectedId, onSelect }: RecipeListProps) {
  const router = useRouter(); // Initialize useRouter
  const [recipes, setRecipes] = useState<RecipeListItem[]>(initialRecipes);

  // No loading or error state needed here as data is fetched on the server
  // if (loading) return <div>Loading recipes...</div>;
  // if (error) return <div>Error loading recipes: {error}</div>;

  return (
    <ul className="w-full sm:w-64 md:w-72 border-r border-[var(--border-subtle)] overflow-y-auto h-full bg-[var(--surface-0)] text-[var(--text-primary)]"> {/* Responsive width and ensure full height, added theme styles */}
      {recipes.map((recipe: RecipeListItem) => (
        <li
          key={recipe.id}
          onClick={() => {
              onSelect(recipe.id); // Still keep onSelect for state management on the main page
              router.push(`/recipes/${recipe.id}`); // Navigate to the recipe details page
          }}
          className={`flex justify-between items-center cursor-pointer px-4 py-2 transition-colors duration-150 hover:bg-[var(--surface-1)] ${ // Added transition
            selectedId === recipe.id ? 'bg-[var(--accent)] text-[var(--text-inverse)] font-semibold' : '' // Use accent for selected
          }`}
          aria-current={selectedId === recipe.id ? 'page' : undefined}
        >
          <span
            className="truncate flex-grow"
          >
            {recipe.title || 'Untitled Recipe'}
          </span>
          {/* Delete and Edit buttons removed as mutations are handled elsewhere */}
        </li>
      ))}
    </ul>
  );
}