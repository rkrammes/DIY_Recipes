'use client';

import React, { useState, useEffect } from 'react';
import { useSupabaseMcp } from '@/hooks/useSupabaseMcp';
import SupabaseMcpDebugger from '@/components/SupabaseMcpDebugger';
import RecipeDetails from '@/components/RecipeDetails';
import { Recipe } from '@/types/models';

export default function RecipeMcpDiagnosticsPage() {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [recipeData, setRecipeData] = useState<Recipe | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Diagnostic tool ready. Select a recipe to diagnose display issues.');
  const { 
    isConnected, 
    connect, 
    executeQuery, 
    fetchRecipeById 
  } = useSupabaseMcp();

  useEffect(() => {
    // Connect to Supabase MCP on component mount
    if (!isConnected) {
      connect().catch(err => {
        console.error("Failed to connect to Supabase MCP:", err);
        setDebugInfo(`Failed to connect to Supabase MCP: ${err instanceof Error ? err.message : String(err)}`);
      });
    }
  }, [isConnected, connect]);

  // Handle recipe selection
  const handleRecipeSelect = async (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setDebugInfo(`Selected recipe ID: ${recipeId}. Fetching data...`);
    
    try {
      // First fetch the recipe data directly via MCP
      const recipe = await fetchRecipeById(recipeId);
      if (recipe) {
        setRecipeData(recipe);
        setDebugInfo(`Successfully fetched recipe from Supabase MCP: ${recipe.title}`);
        
        // Now run a diagnostic query to check recipe-ingredients relationship
        const ingredientsResult = await executeQuery(`
          SELECT 
            ri.id as junction_id,
            ri.quantity,
            ri.unit,
            ing.id as ingredient_id,
            ing.name as ingredient_name,
            ing.description as ingredient_description
          FROM 
            recipe_ingredients ri
          LEFT JOIN 
            ingredients ing ON ri.ingredient_id = ing.id
          WHERE 
            ri.recipe_id = '${recipeId}'
        `);
        
        setDebugInfo(prev => `${prev}
          
Recipe has ${ingredientsResult?.length || 0} ingredients in database.
Diagnostic: ${ingredientsResult && ingredientsResult.length > 0 
  ? 'Recipe ingredients found in database' 
  : 'No ingredients found for this recipe'}`);
      } else {
        setDebugInfo(`No recipe found with ID: ${recipeId}`);
        setRecipeData(null);
      }
    } catch (err) {
      console.error(`Error fetching recipe ${recipeId}:`, err);
      setDebugInfo(`Error fetching recipe ${recipeId}: ${err instanceof Error ? err.message : String(err)}`);
      setRecipeData(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface p-6">
      <h1 className="text-3xl font-bold mb-6 pb-2 border-b border-border-subtle">
        Recipe MCP Diagnostics
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - SupabaseMcpDebugger */}
        <div>
          <h2 className="text-xl font-bold mb-4">Database Diagnostics</h2>
          <div className="mb-4 bg-surface-1 border border-border-subtle rounded-lg">
            <SupabaseMcpDebugger />
          </div>
        </div>
        
        {/* Right column - Recipe display and diagnostics */}
        <div>
          <h2 className="text-xl font-bold mb-4">Recipe Display Diagnostics</h2>
          
          {/* Debug information */}
          <div className="mb-4 p-4 bg-surface-1 border border-border-subtle rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Diagnostic Info</h3>
            <pre className="whitespace-pre-wrap text-sm font-mono p-2 bg-surface-2 rounded-md">
              {debugInfo}
            </pre>
          </div>
          
          {/* Recipe component being tested */}
          <div className="border border-border-subtle rounded-lg">
            <h3 className="text-lg font-semibold p-4 bg-surface-1 border-b border-border-subtle">
              Recipe Component Test
            </h3>
            <div className="p-4 bg-surface">
              {selectedRecipeId ? (
                <RecipeDetails 
                  key={`recipe-test-${selectedRecipeId}-${Date.now()}`}
                  recipeId={selectedRecipeId}
                  initialRecipeData={recipeData ? {
                    ...recipeData,
                    ingredients: [],
                    iterations: []
                  } : null}
                />
              ) : (
                <div className="p-4 text-center text-text-secondary">
                  Select a recipe from the database diagnostics panel to test display
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}