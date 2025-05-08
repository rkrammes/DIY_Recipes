"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface RecipeDetailInTerminalProps {
  recipeId: string | null;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  instructions: string;
  created_at: string;
  updated_at: string;
}

interface Ingredient {
  id: string;
  name: string;
  description: string;
  quantity: string;
  unit: string;
}

export default function RecipeDetailInTerminal({ recipeId }: RecipeDetailInTerminalProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when recipeId changes
    setRecipe(null);
    setIngredients([]);
    setLoading(true);
    setError(null);

    if (!recipeId) {
      setLoading(false);
      return;
    }

    const fetchRecipeDetails = async () => {
      try {
        // Fetch recipe details
        const { data: recipeData, error: recipeError } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', recipeId)
          .single();

        if (recipeError) {
          throw new Error(`Error fetching recipe: ${recipeError.message}`);
        }

        if (!recipeData) {
          throw new Error(`Recipe with ID ${recipeId} not found`);
        }

        setRecipe(recipeData);

        // Fetch recipe ingredients with their details
        const { data: ingredientsData, error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .select(`
            quantity, 
            unit,
            ingredients:ingredient_id(id, name, description)
          `)
          .eq('recipe_id', recipeId);

        if (ingredientsError) {
          throw new Error(`Error fetching ingredients: ${ingredientsError.message}`);
        }

        // Transform the joined data
        const formattedIngredients = ingredientsData.map(item => ({
          id: item.ingredients.id,
          name: item.ingredients.name,
          description: item.ingredients.description,
          quantity: item.quantity,
          unit: item.unit
        }));

        setIngredients(formattedIngredients);
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchRecipeDetails:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [recipeId]);

  if (!recipeId) {
    return (
      <div className="p-4">
        <div className="bg-surface-1 border border-border-subtle rounded p-4">
          <h2 className="text-xl font-mono text-accent mb-3">NO FORMULATION SELECTED</h2>
          <p className="text-text-secondary">
            Select a formulation from the list to view its details.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="bg-surface-1 border border-border-subtle rounded p-4">
          <h2 className="text-xl font-mono text-accent mb-3">LOADING FORMULATION...</h2>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-accent animate-pulse"></div>
            <div className="text-text-secondary">Fetching data from database</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-surface-1 border border-border-subtle rounded p-4">
          <h2 className="text-xl font-mono text-red-500 mb-3">ERROR LOADING FORMULATION</h2>
          <div className="bg-red-500/10 border border-red-500 p-3 rounded">
            <p className="text-red-500">{error}</p>
          </div>
          <div className="mt-4 text-text-secondary">
            <p>Possible causes:</p>
            <ul className="list-disc ml-5 mt-2">
              <li>The formulation with ID {recipeId} does not exist</li>
              <li>Database connection issue</li>
              <li>Insufficient permissions to access the data</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="p-4">
        <div className="bg-surface-1 border border-border-subtle rounded p-4">
          <h2 className="text-xl font-mono text-red-500 mb-3">FORMULATION NOT FOUND</h2>
          <p className="text-text-secondary">
            The requested formulation (ID: {recipeId}) could not be found in the database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-surface-1 border border-border-subtle rounded p-4">
        <h2 className="text-xl font-mono text-accent mb-3">{recipe.title.toUpperCase()}</h2>
        
        <div className="mb-4 border-b border-border-subtle pb-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex">
              <span className="text-text-secondary w-24">ID:</span>
              <span className="font-mono">{recipe.id}</span>
            </div>
            <div className="flex">
              <span className="text-text-secondary w-24">CREATED:</span>
              <span className="font-mono">{new Date(recipe.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex">
              <span className="text-text-secondary w-24">UPDATED:</span>
              <span className="font-mono">{new Date(recipe.updated_at).toLocaleDateString()}</span>
            </div>
            <div className="flex">
              <span className="text-text-secondary w-24">STATUS:</span>
              <span className="font-mono text-green-500">ACTIVE</span>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg text-accent mb-2 font-mono">DESCRIPTION</h3>
          <p className="text-text-secondary mb-2">
            {recipe.description || 'No description available.'}
          </p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg text-accent mb-2 font-mono">INSTRUCTIONS</h3>
          <div className="bg-surface-2 p-3 border border-border-subtle">
            <p className="text-text-secondary whitespace-pre-wrap">
              {recipe.instructions || 'No instructions available.'}
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg text-accent mb-2 font-mono">INGREDIENTS</h3>
          {ingredients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full bg-surface-2 text-sm">
                <thead className="bg-surface-3">
                  <tr>
                    <th className="p-2 text-left">NAME</th>
                    <th className="p-2 text-left">QUANTITY</th>
                    <th className="p-2 text-left">DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ingredient, index) => (
                    <tr key={ingredient.id} className={index % 2 === 0 ? 'bg-surface-2' : 'bg-surface-1'}>
                      <td className="p-2 font-mono">{ingredient.name}</td>
                      <td className="p-2 font-mono">{ingredient.quantity} {ingredient.unit}</td>
                      <td className="p-2 text-text-secondary">{ingredient.description || 'No description'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-secondary">No ingredients found for this formulation.</p>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border-subtle">
          <div className="flex justify-between items-center">
            <div className="text-text-secondary text-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              Formulation loaded successfully
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-surface-2 border border-border-subtle text-text-secondary hover:bg-surface-3 text-xs">
                [EDIT]
              </button>
              <button className="px-3 py-1 bg-accent text-white text-xs">
                [SAVE]
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* System Log */}
      <div className="mt-4 bg-surface-1 border border-border-subtle rounded p-2">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm text-accent font-mono">SYSTEM LOG</h4>
          <div className="text-green-500 text-xs animate-pulse">● LIVE</div>
        </div>
        <div className="h-24 overflow-y-auto bg-surface-2 p-2 font-mono text-[10px] leading-tight">
          <div className="text-text-secondary">[{new Date().toLocaleTimeString()}] Formulation ID: {recipe.id} loaded</div>
          <div className="text-text-secondary">[{new Date().toLocaleTimeString()}] Parsing formulation structure</div>
          <div className="text-green-500">[{new Date().toLocaleTimeString()}] Verified formulation integrity</div>
          <div className="text-text-secondary">[{new Date().toLocaleTimeString()}] Loaded {ingredients.length} ingredients</div>
          <div className="text-accent">[{new Date().toLocaleTimeString()}] Rendering formulation view</div>
          <div className="text-amber-500">[{new Date().toLocaleTimeString()}] Formulation ready for interaction</div>
          <div className="text-text-secondary">[{new Date().toLocaleTimeString()}] Monitoring changes</div>
          <div className="text-purple-500">[{new Date().toLocaleTimeString()}] Background processes running</div>
          <div className="text-green-500">[{new Date().toLocaleTimeString()}] All systems nominal</div>
          <div className="text-amber-500 animate-pulse">[{new Date().toLocaleTimeString()}] Awaiting user input _</div>
        </div>
      </div>
    </div>
  );
}