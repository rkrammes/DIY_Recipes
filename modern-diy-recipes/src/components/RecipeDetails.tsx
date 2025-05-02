
import React, { useState } from 'react';
import { useRecipe } from '../hooks/useRecipe';
import { useIngredients } from '../hooks/useIngredients';
import type { Recipe as BaseRecipe, RecipeIngredient, Ingredient, RecipeIteration, RecipeAnalysisData } from '../types/models';
import RecipeForm from './RecipeForm';
import { useUser } from '@supabase/auth-helpers-react';
import dynamic from 'next/dynamic';

const Modal = dynamic(() => import('./Modal'), { ssr: false });
import { Button } from './ui/button'; // Import the standard Button component

import RecipeIterationComponent from './RecipeIteration';
import IterationComparison from './IterationComparison';
import RecipeAnalysis from './RecipeAnalysis';
import AISuggestions from './AISuggestions';
import RecipeHistoryTimeline from './RecipeHistoryTimeline';
import ErrorBoundary from './ErrorBoundary';

interface RecipeWithIngredientsAndIterations extends BaseRecipe {
  ingredients?: RecipeIngredient[];
  iterations?: RecipeIteration[];
}

interface RecipeDetailsProps {
  recipeId: string | null;
}

export default function RecipeDetails({ recipeId }: RecipeDetailsProps) {
  const { recipe, loading, error, updateRecipe } = useRecipe(recipeId) as {
    recipe: RecipeWithIngredientsAndIterations | null;
    loading: boolean;
    error: string | null;
    updateRecipe: (updates: { title: string; description: string; ingredients: RecipeIngredient[] }) => Promise<unknown>;
  };

  const { ingredients: allIngredients } = useIngredients();

  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null); // Remove saving state
  const [isIngredientsCollapsed, setIsIngredientsCollapsed] = useState(false); // State for collapsible ingredients

  const user = useUser();

  const [selectedIteration, setSelectedIteration] = useState<RecipeIteration | null>(null);
  const [compareIteration, setCompareIteration] = useState<RecipeIteration | null>(null);
  const [analysisData, setAnalysisData] = useState<RecipeAnalysisData | null>(null);

  const handleSave = async (updatedRecipe: Partial<RecipeWithIngredientsAndIterations>) => {
    setSaveError(null);
    try {
      if (!user) throw new Error('Not authenticated');
      if (!recipe?.id) throw new Error('Recipe ID is required for updates');

      await updateRecipe({
        title: updatedRecipe.title || '',
        description: updatedRecipe.description || '',
        ingredients: updatedRecipe.ingredients || []
      });

      setIsEditing(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save recipe.';
      setSaveError(message);
    }
  };

  if (!recipeId) return <div className="p-4">Select a recipe to view details.</div>;
  if (loading) return <div className="p-4">Loading recipe...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!recipe) return <div className="p-4">Recipe not found.</div>;

  return (
    <ErrorBoundary>
      <div className="p-4 md:p-6 flex flex-col gap-6 overflow-y-auto h-full bg-[var(--surface-0)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg shadow-sm"> {/* Added md:p-6 and gap-6, added theme styles */}
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">{recipe.title}</h2> {/* Increased heading size */}
        {recipe.description && <p className="text-[var(--text-secondary)]">{recipe.description}</p>}

        {/* Added horizontal rule for visual separation */}
        <hr className="border-[var(--border-subtle)]" />

        {/* Collapsible Ingredients Section */}
        <div>
          <button
            className="flex justify-between items-center w-full text-left font-semibold mb-2 text-[var(--text-primary)]"
            onClick={() => setIsIngredientsCollapsed(!isIngredientsCollapsed)}
            aria-expanded={!isIngredientsCollapsed}
            aria-controls="ingredients-section"
          >
            <h3>Ingredients</h3>
            <span>{isIngredientsCollapsed ? '▼' : '▲'}</span>
          </button>
          {!isIngredientsCollapsed && (
            <div id="ingredients-section" className="overflow-x-auto"> {/* Added overflow-x-auto for table responsiveness */}
              <table className="min-w-full border border-[var(--border-subtle)] text-sm">
                <thead>
                  <tr className="bg-[var(--surface-1)] text-[var(--text-primary)]">
                    <th className="border border-[var(--border-subtle)] px-2 py-1">Name</th>
                    <th className="border border-[var(--border-subtle)] px-2 py-1">Quantity</th>
                    <th className="border border-[var(--border-subtle)] px-2 py-1">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {(recipe.ingredients as RecipeIngredient[] | undefined)?.map((ing) => (
                    <tr key={ing.id} className="even:bg-[var(--surface-0)] odd:bg-[var(--surface-1)]"> {/* Added alternating row colors */}
                      <td className="border border-[var(--border-subtle)] px-2 py-1 text-[var(--text-secondary)]">
                        {
                          allIngredients.find((i: Ingredient) => i.id === ing.ingredient_id)?.name
                          ?? ing.ingredient_id
                        }
                      </td>
                      <td className="border border-[var(--border-subtle)] px-2 py-1 text-[var(--text-secondary)]">{ing.quantity}</td>
                      <td className="border border-[var(--border-subtle)] px-2 py-1 text-[var(--text-secondary)]">{ing.unit}</td>
                    </tr>
                  )) ?? (
                    <tr>
                      <td colSpan={3} className="border border-[var(--border-subtle)] px-2 py-1 text-center text-[var(--text-secondary)]">No ingredients found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Added horizontal rule for visual separation */}
        <hr className="border-[var(--border-subtle)]" />

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

        {/* Pass iterations from the hook */}
        {/* Pass iterations from the hook */}
        <RecipeHistoryTimeline iterations={recipe?.iterations || []} />

        {user && (
          <div className="flex gap-2 mt-4 text-[var(--text-primary)]">
            <Button // Use the standard Button component
              onClick={() => setIsEditing(true)}
              className="bg-[var(--accent)] text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]" // Added theme styles
            >
              Edit Recipe
            </Button>
            {saveError && <div className="text-[var(--error)]">{saveError}</div>}
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