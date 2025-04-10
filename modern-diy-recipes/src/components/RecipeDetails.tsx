
import React, { useState } from 'react';
import { useRecipe } from '../hooks/useRecipe';
import { useIngredients } from '../hooks/useIngredients';
import type { Recipe as BaseRecipe, RecipeIngredient, Ingredient, RecipeIteration, RecipeAnalysisData } from '../types/models';
import RecipeForm from './RecipeForm';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase';
import Modal from './Modal';

import RecipeIterationComponent from './RecipeIteration';
import IterationComparison from './IterationComparison';
import RecipeAnalysis from './RecipeAnalysis';
import AISuggestions from './AISuggestions';
import RecipeHistoryTimeline from './RecipeHistoryTimeline';
import ErrorBoundary from './ErrorBoundary';

interface RecipeWithIngredients extends BaseRecipe {
  ingredients?: RecipeIngredient[];
}

interface RecipeDetailsProps {
  recipeId: string | null;
}

export default function RecipeDetails({ recipeId }: RecipeDetailsProps) {
  const { recipe, loading, error } = useRecipe(recipeId) as {
    recipe: RecipeWithIngredients | null;
    loading: boolean;
    error: string | null;
  };

  const { ingredients: allIngredients } = useIngredients();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const user = useUser();

  const [iterations, setIterations] = useState<RecipeIteration[]>([]);
  const [selectedIteration, setSelectedIteration] = useState<RecipeIteration | null>(null);
  const [compareIteration, setCompareIteration] = useState<RecipeIteration | null>(null);
  const [analysisData, setAnalysisData] = useState<RecipeAnalysisData | null>(null);

  const handleSave = async (updatedRecipe: Partial<RecipeWithIngredients>) => {
    setSaving(true);
    setSaveError(null);
    try {
      if (!user) throw new Error('Not authenticated');

      let recipeId = updatedRecipe.id;

      if (recipeId) {
        // Update recipe
        const { error: updateError } = await supabase
          .from('recipes')
          .update({
            title: updatedRecipe.title,
            description: updatedRecipe.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', recipeId);

        if (updateError) throw updateError;

        // Delete existing ingredients
        const { error: deleteError } = await supabase
          .from('recipe_ingredients')
          .delete()
          .eq('recipe_id', recipeId);

        if (deleteError) throw deleteError;
      } else {
        // Insert new recipe
        const { data, error: insertError } = await supabase
          .from('recipes')
          .insert({
            user_id: user.id,
            title: updatedRecipe.title,
            description: updatedRecipe.description,
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        recipeId = data.id;
      }

      // Insert ingredients
      const ingredientsPayload = (updatedRecipe.ingredients || []).map((ing) => ({
        recipe_id: recipeId,
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity,
        unit: ing.unit,
        created_at: new Date().toISOString(),
      }));

      if (ingredientsPayload.length > 0) {
        const { error: ingError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredientsPayload);

        if (ingError) throw ingError;
      }

      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save recipe.');
    } finally {
      setSaving(false);
    }
  };

  if (!recipeId) return <div className="p-4">Select a recipe to view details.</div>;
  if (loading) return <div className="p-4">Loading recipe...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!recipe) return <div className="p-4">Recipe not found.</div>;

  return (
    <ErrorBoundary>
      <div className="p-4 flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-xl font-bold">{recipe.title}</h2>
        {recipe.description && <p>{recipe.description}</p>}

        <div>
          <h3 className="font-semibold mb-2">Ingredients</h3>
          <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Quantity</th>
                <th className="border px-2 py-1">Unit</th>
              </tr>
            </thead>
            <tbody>
              {(recipe.ingredients as RecipeIngredient[] | undefined)?.map((ing) => (
                <tr key={ing.id}>
                  <td className="border px-2 py-1">
                    {
                      allIngredients.find((i: Ingredient) => i.id === ing.ingredient_id)?.name
                      ?? ing.ingredient_id
                    }
                  </td>
                  <td className="border px-2 py-1">{ing.quantity}</td>
                  <td className="border px-2 py-1">{ing.unit}</td>
                </tr>
              )) ?? (
                <tr>
                  <td colSpan={3} className="border px-2 py-1 text-center">No ingredients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Iteration Controls */}
        <RecipeIterationComponent
          recipeId={recipe.id}
          selectedIterationId={selectedIteration?.id}
          onSelectIteration={(iter) => {
            // If no base iteration selected, set as base
            if (!selectedIteration) {
              setSelectedIteration(iter);
              setAnalysisData({
                metrics: iter.metrics || {},
                insights: [],
              });
            } else if (
              selectedIteration &&
              iter.id !== selectedIteration.id &&
              !compareIteration
            ) {
              // If base selected, set as compare
              setCompareIteration(iter);
            } else {
              // Reset selections
              setSelectedIteration(iter);
              setCompareIteration(null);
              setAnalysisData({
                metrics: iter.metrics || {},
                insights: [],
              });
            }
          }}
        />

        <IterationComparison
          baseIteration={selectedIteration}
          compareIteration={compareIteration}
        />

        <RecipeAnalysis analysisData={analysisData} />

        <AISuggestions recipeId={recipe.id} />

        <RecipeHistoryTimeline iterations={iterations} />

        {user && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Edit Recipe
            </button>
            {saveError && <div className="text-red-500">{saveError}</div>}
          </div>
        )}

        <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
          <RecipeForm
            recipe={recipe}
            allIngredients={allIngredients}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </Modal>
      </div>
    </ErrorBoundary>
  );
}