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
  deleteRecipe: (id: string) => Promise<void>;
  updateRecipe: (id: string, updates: { title: string }) => Promise<UpdatedRecipeResult>; // Change any to UpdatedRecipeResult
}

export default function RecipeList({ initialRecipes, selectedId, onSelect, deleteRecipe, updateRecipe }: RecipeListProps) {
  const router = useRouter(); // Initialize useRouter
  const [recipes, setRecipes] = useState<RecipeListItem[]>(initialRecipes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Select text for easy replacement
    }
  }, [editingId]);


  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering the li onClick
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(id);
        // Update local state after successful deletion
        setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== id));
        // Optionally: If the deleted recipe was selected, clear the selection
        if (selectedId === id) {
           onSelect(null); // Or handle as needed
         }
      } catch (err) {
        console.error('Failed to delete recipe:', err);
        // Handle error display to the user if necessary
        alert('Failed to delete recipe.');
      }
    }
  };


  const handleStartEdit = (e: React.MouseEvent, recipe: RecipeListItem) => {
    e.stopPropagation();
    setEditingId(recipe.id);
    setTempTitle(recipe.title || '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempTitle(e.target.value);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTempTitle('');
  };

  const handleSaveTitle = async (id: string) => {
    if (tempTitle.trim() === '') {
      // Optionally handle empty title case, maybe revert or show error
      handleCancelEdit();
      return;
    }
    try {
      const updatedRecipe = await updateRecipe(id, { title: tempTitle });
      // Update local state with the confirmed data from the server
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.id === id ? { ...recipe, title: updatedRecipe.title } : recipe
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update title:', err);
      alert('Failed to update recipe title.');
      // Optionally revert tempTitle or keep editing state
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => { // Added explicit type for 'e'
    if (e.key === 'Enter') {
      handleSaveTitle(id);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };


  // No loading or error state needed here as data is fetched on the server
  // if (loading) return <div>Loading recipes...</div>;
  // if (error) return <div>Error loading recipes: {error}</div>;

  return (
    <ul className="w-full sm:w-64 md:w-72 border-r border-[var(--border-subtle)] overflow-y-auto h-full bg-[var(--surface-0)] text-[var(--text-primary)]"> {/* Responsive width and ensure full height, added theme styles */}
      {recipes.map((recipe: RecipeListItem) => (
        <li
          key={recipe.id}
          onClick={() => {
            if (!editingId) {
              onSelect(recipe.id); // Still keep onSelect for state management on the main page
              router.push(`/recipes/${recipe.id}`); // Navigate to the recipe details page
            }
          }} // Prevent selection and navigation when editing
          className={`flex justify-between items-center cursor-pointer px-4 py-2 transition-colors duration-150 hover:bg-[var(--surface-1)] ${ // Added transition
            selectedId === recipe.id && !editingId ? 'bg-[var(--accent)] text-[var(--text-inverse)] font-semibold' : '' // Use accent for selected
          }`}
          aria-current={selectedId === recipe.id ? 'page' : undefined}
        >
          {editingId === recipe.id ? (
            <Input
              ref={inputRef}
              type="text"
              value={tempTitle}
              onChange={handleTitleChange}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, recipe.id)} // Ensure type is applied correctly
              onBlur={() => handleSaveTitle(recipe.id)} // Save on blur
              className="flex-grow mr-2 h-8 bg-[var(--surface-1)] text-[var(--text-primary)] border-[var(--border-subtle)]" // Adjust styling, added theme styles
              aria-label="Edit recipe title"
            />
          ) : (
            <span
              className="truncate flex-grow"
              onDoubleClick={(e) => handleStartEdit(e, recipe)} // Start edit on double click
              title="Double-click to edit title" // Tooltip hint
            >
              {recipe.title || 'Untitled Recipe'}
            </span>
          )}
          <div className="flex-shrink-0">
            {/* Optionally add an edit button as well/instead of double-click */}
            {/* <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={(e) => handleStartEdit(e, recipe)} aria-label={`Edit recipe ${recipe.title || 'Untitled Recipe'}`}>✏️</Button> */}
            <Button
               variant="ghost"
               size="sm"
               className="ml-1 p-1 h-auto text-[var(--text-secondary)] hover:text-[var(--error)]" // Adjusted margin, added theme styles
               onClick={(e) => handleDelete(e, recipe.id)}
               aria-label={`Delete recipe ${recipe.title || 'Untitled Recipe'}`}
               disabled={!!editingId} // Disable delete while editing
             >
               🗑️
             </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}