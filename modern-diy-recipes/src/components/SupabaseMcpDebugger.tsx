/**
 * Supabase MCP Debugger Component
 * 
 * This component provides a direct connection to the Supabase MCP server
 * to help diagnose and debug database access issues.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSupabaseMcp } from '../hooks/useSupabaseMcp';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  user_id?: string;
  [key: string]: any;
}

interface Ingredient {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  [key: string]: any;
}

interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  created_at: string;
  [key: string]: any;
}

export default function SupabaseMcpDebugger() {
  const { 
    adapter, 
    isConnected, 
    isLoading, 
    error, 
    connect, 
    disconnect,
    executeQuery
  } = useSupabaseMcp();
  
  const [activeTab, setActiveTab] = useState<'recipes' | 'ingredients' | 'junctions' | 'query'>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [sqlQuery, setSqlQuery] = useState<string>("SELECT * FROM recipes LIMIT 10");
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [recipeDetails, setRecipeDetails] = useState<any | null>(null);
  
  // Connect to MCP on mount
  useEffect(() => {
    if (!isConnected && !isLoading) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect, isConnected, isLoading]);
  
  // Fetch data when connected
  useEffect(() => {
    if (isConnected && !isLoading) {
      fetchData();
    }
  }, [isConnected, isLoading]);
  
  // Fetch data for the active tab
  const fetchData = async () => {
    try {
      if (!isConnected) {
        await connect();
      }
      
      // Fetch recipes
      const recipesData = await executeQuery("SELECT * FROM recipes ORDER BY created_at DESC LIMIT 50");
      setRecipes(recipesData || []);
      
      // Fetch ingredients
      const ingredientsData = await executeQuery("SELECT * FROM ingredients ORDER BY name ASC LIMIT 100");
      setIngredients(ingredientsData || []);
      
      // Fetch recipe ingredients
      const recipeIngredientsData = await executeQuery("SELECT * FROM recipe_ingredients LIMIT 100");
      setRecipeIngredients(recipeIngredientsData || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };
  
  // Execute a custom SQL query
  const handleExecuteQuery = async () => {
    try {
      setQueryError(null);
      setQueryResult([]);
      
      if (!isConnected) {
        await connect();
      }
      
      const result = await executeQuery(sqlQuery);
      setQueryResult(result || []);
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : String(err));
    }
  };
  
  // Get recipe details with ingredients
  const fetchRecipeDetails = async (recipeId: string) => {
    try {
      setRecipeDetails(null);
      setSelectedRecipeId(recipeId);
      
      if (!isConnected) {
        await connect();
      }
      
      // Get recipe data
      const recipeData = await executeQuery(`
        SELECT * FROM recipes WHERE id = '${recipeId}' LIMIT 1
      `);
      
      if (!recipeData || recipeData.length === 0) {
        throw new Error(`Recipe with ID ${recipeId} not found`);
      }
      
      const recipe = recipeData[0];
      
      // Get recipe ingredients
      const recipeIngredientsData = await executeQuery(`
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
      
      // Combine the data
      setRecipeDetails({
        ...recipe,
        ingredients: recipeIngredientsData || []
      });
    } catch (err) {
      console.error(`Failed to fetch recipe details for ${recipeId}:`, err);
      setRecipeDetails({ error: err instanceof Error ? err.message : String(err) });
    }
  };
  
  return (
    <div className="p-4 bg-surface border border-border-subtle rounded-lg">
      <h2 className="text-xl font-bold mb-4">Supabase MCP Debugger</h2>
      
      {/* Connection Status */}
      <div className="mb-4 p-2 bg-surface-1 rounded border border-border-subtle">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="font-medium">Status: {isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div>
            <button
              onClick={isConnected ? disconnect : connect}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-accent text-white rounded hover:bg-accent-hover disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : isConnected ? 'Disconnect' : 'Connect'}
            </button>
            <button
              onClick={fetchData}
              disabled={!isConnected || isLoading}
              className="ml-2 px-3 py-1 text-sm bg-surface-2 rounded hover:bg-surface-3 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>
        {error && (
          <div className="text-red-500 text-sm mt-1">{error}</div>
        )}
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-border-subtle mb-4">
        <button
          className={`px-4 py-2 text-sm ${activeTab === 'recipes' ? 'border-b-2 border-accent font-medium' : ''}`}
          onClick={() => setActiveTab('recipes')}
        >
          Recipes
        </button>
        <button
          className={`px-4 py-2 text-sm ${activeTab === 'ingredients' ? 'border-b-2 border-accent font-medium' : ''}`}
          onClick={() => setActiveTab('ingredients')}
        >
          Ingredients
        </button>
        <button
          className={`px-4 py-2 text-sm ${activeTab === 'junctions' ? 'border-b-2 border-accent font-medium' : ''}`}
          onClick={() => setActiveTab('junctions')}
        >
          Recipe Ingredients
        </button>
        <button
          className={`px-4 py-2 text-sm ${activeTab === 'query' ? 'border-b-2 border-accent font-medium' : ''}`}
          onClick={() => setActiveTab('query')}
        >
          Custom Query
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="mb-4">
        {activeTab === 'recipes' && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Recipes ({recipes.length})</h3>
            {recipes.length === 0 ? (
              <p className="text-text-secondary">No recipes found in the database.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-border-subtle text-sm">
                  <thead>
                    <tr className="bg-surface-1">
                      <th className="border border-border-subtle px-2 py-1">ID</th>
                      <th className="border border-border-subtle px-2 py-1">Title</th>
                      <th className="border border-border-subtle px-2 py-1">Description</th>
                      <th className="border border-border-subtle px-2 py-1">Created</th>
                      <th className="border border-border-subtle px-2 py-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipes.map((recipe) => (
                      <tr key={recipe.id} className="hover:bg-surface-1">
                        <td className="border border-border-subtle px-2 py-1 text-xs font-mono">
                          {recipe.id.substring(0, 8)}...
                        </td>
                        <td className="border border-border-subtle px-2 py-1">
                          {recipe.title}
                        </td>
                        <td className="border border-border-subtle px-2 py-1 text-text-secondary">
                          {recipe.description?.substring(0, 50) || 'N/A'}
                        </td>
                        <td className="border border-border-subtle px-2 py-1 text-xs">
                          {new Date(recipe.created_at).toLocaleString()}
                        </td>
                        <td className="border border-border-subtle px-2 py-1">
                          <button
                            onClick={() => fetchRecipeDetails(recipe.id)}
                            className="px-2 py-1 text-xs bg-accent text-white rounded hover:bg-accent-hover"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'ingredients' && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Ingredients ({ingredients.length})</h3>
            {ingredients.length === 0 ? (
              <p className="text-text-secondary">No ingredients found in the database.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-border-subtle text-sm">
                  <thead>
                    <tr className="bg-surface-1">
                      <th className="border border-border-subtle px-2 py-1">ID</th>
                      <th className="border border-border-subtle px-2 py-1">Name</th>
                      <th className="border border-border-subtle px-2 py-1">Description</th>
                      <th className="border border-border-subtle px-2 py-1">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ingredient) => (
                      <tr key={ingredient.id} className="hover:bg-surface-1">
                        <td className="border border-border-subtle px-2 py-1 text-xs font-mono">
                          {ingredient.id.substring(0, 8)}...
                        </td>
                        <td className="border border-border-subtle px-2 py-1">
                          {ingredient.name}
                        </td>
                        <td className="border border-border-subtle px-2 py-1 text-text-secondary">
                          {ingredient.description?.substring(0, 50) || 'N/A'}
                        </td>
                        <td className="border border-border-subtle px-2 py-1 text-xs">
                          {new Date(ingredient.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'junctions' && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Recipe Ingredients ({recipeIngredients.length})</h3>
            {recipeIngredients.length === 0 ? (
              <p className="text-text-secondary">No recipe ingredients found in the database.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-border-subtle text-sm">
                  <thead>
                    <tr className="bg-surface-1">
                      <th className="border border-border-subtle px-2 py-1">ID</th>
                      <th className="border border-border-subtle px-2 py-1">Recipe ID</th>
                      <th className="border border-border-subtle px-2 py-1">Ingredient ID</th>
                      <th className="border border-border-subtle px-2 py-1">Quantity</th>
                      <th className="border border-border-subtle px-2 py-1">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipeIngredients.map((junction) => (
                      <tr key={junction.id} className="hover:bg-surface-1">
                        <td className="border border-border-subtle px-2 py-1 text-xs font-mono">
                          {junction.id.substring(0, 8)}...
                        </td>
                        <td className="border border-border-subtle px-2 py-1 text-xs font-mono">
                          {junction.recipe_id.substring(0, 8)}...
                        </td>
                        <td className="border border-border-subtle px-2 py-1 text-xs font-mono">
                          {junction.ingredient_id.substring(0, 8)}...
                        </td>
                        <td className="border border-border-subtle px-2 py-1">
                          {junction.quantity}
                        </td>
                        <td className="border border-border-subtle px-2 py-1">
                          {junction.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'query' && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Custom SQL Query</h3>
            <div className="mb-3">
              <textarea
                className="w-full h-24 p-2 font-mono text-sm bg-surface-0 border border-border-subtle rounded"
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <button
                onClick={handleExecuteQuery}
                disabled={!isConnected || isLoading}
                className="px-3 py-1 bg-accent text-white rounded hover:bg-accent-hover disabled:opacity-50"
              >
                Execute Query
              </button>
            </div>
            {queryError && (
              <div className="p-2 mb-3 bg-red-100 border border-red-200 rounded text-red-800 text-sm">
                {queryError}
              </div>
            )}
            {queryResult.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-border-subtle text-sm">
                  <thead>
                    <tr className="bg-surface-1">
                      {Object.keys(queryResult[0]).map((key) => (
                        <th key={key} className="border border-border-subtle px-2 py-1">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-surface-1">
                        {Object.entries(row).map(([key, value]) => (
                          <td key={key} className="border border-border-subtle px-2 py-1">
                            {typeof value === 'string' && value.length > 50
                              ? value.substring(0, 50) + '...'
                              : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Recipe Details */}
      {selectedRecipeId && recipeDetails && (
        <div className="mt-6 p-3 border border-border-subtle rounded-lg bg-surface-1">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Recipe Details</h3>
            <button
              onClick={() => setSelectedRecipeId(null)}
              className="text-xs px-2 py-1 bg-surface-2 rounded hover:bg-surface-3"
            >
              Close
            </button>
          </div>
          
          {recipeDetails.error ? (
            <div className="p-2 bg-red-100 border border-red-200 rounded text-red-800 text-sm">
              {recipeDetails.error}
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <h4 className="text-base font-medium">{recipeDetails.title}</h4>
                <p className="text-sm text-text-secondary">{recipeDetails.description || 'No description'}</p>
                <div className="mt-2 text-xs">
                  <div>Created: {new Date(recipeDetails.created_at).toLocaleString()}</div>
                  <div>ID: {recipeDetails.id}</div>
                  <div>User ID: {recipeDetails.user_id || 'N/A'}</div>
                </div>
              </div>
              
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2">Ingredients ({recipeDetails.ingredients?.length || 0})</h5>
                {!recipeDetails.ingredients || recipeDetails.ingredients.length === 0 ? (
                  <p className="text-sm text-text-secondary">No ingredients found for this recipe.</p>
                ) : (
                  <table className="min-w-full border border-border-subtle text-sm">
                    <thead>
                      <tr className="bg-surface-2">
                        <th className="border border-border-subtle px-2 py-1">Name</th>
                        <th className="border border-border-subtle px-2 py-1">Quantity</th>
                        <th className="border border-border-subtle px-2 py-1">Unit</th>
                        <th className="border border-border-subtle px-2 py-1">Ingredient ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipeDetails.ingredients.map((ing, idx) => (
                        <tr key={idx} className="even:bg-surface odd:bg-surface-1">
                          <td className="border border-border-subtle px-2 py-1">
                            {ing.ingredient_name || 'Unknown'}
                          </td>
                          <td className="border border-border-subtle px-2 py-1">
                            {ing.quantity}
                          </td>
                          <td className="border border-border-subtle px-2 py-1">
                            {ing.unit}
                          </td>
                          <td className="border border-border-subtle px-2 py-1 text-xs font-mono">
                            {ing.ingredient_id?.substring(0, 8) || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}