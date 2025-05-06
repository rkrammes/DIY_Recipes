import React, { useState, useEffect } from 'react';
import { useRecipe } from '../hooks/useRecipe';
import { useIngredients } from '../hooks/useIngredients';
import type { 
  Recipe,
  RecipeIngredient,
  Ingredient,
  RecipeIteration,
  RecipeAnalysisData,
  RecipeWithIngredientsAndIterations,
  TransformedIngredient
} from '../types/models';
import RecipeForm from './RecipeForm';
import { useUser } from '@supabase/auth-helpers-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const Modal = dynamic(() => import('./Modal'), { ssr: false });
const DeleteConfirmationModal = dynamic(() => import('./DeleteConfirmationModal'), { ssr: false });
import { Button } from './ui/button';
import FeatureToggleBar from './FeatureToggleBar';

// Import our enhanced RecipeIterationManager
const RecipeIterationManager = dynamic(() => import('./RecipeIterationManager'), { ssr: false });
import RecipeAnalysis from './RecipeAnalysis';
const AISuggestions = dynamic(() => import('./AISuggestions'), { ssr: false });
import ErrorBoundary from './ErrorBoundary';

// Import DocumentCentricRecipe component
const DocumentCentricRecipe = dynamic(() => import('./DocumentCentricRecipe'), { ssr: false });

interface RecipeDetailsProps {
  recipeId: string | null;
  initialRecipeData?: RecipeWithIngredientsAndIterations | null;
}

