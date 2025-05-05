"use client";

import React, { useEffect, useState } from "react";
import { getAllMockRecipes } from "@/lib/mockData";

export default function RecipeTestPage() {
  const [mockRecipes, setMockRecipes] = useState([]);
  const [recipeObjects, setRecipeObjects] = useState<string>("");
  
  useEffect(() => {
    // Get mock recipes directly from the mock data
    const recipes = getAllMockRecipes();
    setMockRecipes(recipes);
    setRecipeObjects(JSON.stringify(recipes, null, 2));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Recipe Test Page</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Mock Recipes: {mockRecipes.length}</h2>
        <ul className="border border-gray-300 p-4">
          {mockRecipes.map((recipe: any) => (
            <li key={recipe.id} className="mb-2 border-b pb-2" data-testid="recipe-card">
              <div className="font-bold" data-testid="recipe-title">{recipe.title}</div>
              <div className="text-sm">{recipe.description}</div>
              <div className="text-xs text-gray-600">ID: {recipe.id}</div>
              <div className="text-xs text-gray-600">
                Ingredients: {recipe.ingredients?.length || 0}, 
                Iterations: {recipe.iterations?.length || 0}
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <details>
        <summary className="font-bold mb-2 cursor-pointer">Raw Recipe Objects</summary>
        <pre className="bg-gray-100 p-4 overflow-auto max-h-96 text-xs">
          {recipeObjects}
        </pre>
      </details>
    </div>
  );
}