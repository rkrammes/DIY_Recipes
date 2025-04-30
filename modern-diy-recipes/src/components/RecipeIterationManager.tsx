import React, { useState, useEffect } from 'react';
import { useRecipeIteration } from '@/hooks/useRecipeIteration';
import { Recipe, RecipeIteration } from '@/types/models';
import { Button } from '@/components/ui/button'; // Assuming a UI library like Shadcn/ui
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react"; // Example loading icon

interface RecipeIterationManagerProps {
  recipe: Recipe; // Pass the base recipe object
}

export function RecipeIterationManager({ recipe }: RecipeIterationManagerProps) {
  const {
    iterations,
    currentIteration,
    isLoading,
    error,
    fetchIterations,
    createNewIteration,
    updateIterationDetails,
    compareIterations, // Added compareIterations
    getAISuggestions,
    setCurrentIteration,
  } = useRecipeIteration(recipe.id);

  const [editingNotes, setEditingNotes] = useState<string>('');
  const [editingResults, setEditingResults] = useState<string>(''); // Assuming 'results' maps to 'description' or similar
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<any>(null); // State for comparison

  useEffect(() => {
    // Fetch iterations when the component mounts or recipe changes
    if (recipe.id) {
        // fetchIterations(recipe.id); // Hook's useEffect handles this
    }
  }, [recipe.id]); // Removed fetchIterations dependency

  useEffect(() => {
    // Update local editing state when currentIteration changes
    if (currentIteration) {
      setEditingNotes(currentIteration.notes || '');
      // Map 'results' concept if needed. Using description as placeholder.
      setEditingResults(currentIteration.description || '');
      setIsEditing(false); // Reset editing mode when switching iterations
      setAiSuggestions([]); // Clear suggestions when switching
      setComparisonResult(null); // Clear comparison when switching
    } else {
      setEditingNotes('');
      setEditingResults('');
      setIsEditing(false);
      setAiSuggestions([]);
      setComparisonResult(null);
    }
  }, [currentIteration]);

  const handleSelectIteration = (iteration: RecipeIteration) => {
    setCurrentIteration(iteration);
  };

  const handleCreateNewIteration = async () => {
    const base = currentIteration || recipe; // Use current iteration or base recipe
    const newIter = await createNewIteration(base as Recipe | RecipeIteration); // Type assertion might be needed
    if (newIter) {
      console.log('Successfully created new iteration:', newIter);
      // Optionally switch to the new iteration immediately
      // setCurrentIteration(newIter);
    }
  };

  const handleSaveChanges = async () => {
    if (currentIteration) {
      await updateIterationDetails(currentIteration.id, {
        notes: editingNotes,
        description: editingResults, // Update description as 'results'
      });
      setIsEditing(false);
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

  // Basic comparison: Compare current with the previous one in the list
  const handleCompareWithPrevious = () => {
    if (currentIteration && iterations.length > 1) {
        const currentIndex = iterations.findIndex(iter => iter.id === currentIteration.id);
        if (currentIndex > 0) {
            const previousIteration = iterations[currentIndex - 1]; // Iterations are sorted descending
            const result = compareIterations(currentIteration, previousIteration);
            setComparisonResult({
                comparedWith: `v${previousIteration.version_number}`,
                result: result
            });
        } else {
             setComparisonResult({ comparedWith: 'Base Recipe', result: null }); // Or compare with base recipe
        }
    }
  };


  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Iteration List */}
      <Card className="w-full md:w-1/4">
        <CardHeader>
          <CardTitle>Iterations</CardTitle>
          <CardDescription>History of recipe versions.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button onClick={handleCreateNewIteration} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            New Iteration
          </Button>
          {iterations.length === 0 && !isLoading && <p className="text-sm text-muted-foreground">No iterations yet.</p>}
          {iterations.map((iter) => (
            <Button
              key={iter.id}
              variant={currentIteration?.id === iter.id ? 'default' : 'outline'}
              onClick={() => handleSelectIteration(iter)}
              className="w-full justify-start"
            >
              Version {iter.version_number} ({new Date(iter.created_at).toLocaleDateString()})
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Iteration Details */}
      <Card className="w-full md:w-3/4">
        <CardHeader>
          <CardTitle>
            {currentIteration ? `Version ${currentIteration.version_number} Details` : 'Select an Iteration'}
          </CardTitle>
          {currentIteration && <CardDescription>{currentIteration.title}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <Loader2 className="m-auto h-8 w-8 animate-spin" />}
          {error && (
             <Alert variant="destructive">
               <AlertTitle>Error</AlertTitle>
               <AlertDescription>{error.message}</AlertDescription>
             </Alert>
           )}
          {!currentIteration && !isLoading && <p>Select an iteration from the list to view details.</p>}

          {currentIteration && !isLoading && (
            <>
              <div>
                <Label htmlFor="iteration-results">Description / Results</Label>
                {isEditing ? (
                  <Textarea
                    id="iteration-results"
                    value={editingResults}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingResults(e.target.value)}
                    rows={4}
                  />
                ) : (
                  <p className="text-sm p-2 border rounded bg-muted min-h-[60px]">{currentIteration.description || 'No description/results recorded.'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="iteration-notes">Notes</Label>
                {isEditing ? (
                  <Textarea
                    id="iteration-notes"
                    value={editingNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingNotes(e.target.value)}
                    rows={4}
                  />
                ) : (
                  <p className="text-sm p-2 border rounded bg-muted min-h-[60px]">{currentIteration.notes || 'No notes recorded.'}</p>
                )}
              </div>

              {/* AI Suggestions Section */}
              <div className="space-y-2">
                 <Button onClick={handleGetSuggestions} variant="outline" size="sm" disabled={isLoading}>
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
                 <Button onClick={handleCompareWithPrevious} variant="outline" size="sm" disabled={isLoading || iterations.length < 2}>
                    Compare w/ Previous
                 </Button>
                 {comparisonResult && (
                    <Card className="bg-green-50 border-green-200">
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-base text-green-800">Comparison with {comparisonResult.comparedWith}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {comparisonResult.result ? (
                                <ul className="list-disc pl-5 text-sm text-green-700">
                                    {Object.entries(comparisonResult.result).map(([key, changed]) => (
                                        changed ? <li key={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} changed.</li> : null
                                    ))}
                                    {!Object.values(comparisonResult.result).some(Boolean) && <li>No significant changes detected.</li>}
                                </ul>
                            ) : <p className="text-sm text-green-700">Could not compare.</p>}
                        </CardContent>
                    </Card>
                 )}
              </div>
            </>
          )}
        </CardContent>
        {currentIteration && !isLoading && (
          <CardFooter className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSaveChanges} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Notes/Results</Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}