"use client";  // Mark as Client Component

import React, { useState, useEffect } from "react";
import RecipeList from "../components/RecipeList";
import RecipeDetails from "../components/RecipeDetails";
import dynamic from 'next/dynamic';
// Note: createClient and cookies from next/headers are problematic in Client Components.
// Data fetching logic needs adjustment. For now, commenting out direct Supabase/cookie usage here.
// import { createClient } from '../lib/supabaseServer';
// import { cookies } from 'next/headers';
import type { Recipe } from '../types/models';

const SettingsPanel = dynamic(() => import("../components/SettingsPanel"), { ssr: false });

// Placeholder function for fetching data client-side or via API routes
// This avoids direct server-side imports in a Client Component
async function clientSideFetch(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error fetching ${url}: ${res.statusText}`);
  }
  return res.json();
}


export default function Home() {
  // Removed direct usage of cookies() and server-side Supabase client creation

  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [initialRecipeDetails, setInitialRecipeDetails] = useState<any>(null);
  const [recipesError, setRecipesError] = useState<string | null>(null);
  const [recipeDetailsError, setRecipeDetailsError] = useState<string | null>(null);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);


  useEffect(() => {
    console.log('Home component mounted - Fetching recipes'); // Log for diagnosis
    async function fetchData() {
      setLoadingRecipes(true);
      try {
        // Fetch recipes via an API route instead of direct server-side logic
        const data = await clientSideFetch('/api/recipes');
        setRecipes(data);
        if (data && data.length > 0) {
          // Select the first recipe initially
          setSelectedId(data[0].id);
        } else {
           setSelectedId(null); // No recipes found
        }
        setRecipesError(null);
      } catch (error: any) {
        console.error("Error fetching recipes:", error);
        setRecipesError(error.message || 'Failed to load recipes');
        setRecipes(null);
        setSelectedId(null);
      } finally {
         setLoadingRecipes(false);
      }
    }
    fetchData();
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    if (selectedId) {
      console.log(`Fetching details for recipe ID: ${selectedId}`); // Log for diagnosis
      async function fetchRecipeDetails() {
        setLoadingDetails(true);
        setInitialRecipeDetails(null); // Clear previous details
        setRecipeDetailsError(null);
        try {
          // Fetch details via an API route
          const data = await clientSideFetch(`/api/recipes/${selectedId}?include=iterations,ingredients`);
          setInitialRecipeDetails(data);
        } catch (error: any) {
          console.error(`Error fetching details for recipe ${selectedId}:`, error);
          setRecipeDetailsError(error.message || `Failed to load details for recipe ${selectedId}`);
          setInitialRecipeDetails(null);
        } finally {
          setLoadingDetails(false);
        }
      }
      fetchRecipeDetails();
    } else {
      // Clear details if no recipe is selected
      setInitialRecipeDetails(null);
      setRecipeDetailsError(null);
      setLoadingDetails(false);
    }
  }, [selectedId]); // Re-run when selectedId changes

  if (loadingRecipes) return <div className="p-4 text-text">Loading recipes...</div>;
  if (recipesError) return <div className="p-4 text-alert-red">Error loading recipes: {recipesError}</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <div className="flex-shrink-0 w-64 border-r border-subtle overflow-y-auto">
        <RecipeList
          initialRecipes={recipes || []}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <main className="flex-1 overflow-y-auto p-4">
        {loadingDetails && <div className="text-text">Loading recipe details...</div>}
        {recipeDetailsError && <div className="text-alert-red">Error loading recipe details: {recipeDetailsError}</div>}
        {selectedId && !loadingDetails && !recipeDetailsError && (
          <RecipeDetails
            recipeId={selectedId}
          />
        )}
        {!selectedId && !loadingRecipes && !recipesError && (
          <div className="p-4 text-text-secondary">Select a recipe to view details.</div>
        )}
      </main>

      <div className="flex-shrink-0 w-64 border-l border-subtle overflow-y-auto">
        <SettingsPanel />
      </div>
    </div>
  );
}
