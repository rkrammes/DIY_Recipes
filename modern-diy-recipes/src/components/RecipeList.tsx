import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from '@/components/ui/input';
import { ConnectionErrorDisplay } from './ConnectionErrorDisplay';
import { supabase } from '@/lib/supabase';

interface RecipeListItem {
  id: string;
  title: string;
}

interface ErrorData {
  error: string;
  details?: any;
  code?: string;
}

interface RecipeListProps {
  initialRecipes: RecipeListItem[] | null;
  initialError?: ErrorData | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function RecipeList({ 
  initialRecipes, 
  initialError,
  selectedId, 
  onSelect 
}: RecipeListProps) {
  const router = useRouter();
  const [recipes, setRecipes] = useState<RecipeListItem[] | null>(initialRecipes);
  const [error, setError] = useState<ErrorData | null>(initialError || null);
  const [loading, setLoading] = useState(false);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(selectedId);

  // Function to retry fetching recipes from Supabase
  const retryFetchRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch from Supabase
      const { data, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      setRecipes(data);
    } catch (err: any) {
      setError({
        error: 'Failed to fetch recipes',
        details: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Show a loading state if we're retrying
  if (loading) {
    return (
      <div className="w-full sm:w-64 md:w-72 border-r border-subtle p-4 bg-surface text-text">
        <div className="animate-pulse">
          <div className="h-6 bg-surface-2 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-surface-2 rounded w-1/2 mb-4"></div>
          <div className="h-6 bg-surface-2 rounded w-5/6 mb-4"></div>
          <div className="h-6 bg-surface-2 rounded w-2/3 mb-4"></div>
        </div>
      </div>
    );
  }

  // Show error state with retry button
  if (error) {
    return (
      <div className="w-full sm:w-64 md:w-72 border-r border-subtle p-4 bg-surface text-text">
        <ConnectionErrorDisplay error={error} retryAction={retryFetchRecipes} />
      </div>
    );
  }

  // No recipes to show (could be empty array or null)
  if (!recipes || recipes.length === 0) {
    return (
      <div className="w-full sm:w-64 md:w-72 border-r border-subtle p-4 bg-surface text-text">
        <p className="text-text-secondary text-sm">No formulations found.</p>
        
        {/* Hidden data for tests */}
        <div style={{ display: 'none' }} data-testid="recipes-debug-info">
          No recipes
        </div>
      </div>
    );
  }

  // Debug information
  console.log('Rendering RecipeList with:', { 
    recipeCount: recipes.length, 
    firstRecipe: recipes[0]
  });

  // Show the recipe list
  return (
    <ul 
      className="w-full sm:w-64 md:w-72 border-r border-subtle overflow-y-auto h-full bg-surface text-text"
    >
      {recipes.map((recipe: RecipeListItem) => {
        // Ensure we have a valid recipe object with at least an id
        if (!recipe || !recipe.id) {
          console.warn("Invalid recipe object:", recipe);
          return null;
        }
        
        return (
          <li
            key={recipe.id}
            data-testid="recipe-card"
            onClick={() => {
              try {
                // If clicking on the same recipe again, trigger a refresh by briefly
                // setting to null and then back to the ID
                if (selectedId === recipe.id) {
                  console.log(`Re-selecting same recipe: ${recipe.id} - will force refresh`);
                  onSelect(null);
                  
                  // Brief delay to ensure state updates properly
                  setTimeout(() => {
                    onSelect(recipe.id);
                    setLastSelectedId(recipe.id);
                  }, 50);
                } else {
                  console.log(`Selecting recipe: ${recipe.id}`);
                  onSelect(recipe.id);
                  setLastSelectedId(recipe.id);
                  router.push(`/recipes/${recipe.id}`);
                }
              } catch (error) {
                console.error(`Navigation error: ${error}`);
              }
            }}
            className={`flex justify-between items-center cursor-pointer px-4 py-2 transition-colors duration-150 hover:bg-surface-1 border-b border-subtle ${
              selectedId === recipe.id ? 'bg-accent text-text-inverse font-semibold' : 'bg-surface-1'
            }`}
            aria-current={selectedId === recipe.id ? 'page' : undefined}
          >
            <span className="truncate flex-grow" data-testid="recipe-title">
              {recipe.title || 'Untitled Recipe'}
            </span>
            
            {selectedId === recipe.id && (
              <span className="ml-2 text-xs opacity-70">
                ⟳
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}