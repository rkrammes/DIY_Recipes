import React, { useState, useEffect } from 'react';
import { useRecipeIteration } from '@/hooks/useRecipeIteration';
import { Recipe, RecipeIteration, TransformedIngredient } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Plus, Trash2, Edit, Copy, RotateCw, FileText } from "lucide-react";

interface RecipeIterationManagerProps {
  recipe: Recipe;
  ingredients?: TransformedIngredient[];
}

// Extended comparison result interface to handle ingredient differences
interface ComparisonResult {
  comparedWith: string;
  result: any;
}

export function RecipeIterationManager({ recipe, ingredients = [] }: RecipeIterationManagerProps) {
  const {
    iterations,
    currentIteration,
    isLoading,
    error,
    createNewIteration,
    updateIterationDetails,
    updateIterationIngredients,
    compareIterations,
    getAISuggestions,
    setCurrentIteration,
  } = useRecipeIteration(recipe.id);

  const [editingNotes, setEditingNotes] = useState<string>('');
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [editingDescription, setEditingDescription] = useState<string>('');
  const [editingInstructions, setEditingInstructions] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Reset all edit fields when current iteration changes
  useEffect(() => {
    if (currentIteration) {
      setEditingNotes(currentIteration.notes || '');
      setEditingTitle(currentIteration.title || '');
      setEditingDescription(currentIteration.description || '');
      setEditingInstructions(currentIteration.instructions || '');
      setIsEditing(false);
      setAiSuggestions([]);
      setComparisonResult(null);
      setHasUnsavedChanges(false);
    } else {
      setEditingNotes('');
      setEditingTitle('');
      setEditingDescription('');
      setEditingInstructions('');
      setIsEditing(false);
      setAiSuggestions([]);
      setComparisonResult(null);
      setHasUnsavedChanges(false);
    }
  }, [currentIteration]);

  // Monitor for any changes to set the unsaved changes flag
  useEffect(() => {
    if (currentIteration) {
      const hasChanged = 
        editingNotes !== (currentIteration.notes || '') ||
        editingTitle !== currentIteration.title ||
        editingDescription !== (currentIteration.description || '') ||
        editingInstructions !== (currentIteration.instructions || '');
      
      setHasUnsavedChanges(hasChanged);
    }
  }, [editingNotes, editingTitle, editingDescription, editingInstructions, currentIteration]);

  const handleSelectIteration = (iteration: RecipeIteration) => {
    // Check for unsaved changes before switching
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Discard them and switch iterations?")) {
        setCurrentIteration(iteration);
      }
    } else {
      setCurrentIteration(iteration);
    }
  };

  const handleCreateNewIteration = async () => {
    const base = currentIteration || recipe;
    
    // Update title with "(new version)" suffix if it doesn't already end with it
    let titleWithSuffix = base.title;
    if (!titleWithSuffix.includes(" (new version)")) {
      titleWithSuffix += " (new version)";
    }
    
    const newIter = await createNewIteration(base, {
      title: titleWithSuffix
    });
    
    if (newIter) {
      console.log('Successfully created new iteration:', newIter);
      setCurrentIteration(newIter);
    }
  };

  const handleSaveChanges = async () => {
    if (currentIteration) {
      await updateIterationDetails(currentIteration.id, {
        notes: editingNotes,
        title: editingTitle,
        description: editingDescription,
        instructions: editingInstructions,
      });
      setIsEditing(false);
      setHasUnsavedChanges(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (currentIteration) {
      setAiSuggestions([]); // Clear previous suggestions
      const result = await getAISuggestions(currentIteration);
      if (result?.suggestions) {
        setAiSuggestions(result.suggestions);
      }
    }
  };

  // Compare with previous iteration
  const handleCompareWithPrevious = () => {
    if (currentIteration && iterations.length > 1) {
      try {
        const currentIndex = iterations.findIndex(iter => iter.id === currentIteration.id);
        
        if (currentIndex > 0) {
          const previousIteration = iterations[currentIndex - 1]; // Iterations are sorted descending
          const result = compareIterations(currentIteration, previousIteration);
          
          setComparisonResult({
            comparedWith: `v${previousIteration.version_number}`,
            result
          });
        } else {
          // If it's the first iteration, compare with base recipe
          setComparisonResult({ 
            comparedWith: 'Base Recipe', 
            result: {
              titleChanged: currentIteration.title !== recipe.title,
              descriptionChanged: currentIteration.description !== recipe.description,
              instructionsChanged: true, // Assume changed since we can't reliably compare
              hasChanges: true
            } 
          });
        }
      } catch (err) {
        console.error('Error comparing iterations:', err);
        // Show a user-friendly error message
        setComparisonResult({
          comparedWith: 'Error',
          result: {
            error: 'Could not compare iterations',
            message: err.message,
            hasChanges: false
          }
        });
      }
    }
  };


  // Add safety check for missing data
  if (!recipe || !recipe.id) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md">
        <p className="text-red-600 font-medium">Cannot render Recipe Versions</p>
        <p className="text-sm text-red-500">Missing recipe data</p>
      </div>
    );
  }

  try {
    return (
      <div 
        className="flex flex-col md:flex-row gap-4"
        data-component="RecipeIterationManager"
        data-recipe-id={recipe.id}
      >
      {/* Iteration List */}
      <Card className="w-full md:w-1/4">
        <CardHeader>
          <CardTitle>Recipe Versions</CardTitle>
          <CardDescription>History of recipe iterations</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button 
            onClick={handleCreateNewIteration} 
            disabled={isLoading}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create New Version
          </Button>
          
          {iterations.length === 0 && !isLoading && (
            <div className="text-sm text-muted-foreground p-4 text-center bg-muted rounded-md">
              No versions yet. Create your first iteration to track recipe changes.
            </div>
          )}
          
          <div className="mt-2 space-y-1 max-h-96 overflow-y-auto pr-2">
            {iterations.map((iter) => (
              <Button
                key={iter.id}
                variant={currentIteration?.id === iter.id ? 'default' : 'outline'}
                onClick={() => handleSelectIteration(iter)}
                className={`w-full justify-between text-left ${
                  currentIteration?.id === iter.id ? 'bg-primary' : ''
                }`}
              >
                <div className="flex flex-col items-start">
                  <span>Version {iter.version_number}</span>
                  <span className="text-xs opacity-80">
                    {new Date(iter.created_at).toLocaleDateString()}
                  </span>
                </div>
                {currentIteration?.id === iter.id && <FileText className="h-4 w-4" />}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Iteration Details */}
      <Card className="w-full md:w-3/4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {currentIteration 
                  ? `Version ${currentIteration.version_number}` 
                  : 'Select a Version'}
              </CardTitle>
              {currentIteration && (
                <CardDescription>
                  Created: {new Date(currentIteration.created_at).toLocaleString()}
                </CardDescription>
              )}
            </div>
            
            {currentIteration && !isLoading && !isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          
          {!currentIteration && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Select a version from the list or create a new one.</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={handleCreateNewIteration}
              >
                <Plus className="mr-2 h-4 w-4" /> Create First Version
              </Button>
            </div>
          )}

          {currentIteration && !isLoading && (
            <>
              {/* Title field */}
              <div>
                <Label htmlFor="iteration-title" className="text-lg font-medium">Title</Label>
                {isEditing ? (
                  <Textarea
                    id="iteration-title"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    rows={1}
                    className="font-medium text-lg"
                  />
                ) : (
                  <h3 className="text-xl font-semibold mt-1">
                    {currentIteration.title}
                  </h3>
                )}
              </div>

              {/* Instructions field */}
              <div>
                <Label htmlFor="iteration-instructions">Instructions</Label>
                {isEditing ? (
                  <Textarea
                    id="iteration-instructions"
                    value={editingInstructions}
                    onChange={(e) => setEditingInstructions(e.target.value)}
                    rows={6}
                  />
                ) : (
                  <div className="text-sm p-3 border rounded-md bg-muted min-h-[100px] whitespace-pre-wrap">
                    {currentIteration.instructions || 'No instructions recorded.'}
                  </div>
                )}
              </div>

              {/* Description/Results field */}
              <div>
                <Label htmlFor="iteration-description">Description / Results</Label>
                {isEditing ? (
                  <Textarea
                    id="iteration-description"
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    rows={3}
                  />
                ) : (
                  <div className="text-sm p-3 border rounded-md bg-muted min-h-[60px]">
                    {currentIteration.description || 'No description recorded.'}
                  </div>
                )}
              </div>
              
              {/* Notes field */}
              <div>
                <Label htmlFor="iteration-notes">Notes</Label>
                {isEditing ? (
                  <Textarea
                    id="iteration-notes"
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    rows={3}
                    placeholder="Add notes about changes, results, or ideas for next time..."
                  />
                ) : (
                  <div className="text-sm p-3 border rounded-md bg-muted min-h-[60px]">
                    {currentIteration.notes || 'No notes recorded.'}
                  </div>
                )}
              </div>

              {/* Ingredients section - simplified view just showing count */}
              {currentIteration.ingredients && (
                <div>
                  <Label>Ingredients</Label>
                  <div className="text-sm p-3 border rounded-md bg-muted">
                    <p className="font-medium">{currentIteration.ingredients.length} ingredients</p>
                    <ul className="mt-2 list-disc pl-5">
                      {currentIteration.ingredients.slice(0, 5).map((ing) => (
                        <li key={ing.id}>
                          {ing.quantity} {ing.unit} {ing.name}
                        </li>
                      ))}
                      {currentIteration.ingredients.length > 5 && (
                        <li className="italic">...and {currentIteration.ingredients.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* AI Suggestions Section */}
              <div className="space-y-2 pt-4">
                <Button 
                  onClick={handleGetSuggestions} 
                  variant="outline" 
                  size="sm" 
                  disabled={isLoading}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Get AI Suggestions
                </Button>
                
                {aiSuggestions.length > 0 && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-base text-blue-800">AI Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 text-sm text-blue-700">
                        {aiSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Comparison Section */}
              <div className="space-y-2">
                <Button 
                  onClick={handleCompareWithPrevious} 
                  variant="outline" 
                  size="sm" 
                  disabled={isLoading || iterations.length < 2}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Compare with Previous
                </Button>
                
                {comparisonResult && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-base text-green-800">
                        Comparison with {comparisonResult.comparedWith}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {comparisonResult.result ? (
                        <div className="space-y-2">
                          {/* Basic field changes */}
                          <div>
                            <h4 className="font-medium text-green-900 mb-1">Changes in Basic Fields:</h4>
                            <ul className="list-disc pl-5 text-sm text-green-700">
                              {comparisonResult.result.titleChanged && 
                                <li>Title was changed</li>}
                              {comparisonResult.result.descriptionChanged && 
                                <li>Description was updated</li>}
                              {comparisonResult.result.notesChanged && 
                                <li>Notes were modified</li>}
                              {comparisonResult.result.instructionsChanged && 
                                <li>Instructions were changed</li>}
                              {!comparisonResult.result.titleChanged && 
                               !comparisonResult.result.descriptionChanged && 
                               !comparisonResult.result.notesChanged &&
                               !comparisonResult.result.instructionsChanged && 
                                <li>No changes to basic recipe information</li>}
                            </ul>
                          </div>

                          {/* Ingredient changes if available */}
                          {comparisonResult.result.hasIngredientChanges && (
                            <div>
                              <h4 className="font-medium text-green-900 mb-1">Changes in Ingredients:</h4>
                              <ul className="list-disc pl-5 text-sm text-green-700">
                                {comparisonResult.result.addedIngredients?.length > 0 && (
                                  <li>Added {comparisonResult.result.addedIngredients.length} new ingredients</li>
                                )}
                                {comparisonResult.result.removedIngredients?.length > 0 && (
                                  <li>Removed {comparisonResult.result.removedIngredients.length} ingredients</li>
                                )}
                                {comparisonResult.result.modifiedIngredients?.length > 0 && (
                                  <li>Modified {comparisonResult.result.modifiedIngredients.length} ingredients</li>
                                )}
                              </ul>
                            </div>
                          )}

                          {!comparisonResult.result.hasChanges && (
                            <p className="text-sm text-green-700">No significant changes detected between versions.</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-green-700">Could not compare versions.</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </CardContent>
        
        {currentIteration && !isLoading && (
          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveChanges} 
                  disabled={isLoading || !hasUnsavedChanges}
                  className={!hasUnsavedChanges ? 'opacity-50' : ''}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleCompareWithPrevious}
                  disabled={iterations.length < 2}
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Compare
                </Button>
                <Button 
                  onClick={handleCreateNewIteration}
                  className="bg-primary"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  New Version
                </Button>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
    );
  } catch (error) {
    console.error('Error rendering RecipeIterationManager:', error);
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md">
        <p className="text-red-600 font-medium">Error rendering Recipe Versions</p>
        <p className="text-sm text-red-500">{error.message || 'An unexpected error occurred'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded"
        >
          Refresh Page
        </button>
      </div>
    );
  }
}