export default function RecipeDetails({ recipeId, initialRecipeData }: RecipeDetailsProps) {
  console.log("RecipeDetails component rendering with recipeId:", recipeId);
  console.log("Initial recipe data received:", initialRecipeData ? {
    id: initialRecipeData.id,
    title: initialRecipeData.title,
    hasIngredients: !!initialRecipeData.ingredients?.length
  } : 'none');

  const router = useRouter();

  // Add state to track component key for forced re-rendering when needed
  const [componentKey, setComponentKey] = useState<number>(Date.now());
  
  // Add state for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Add state for feature toggles
  const [isVersioningEnabled, setIsVersioningEnabled] = useState(false);
  const [isDocumentModeEnabled, setIsDocumentModeEnabled] = useState(true);

  // Get recipe data and functions
  const { recipe, loading, error, updateRecipe, deleteRecipe, refetch } = useRecipe(recipeId, initialRecipeData) as {
    recipe: RecipeWithIngredientsAndIterations | null;
    loading: boolean;
    error: string | null;
    updateRecipe: (updates: { title: string; description: string; ingredients: TransformedIngredient[] }) => Promise<unknown>;
    deleteRecipe: () => Promise<boolean>;
    refetch: () => Promise<void>;
  };

  // Force refresh when recipe ID changes
  useEffect(() => {
    console.log(`Recipe ID changed to ${recipeId}, forcing re-render`);
    setComponentKey(Date.now());
    
    // If we have a recipe ID, force an immediate refetch
    if (recipeId) {
      // Brief timeout to ensure state updates properly
      setTimeout(() => {
        console.log(`Triggering immediate refetch for recipe ${recipeId}`);
        refetch();
      }, 50);
    }
  }, [recipeId, refetch]);

  // Log what's happening with the recipe data
  React.useEffect(() => {
    if (recipe) {
      console.log("Recipe data loaded in component:", {
        id: recipe.id,
        title: recipe.title,
        ingredients: recipe.ingredients?.length || 0,
        user_id: recipe.user_id,
        source: initialRecipeData ? 'prop' : 'hook'
      });
      
      // Validate recipe ingredients to help with debugging
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        console.warn("Recipe has no ingredients data. This might cause display issues.");
      } else {
        // Check if ingredients have all required properties
        const invalidIngredients = recipe.ingredients.filter(ing => 
          !ing.name || ing.name === 'Unknown Ingredient' || !ing.id
        );
        
        if (invalidIngredients.length > 0) {
          console.warn(`Recipe has ${invalidIngredients.length} invalid ingredients`, invalidIngredients);
        }
      }
    } else if (error) {
      console.error("Recipe loading error:", error);
    }
  }, [recipe, error, initialRecipeData]);

  const { ingredients: allIngredients } = useIngredients();

  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isIngredientsCollapsed, setIsIngredientsCollapsed] = useState(false);

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

  if (!recipeId) {
    console.log("RecipeDetails: No recipe ID provided");
    return <div className="p-4">Select a recipe to view details.</div>;
  }
  
  if (loading) {
    console.log(`RecipeDetails: Loading recipe ${recipeId}...`);
    return <div className="p-4">Loading recipe {recipeId.substring(0, 8)}...</div>;
  }
  
  if (error) {
    console.error(`RecipeDetails: Error loading recipe ${recipeId}:`, error);
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }
  
  if (!recipe) {
    console.error(`RecipeDetails: Recipe ${recipeId} not found`);
    return <div className="p-4">Recipe not found. ID: {recipeId.substring(0, 8)}</div>;
  }
  
  // We have a valid recipe - log it for debugging
  console.log(`RecipeDetails: Rendering recipe ${recipe.id} - "${recipe.title}" with ${recipe.ingredients?.length || 0} ingredients`);

  return (
    <ErrorBoundary>
      <div 
        key={componentKey}
        className="p-4 md:p-6 lg:p-8 flex flex-col gap-4 md:gap-6 overflow-y-auto h-full bg-surface text-text border border-subtle rounded-lg shadow-soft"
        data-fallback-data={recipe.user_id === 'system' ? 'true' : 'false'}
      >
        {/* Feature Toggle Bar */}
        <FeatureToggleBar 
          recipe={recipe}
          onToggleVersioning={setIsVersioningEnabled}
          isVersioningEnabled={isVersioningEnabled}
          onToggleDocumentMode={setIsDocumentModeEnabled}
          isDocumentModeEnabled={isDocumentModeEnabled}
        />
        
        {/* Document-Centric View */}
        {isDocumentModeEnabled ? (
          <DocumentCentricRecipe 
            recipeId={recipe.id} 
            initialData={recipe}
          />
        ) : (
          /* Traditional View */
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold">{recipe.title}</h2>
              <button 
                onClick={() => {
                  console.log("Manual refresh requested");
                  refetch();
                }}
                className="text-accent hover:text-accent-hover p-1 rounded-md bg-surface-1 hover:bg-surface-2 border border-border-subtle"
                title="Refresh recipe data"
              >
                ↻ Refresh
              </button>
            </div>
            {recipe.description && <p className="text-sm md:text-base text-text-secondary">{recipe.description}</p>}
            
            <div className="text-xs text-text-secondary bg-surface-1 p-2 rounded-md">
              <p>Recipe ID: {recipe.id}</p>
              <p>Source: {recipe.user_id === 'system' ? 'Fallback Data' : 'Database'}</p>
              <p>Last updated: {new Date(recipe.created_at).toLocaleString()}</p>
            </div>
    
            <hr className="border-subtle" />
    
            <div className="transition-all duration-300 ease-in-out">
              <button
                className="flex justify-between items-center w-full text-left font-semibold mb-2 focus:outline-none focus:ring-2 focus:ring-accent"
                onClick={() => setIsIngredientsCollapsed(!isIngredientsCollapsed)}
                aria-expanded={!isIngredientsCollapsed}
                aria-controls="ingredients-section"
              >
                <h3 className="text-lg font-semibold">Ingredients</h3>
                <span className="ml-2 transform transition-transform duration-300 ease-in-out">
                  {isIngredientsCollapsed ? '▼' : '▲'}
                </span>
              </button>
              {!isIngredientsCollapsed && (
                <div id="ingredients-section" className="overflow-x-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-text-secondary">
                      {recipe.ingredients?.length || 0} ingredients
                    </span>
                    <button 
                      onClick={() => refetch()} 
                      className="text-xs text-accent hover:text-accent-hover px-2 py-1 rounded bg-surface-1 hover:bg-surface-2"
                      title="Refresh ingredients list"
                    >
                      Refresh Ingredients
                    </button>
                  </div>
                  
                  <table className="min-w-full border border-subtle text-sm">
                    <thead>
                      <tr className="bg-surface-1">
                        <th className="border border-subtle px-2 py-1">Name</th>
                        <th className="border border-subtle px-2 py-1">Quantity</th>
                        <th className="border border-subtle px-2 py-1">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipe.ingredients && recipe.ingredients.length > 0 ? (
                        recipe.ingredients.map((ing, index) => {
                          // Parse quantity if it's stored as a string (from CSV data)
                          let quantity = ing.quantity;
                          let unit = ing.unit || '';
                          
                          // Handle combined quantity/unit strings like "40%; 12g"
                          if (typeof quantity === 'string' && quantity.includes(';')) {
                            const parts = quantity.split(';').map(p => p.trim());
                            quantity = parts[0];
                            // If we have a second part, it might contain unit information
                            if (parts[1]) {
                              // Extract numeric portion for quantity and keep unit portion
                              const match = parts[1].match(/^([\d.]+)(.*)$/);
                              if (match) {
                                unit = match[2] || unit; // Use extracted unit if available
                              } else {
                                unit = parts[1]; // Use whole second part as unit
                              }
                            }
                          }
                          
                          return (
                            <tr 
                              key={`${recipe.id}-ing-${ing.id || index}-${componentKey}`} 
                              className="even:bg-surface odd:bg-surface-1"
                              data-ingredient-id={ing.id || 'unknown'}
                            >
                              <td className="border border-subtle px-2 py-1 text-text-secondary">
                                {ing.name || 'Unknown Ingredient'}
                                {!ing.name && (
                                  <span className="ml-1 text-xs text-alert-red">
                                    (missing name)
                                  </span>
                                )}
                              </td>
                              <td className="border border-subtle px-2 py-1 text-text-secondary">
                                {quantity || '1'}
                              </td>
                              <td className="border border-subtle px-2 py-1 text-text-secondary">
                                {unit || 'unit'}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={3} className="border border-subtle px-2 py-1 text-center text-text-secondary">
                            No ingredients found. 
                            <button 
                              onClick={() => refetch()} 
                              className="ml-2 text-accent hover:text-accent-hover underline"
                            >
                              Refresh data
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
    
            <hr className="border-subtle" />
          </>
        )}

        {/* Recipe Iterations - conditionally rendered based on toggle state */}
        {isVersioningEnabled ? (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Recipe Versions</h3>
            <div 
              className="min-h-[300px]" 
              data-recipe-id={recipe.id}
              data-database-status={recipe.user_id === 'system' ? 'mock' : 'real'}
            >
              {/* Check if we're using real or mock data */}
              {recipe.user_id === 'system' ? (
                <div className="p-4 border border-alert-amber bg-alert-amber-light rounded-md">
                  <p className="text-alert-amber-text font-medium">Using mock recipe data</p>
                  <p className="text-sm mt-1">The recipe versions feature requires a database connection.</p>
                  <p className="text-sm mt-1">This is a mock recipe, not stored in the database.</p>
                </div>
              ) : (
                <ErrorBoundary fallback={
                  <div className="p-4 border border-alert-amber bg-alert-amber-light rounded-md">
                    <p className="text-alert-amber-text font-medium">Recipe versioning encountered an issue</p>
                    <p className="text-sm mt-1">This feature requires a database connection to work properly.</p>
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer font-medium">Troubleshooting</summary>
                      <div className="mt-2 p-2 bg-surface-1 rounded overflow-auto">
                        <p>1. Verify your Supabase connection is working</p>
                        <p>2. Check that you have run the SQL setup script</p>
                        <p>3. Try refreshing the page</p>
                      </div>
                    </details>
                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-3 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded"
                    >
                      Refresh Page
                    </button>
                  </div>
                }>
                  <div key={`recipe-iterations-${recipe.id}-${Date.now()}`} className="recipe-iterations-container">
                    <RecipeIterationManager 
                      recipe={recipe} 
                      ingredients={recipe.ingredients || []}
                    />
                  </div>
                </ErrorBoundary>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-surface-1 border border-subtle rounded-md text-center">
            <h3 className="text-lg font-semibold mb-2">Recipe Versioning</h3>
            <p className="text-sm text-text-secondary mb-3">
              Enable recipe versioning to track different iterations of your recipe as you refine it.
            </p>
            <button
              onClick={() => setIsVersioningEnabled(true)}
              className="px-4 py-2 bg-accent text-text-inverse rounded hover:bg-accent-hover transition-colors"
            >
              Enable Versioning
            </button>
          </div>
        )}

        {/* Recipe Analysis */}
        <ErrorBoundary fallback={<div className="hidden">Recipe analysis feature unavailable.</div>}>
          {analysisData && <RecipeAnalysis analysisData={analysisData} />}
        </ErrorBoundary>

        {/* AI Suggestions */}
        <ErrorBoundary fallback={<div className="hidden">AI suggestions feature unavailable.</div>}>
          <AISuggestions recipeId={recipe.id} />
        </ErrorBoundary>

        {user && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-accent text-text-inverse hover:bg-accent-hover"
            >
              Edit Recipe
            </Button>
            <Button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-alert-red text-text-inverse hover:bg-alert-red-hover"
            >
              Delete Recipe
            </Button>
            {saveError && <div className="text-alert-red">{saveError}</div>}
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
        
        <DeleteConfirmationModal 
          isOpen={isDeleteModalOpen}
          title="Delete Recipe"
          message={`Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`}
          isDeleting={isDeleting}
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={async () => {
            try {
              setIsDeleting(true);
              const success = await deleteRecipe();
              if (success) {
                // Navigate back to home after deletion
                router.push('/');
              }
            } catch (err) {
              console.error('Error deleting recipe:', err);
            } finally {
              setIsDeleteModalOpen(false);
              setIsDeleting(false);
            }
          }}
        />
      </div>
    </ErrorBoundary>
  );
}