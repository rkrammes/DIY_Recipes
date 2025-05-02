import React, { useState } from "react";
import RecipeList from "../components/RecipeList";
import RecipeDetails from "../components/RecipeDetails";
import dynamic from 'next/dynamic';
import { createClient } from '../lib/supabaseServer'; // Import createClient
import { cookies } from 'next/headers'; // Import cookies
import type { Recipe } from '../types/models'; // Import Recipe type

const SettingsPanel = dynamic(() => import("../components/SettingsPanel"), { ssr: false });

export default async function Home() { // Make component async
  const cookieStore = cookies();
  const supabase = createClient(cookieStore); // Create Supabase client

  const { data: recipes, error: recipesError } = await supabase // Fetch recipes server-side
    .from('recipes')
    .select('*');

  const initialRecipeId = recipes?.[0]?.id || null; // Get ID of the first recipe
  const [selectedId, setSelectedId] = useState<string | null>(initialRecipeId); // Initialize selectedId with the first recipe's ID

  let initialRecipeDetails = null;
  let recipeDetailsError = null;

  if (selectedId) {
    const { data, error } = await supabase // Fetch details for the initial recipe server-side
      .from('recipes')
      .select('*, ingredients:recipe_ingredients(*, ingredient:ingredients(*)), iterations:recipe_iterations(*)')
      .eq('id', selectedId)
      .single();

    initialRecipeDetails = data;
    recipeDetailsError = error;
  }


  if (recipesError) return <div className="p-4 text-red-500">Error loading recipes: {recipesError.message}</div>; // Handle recipes error
  if (recipeDetailsError) return <div className="p-4 text-red-500">Error loading recipe details: {recipeDetailsError.message}</div>; // Handle recipe details error


  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-shrink-0 w-64 border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
        <RecipeList
          initialRecipes={recipes as Recipe[] || []} // Pass fetched recipes
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <main className="flex-1 overflow-y-auto">
        <RecipeDetails
          recipeId={selectedId}
          initialRecipeData={initialRecipeDetails} // Pass initial recipe details
        />
      </main>

      <div className="flex-shrink-0 w-64 border-l border-gray-300 dark:border-gray-700 overflow-y-auto">
        <SettingsPanel />
      </div>
    </div>
  );
}
