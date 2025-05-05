"use client";

import React from "react";
import { useParams } from "next/navigation";
import RecipeDetails from "@/components/RecipeDetails"; // Assuming RecipeDetails is in components
import { useRecipe } from '@/hooks/useRecipe'; // Assuming a hook to fetch single recipe

export default function RecipeDetailsPage() {
  const params = useParams();
  const recipeId = params.id as string;

  // Fetch the specific recipe data using a hook
  const { recipe, loading, error } = useRecipe(recipeId);

  if (loading) {
    return <div className="p-4">Loading recipe...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading recipe: {error}</div>;
  }

  if (!recipe) {
    return <div className="p-4">Recipe not found.</div>;
  }

  // Pass the fetched recipe data to RecipeDetails
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <RecipeDetails recipeId={recipeId} initialRecipeData={recipe} />
    </div>
  );
}