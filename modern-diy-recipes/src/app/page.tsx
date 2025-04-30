"use client";
import React, { useState, useEffect } from "react"; // Add useEffect
import RecipeList from "../components/RecipeList";
import RecipeDetails from "../components/RecipeDetails";
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import type { Recipe } from '@/types/models';

const SettingsPanel = dynamic(() => import("../components/SettingsPanel"), { ssr: false });

async function getRecipes(): Promise<Pick<Recipe, 'id' | 'title'>[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, title') // Fetch only necessary fields for the list
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }

  return data || [];
}

// Remove async from here
export default function Home() {
  const [recipes, setRecipes] = useState<Pick<Recipe, 'id' | 'title'>[]>([]); // Add recipes state
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      const fetchedRecipes = await getRecipes();
      setRecipes(fetchedRecipes);
    };
    fetchRecipes();
  }, []); // Empty dependency array to run once on mount

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-shrink-0 w-64 border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
        <RecipeList
          initialRecipes={recipes} // Use recipes from state
          selectedId={selectedId}
          onSelect={setSelectedId}
          // deleteRecipe and updateRecipe should be handled in client components or hooks
          deleteRecipe={async () => {}}
          updateRecipe={async () => {}}
        />
      </div>

      <main className="flex-1 overflow-y-auto">
        <RecipeDetails recipeId={selectedId} />
      </main>

      <div className="flex-shrink-0 w-64 border-l border-gray-300 dark:border-gray-700 overflow-y-auto">
        <SettingsPanel />
      </div>
    </div>
  );
}
