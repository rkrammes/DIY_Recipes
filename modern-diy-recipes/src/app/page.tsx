"use client";
import React, { useState } from "react";
import RecipeList from "../components/RecipeList";
import RecipeDetails from "../components/RecipeDetails";
import dynamic from 'next/dynamic';
import { useRecipes } from '../hooks/useRecipes'; // Import useRecipes hook
import type { Recipe } from '@/types/models';

const SettingsPanel = dynamic(() => import("../components/SettingsPanel"), { ssr: false });

// Remove getRecipes function

export default function Home() {
  const { recipes, loading, error, deleteRecipe, updateRecipe } = useRecipes(); // Use useRecipes hook
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Remove useEffect for fetching recipes

  if (loading) return <div className="p-4">Loading recipes...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading recipes: {error}</div>;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-shrink-0 w-64 border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
        <RecipeList
          initialRecipes={recipes} // Use recipes from hook
          selectedId={selectedId}
          onSelect={setSelectedId}
          deleteRecipe={deleteRecipe} // Use deleteRecipe from hook
          updateRecipe={updateRecipe} // Use updateRecipe from hook
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
