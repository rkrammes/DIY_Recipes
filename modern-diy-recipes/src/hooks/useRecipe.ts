"use client";  // Ensure this is a Client Component

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchRecipeById, fetchRecipeIngredients, fetchRecipeIterations } from '@/lib/directApi';
import type { Recipe, TransformedIngredient, RecipeIteration, RecipeWithIngredientsAndIterations } from '@/types/models';

interface RecipeUpdate {
  title: string;
  description: string;
  ingredients: TransformedIngredient[];
}

export function useRecipe(id: string | null, initialRecipeData?: RecipeWithIngredientsAndIterations | null) {
  const [recipe, setRecipe] = useState<RecipeWithIngredientsAndIterations | null>(initialRecipeData || null);
  const [loading, setLoading] = useState<boolean>(!initialRecipeData);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipe = useCallback(async () => {
    if (!id) {
      setRecipe(null);
      setLoading(false);
      setError('No recipe ID provided');
      return;
    }

    console.log(`========== FETCHING RECIPE ${id} ==========`);
    setLoading(true);
    
    try {
      // Try to get from local API first (for backward compatibility only)
      try {
        const localApiUrl = `http://localhost:3005/api/recipes/${id}`;
        console.log(`Trying local API first: ${localApiUrl}`);
        
        const response = await fetch(localApiUrl);
        
        if (!response.ok) {
          console.log(`Local API returned ${response.status}, continuing to Supabase`);
          // No need to handle error here, we'll just continue to Supabase
        } else {
          // This branch is only for backward compatibility, 
          // we expect empty responses with no mock data
          try {
            const localApiData = await response.json();
            
            // If the API returned an error object, log it and continue
            if (localApiData && localApiData.error) {
              console.log(`API returned error: ${localApiData.error}`);
              // Just continue to Supabase
            }
          } catch (parseError) {
            console.warn("Error parsing local API response:", parseError);
          }
        }
      } catch (localApiError) {
        console.warn("Local API error:", localApiError);
      }
      
      // Fetch recipe data from Supabase as backup
      console.log("Fetching from Supabase as fallback");
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();
      
      // Variable to hold the recipe data, whether from Supabase or fallback
      let finalRecipeData = recipeData;
      
      if (recipeError) {
        // Check if it's a missing table error
        if (recipeError.message && recipeError.message.includes('relation "public.recipes" does not exist')) {
          console.warn('Recipes table does not exist, creating mock recipe data:', recipeError.message);
          
          // Create a basic recipe object to avoid errors - this is fallback, not mock data
          finalRecipeData = {
            id: id,
            title: "Recipe",
            description: "Recipe could not be fully loaded because the database is not available. This is a fallback.",
            created_at: new Date().toISOString(),
            user_id: "system"
          };
        } else {
          console.error('Supabase recipe fetch error:', recipeError.message);
          
          // Try direct API as fallback
          try {
            console.log(`Attempting direct API fallback for recipe ${id}`);
            const directApiRecipe = await fetchRecipeById(id);
            
            if (!directApiRecipe) {
              console.error('Direct API fallback returned no recipe');
              setError('Recipe not found');
              setRecipe(null);
              setLoading(false);
              return;
            }
            
            // Continue with this recipe from direct API
            finalRecipeData = directApiRecipe;
            console.log('Successfully fetched recipe from direct API');
          } catch (apiError) {
            console.error('Direct API fallback also failed:', apiError);
            setError(recipeError.message);
            setRecipe(null);
            setLoading(false);
            return;
          }
        }
      }
      
      // If we have no recipe data by this point, just show an error
      if (!finalRecipeData) {
        console.error('No recipe data available from any source');
        setError('Recipe not found. The database appears to be unavailable and no local data exists.');
        setRecipe(null);
        setLoading(false);
        return;
      }
      
      // Fetch ingredients for this recipe using a more robust approach
      let ingredients = [];
      let ingredientsError = null;
      
      try {
        console.log(`Fetching ingredients for recipe ${id}...`);
        
        // Try using a direct join first for efficiency - it's okay if this fails
        try {
          const joinResult = await supabase
            .from('recipe_ingredients')
            .select(`
              id,
              quantity,
              unit,
              ingredient_id,
              recipe_id,
              ingredients:ingredient_id (id, name, description)
            `)
            .eq('recipe_id', id);
          
          if (!joinResult.error && joinResult.data && joinResult.data.length > 0) {
            console.log(`Successfully fetched ${joinResult.data.length} ingredients with join`);
            ingredients = joinResult.data;
            
            // If join worked, we don't need separate ingredient details
            const ingredientDetails = ingredients.map(item => item.ingredients);
            
            // Transform the data structure to match what the rest of the code expects
            ingredients = ingredients.map(item => ({
              id: item.id,
              quantity: item.quantity,
              unit: item.unit,
              ingredient_id: item.ingredient_id,
              recipe_id: item.recipe_id,
              // Pre-embed the ingredient name and description
              ingredient_name: item.ingredients?.name,
              ingredient_description: item.ingredients?.description
            }));
            
            console.log('Transformed ingredients data from successful join:', 
              ingredients.slice(0, 2).map(i => ({id: i.id, name: i.ingredient_name}))
            );
            
            // Continue with the normal flow - we've already set ingredients
          } else {
            // Join failed, fall back to the separate queries approach
            console.log('Join query failed, falling back to separate queries');
            throw new Error('Join query failed, using fallback');
          }
        } catch (joinErr) {
          // Join attempt failed, fall back to separate queries
          console.log('Using separate queries for ingredients due to:', 
            joinErr instanceof Error ? joinErr.message : 'unknown error'
          );
          
          // Traditional separate query approach
          const result = await supabase
            .from('recipe_ingredients')
            .select(`
              id,
              quantity,
              unit,
              ingredient_id,
              recipe_id
            `)
            .eq('recipe_id', id);
            
          ingredients = result.data || [];
          ingredientsError = result.error;
          
          if (ingredientsError) {
            if (ingredientsError.message && ingredientsError.message.includes('relation "public.recipe_ingredients" does not exist')) {
              console.warn('Recipe ingredients table does not exist:', ingredientsError.message);
            } else {
              console.error('Error fetching ingredients:', ingredientsError.message);
            }
          } else {
            console.log(`Successfully fetched ${ingredients.length} ingredients with separate query`);
          }
        }
      } catch (err) {
        console.error('Exception in ingredient fetching process:', err);
      }
      
      // Fetch ingredient details separately - only if needed
      // (If the join worked, we already have ingredient details)
      let ingredientDetails = [];
      if (ingredients && ingredients.length > 0 && !ingredients[0].ingredient_name) {
        try {
          console.log('Fetching separate ingredient details...');
          const ingredientIds = ingredients
            .map(item => item.ingredient_id)
            .filter(id => id); // Filter out any null/undefined IDs
          
          if (ingredientIds.length === 0) {
            console.warn('No valid ingredient IDs found for lookup');
          } else {
            const { data: ingredientData, error: ingredientDataError } = await supabase
              .from('ingredients')
              .select('id, name, description')
              .in('id', ingredientIds);
              
            if (ingredientDataError) {
              if (ingredientDataError.message && ingredientDataError.message.includes('relation "public.ingredients" does not exist')) {
                console.warn('Ingredients table does not exist:', ingredientDataError.message);
              } else {
                console.error('Error fetching ingredient details:', ingredientDataError.message);
              }
            } else {
              ingredientDetails = ingredientData || [];
              console.log(`Fetched ${ingredientDetails.length} ingredient details separately`);
            }
          }
        } catch (err) {
          console.error('Exception fetching ingredient details:', err);
        }
      } else if (ingredients && ingredients.length > 0 && ingredients[0].ingredient_name) {
        console.log('Skipping separate ingredient details fetch - already have names from join');
      }
      
      // Fetch iterations for this recipe
      let iterations = [];
      try {
        const { data: iterationsData, error: iterationsError } = await supabase
          .from('iterations')
          .select('*')
          .eq('recipe_id', id)
          .order('version', { ascending: false });
        
        if (iterationsError) {
          // Check if this is a missing table error
          if (iterationsError.message && iterationsError.message.includes('relation "public.iterations" does not exist')) {
            console.warn('Iterations table does not exist, skipping iterations:', iterationsError.message);
          } else {
            console.error('Error fetching iterations:', iterationsError.message);
          }
        } else {
          iterations = iterationsData || [];
        }
      } catch (iterErr) {
        console.warn('Exception fetching iterations, using empty set:', iterErr);
      }
      
      // Transform the data to match our expected format
      // First check if we have ingredients from finalRecipeData (might be fallback recipe)
      let transformedIngredients = [];
      
      console.log('Transforming ingredients data...');
      
      // Handle direct JSON ingredient data (from CSV import or fallback recipe)
      if (finalRecipeData.ingredients && Array.isArray(finalRecipeData.ingredients)) {
        console.log('Using ingredients from provided initial recipe data');
        
        // Process ingredients that might be in string JSON format (from CSV import)
        transformedIngredients = finalRecipeData.ingredients.map(ing => {
          // If ing is already in the right format, return it
          if (typeof ing === 'object' && ing !== null) {
            // Generate a random ID if none exists
            if (!ing.id) {
              ing.id = `ing-${Math.random().toString(36).substring(2, 9)}`;
            }
            
            // Ensure we have a recipe_ingredient_id for form compatibility
            if (!ing.recipe_ingredient_id) {
              ing.recipe_ingredient_id = `ri-${Math.random().toString(36).substring(2, 9)}`;
            }
            
            return ing;
          }
          
          // Handle case where ingredient might be a string (shouldn't happen but just in case)
          try {
            if (typeof ing === 'string') {
              const parsed = JSON.parse(ing);
              return {
                id: parsed.id || `ing-${Math.random().toString(36).substring(2, 9)}`,
                name: parsed.name || 'Unknown Ingredient',
                quantity: parsed.quantity || '1',
                unit: parsed.unit || '',
                description: parsed.description || null,
                recipe_ingredient_id: parsed.recipe_ingredient_id || `ri-${Math.random().toString(36).substring(2, 9)}`,
                notes: parsed.notes || null
              };
            }
          } catch (err) {
            console.warn('Error parsing ingredient string:', err);
          }
          
          // Fallback for unparseable ingredients
          return {
            id: `ing-${Math.random().toString(36).substring(2, 9)}`,
            name: typeof ing === 'object' && ing !== null ? ing.name : 'Unknown Ingredient',
            quantity: typeof ing === 'object' && ing !== null ? ing.quantity : '1',
            unit: typeof ing === 'object' && ing !== null ? ing.unit : '',
            description: null,
            recipe_ingredient_id: `ri-${Math.random().toString(36).substring(2, 9)}`,
            notes: null
          };
        });
      } else if (Array.isArray(ingredients) && ingredients.length > 0) {
        // Transform ingredients from database for display
        
        // Check if we already have ingredient names from the join query
        if (ingredients[0].ingredient_name) {
          console.log('Using pre-joined ingredient data for transformation');
          
          transformedIngredients = ingredients.map((item: any) => {
            return {
              id: item.ingredient_id || `unknown-${Date.now()}-${Math.random()}`,
              name: item.ingredient_name || 'Unknown Ingredient',
              description: item.ingredient_description || null,
              quantity: item.quantity || 0,
              unit: item.unit || '',
              recipe_ingredient_id: item.id || 'unknown', // Keep the junction table ID for future updates
              notes: null // Add notes field to match interface
            };
          });
        } else {
          // Using separate queries - look up ingredient details
          console.log('Using separate ingredient details for transformation');
          
          transformedIngredients = ingredients.map((item: any) => {
            // Find matching ingredient details
            const ingredientDetail = Array.isArray(ingredientDetails) 
              ? ingredientDetails.find((detail: any) => detail.id === item.ingredient_id) 
              : null;
            
            const fallbackDetail = { 
              id: item.ingredient_id || `unknown-${Date.now()}-${Math.random()}`, 
              name: 'Unknown Ingredient', 
              description: null 
            };
            
            return {
              id: ingredientDetail?.id || fallbackDetail.id,
              name: ingredientDetail?.name || fallbackDetail.name,
              description: ingredientDetail?.description || fallbackDetail.description,
              quantity: item.quantity || 0,
              unit: item.unit || '',
              recipe_ingredient_id: item.id || 'unknown', // Keep the junction table ID for future updates
              notes: null // Add notes field to match interface
            };
          });
        }
      } else {
        // Check if this is a system-provided fallback recipe that should have ingredients
        if (finalRecipeData && finalRecipeData.user_id === 'system') {
          console.log('No ingredients available but this is a system fallback recipe');
          transformedIngredients = [];
        } else {
          // No ingredients found from any source - display placeholders but with warning info
          console.log('No ingredients available, providing fallback indicators');
          transformedIngredients = [
            { 
              id: `empty-indicator-${Date.now()}`, 
              name: 'No ingredients available', 
              description: 'The ingredients for this recipe could not be loaded',
              quantity: 0, 
              unit: '', 
              recipe_ingredient_id: `emergency-${Date.now()}`,
              notes: 'Try refreshing the recipe data'
            }
          ];
        }
      }
      
      console.log(`Transformed ${transformedIngredients.length} ingredients for display`);
      
      // Sort ingredients by name for consistent display
      if (transformedIngredients.length > 1) {
        transformedIngredients.sort((a, b) => {
          if (a.name && b.name) {
            return a.name.localeCompare(b.name);
          }
          return 0;
        });
      }
      
      // Use finalRecipeData instead of recipeData to construct complete recipe
      const completeRecipe = {
        ...finalRecipeData,
        ingredients: transformedIngredients,
        iterations: iterations || []
      };
      
      console.log('Final recipe data prepared:', {
        id: completeRecipe.id,
        title: completeRecipe.title,
        ingredientsCount: completeRecipe.ingredients.length,
        iterationsCount: completeRecipe.iterations.length
      });
      
      setRecipe(completeRecipe);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch recipe';
      console.error('Error in recipe fetch process:', err);
      setRecipe(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]); // This is the dependency array for fetchRecipe

  useEffect(() => {
    console.log(`useRecipe effect triggered for recipe ID: ${id}, initialData: ${initialRecipeData ? 'provided' : 'none'}`);
    
    // Handle no ID case
    if (!id) {
      console.log('No recipe ID provided, clearing recipe data');
      setRecipe(null);
      setLoading(false);
      setError('No recipe ID provided');
      return; // Exit early
    }
    
    // We have an ID - set up recipe data
    console.log(`Setting up recipe data for ID: ${id}`);
    
    // Set initial state
    setLoading(!initialRecipeData); // Only show loading if we don't have initial data
    if (initialRecipeData) {
      setRecipe(initialRecipeData);
      console.log('Using initial recipe data:', initialRecipeData.title);
    } else {
      setRecipe(null);
    }
    setError(null);
    
    // Always fetch fresh data when the component mounts or ID changes
    fetchRecipe();
    
    // Set up realtime subscription for this recipe
    const channel = supabase
      .channel(`recipe-${id}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recipes', filter: `id=eq.${id}` },
        () => {
          console.log(`Realtime update received for recipe ${id}, refreshing data`);
          fetchRecipe();
        }
      )
      .subscribe();
    
    // Cleanup subscription on unmount or ID change
    return () => {
      console.log(`Cleaning up subscription for recipe ${id}`);
      supabase.removeChannel(channel);
    };
  }, [id, initialRecipeData, fetchRecipe]); // Include all dependencies

  const updateRecipe = useCallback(async (updates: RecipeUpdate) => {
    if (!id) {
      throw new Error('No recipe ID provided');
    }
    
    const previousRecipe = recipe;
    
    // Optimistic update
    setRecipe((prev) => prev ? { 
      ...prev, 
      ...updates, 
      updated_at: new Date().toISOString() 
    } : null);
    
    try {
      // Update in Supabase
      const { error: updateError } = await supabase
        .from('recipes')
        .update({
          title: updates.title,
          description: updates.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (updateError) {
        console.error('Error updating recipe:', updateError.message);
        setError(updateError.message);
        // Rollback optimistic update
        setRecipe(previousRecipe);
        throw updateError;
      }
      
      // Update was successful, fetch the updated record
      const { data: updatedData, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching updated recipe:', fetchError.message);
        setError(fetchError.message);
        return null;
      }
      
      // Update recipe in state with fetched data
      const updatedRecipe = {
        ...updatedData,
        ingredients: recipe?.ingredients || [],
        iterations: recipe?.iterations || []
      };
      
      setRecipe(updatedRecipe as RecipeWithIngredientsAndIterations);
      setError(null);
      return updatedRecipe;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update recipe';
      console.error('Error updating recipe:', err);
      setError(message);
      setRecipe(previousRecipe);
      throw err;
    }
  }, [id, recipe]);

  // Add delete recipe functionality
  const deleteRecipe = useCallback(async () => {
    if (!id) {
      throw new Error('No recipe ID provided');
    }
    
    try {
      console.log(`Deleting recipe ${id}...`);
      
      // First delete related data in recipe_ingredients
      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id);
      
      if (ingredientsError) {
        console.error('Error deleting recipe ingredients:', ingredientsError.message);
        setError(`Failed to delete ingredients: ${ingredientsError.message}`);
        throw ingredientsError;
      }
      
      // Delete related iterations if they exist
      try {
        const { error: iterationsError } = await supabase
          .from('iterations')
          .delete()
          .eq('recipe_id', id);
        
        if (iterationsError && !iterationsError.message.includes('does not exist')) {
          console.error('Error deleting recipe iterations:', iterationsError.message);
        }
      } catch (err) {
        // Ignore errors with iterations table
        console.log('Skipping iterations deletion - table might not exist');
      }
      
      // Now delete the recipe itself
      const { error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('Error deleting recipe:', deleteError.message);
        setError(`Failed to delete recipe: ${deleteError.message}`);
        throw deleteError;
      }
      
      // Clear recipe from state
      setRecipe(null);
      setError(null);
      console.log(`Successfully deleted recipe ${id}`);
      
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete recipe';
      console.error('Error in delete process:', err);
      setError(message);
      throw err;
    }
  }, [id, supabase]);

  return { recipe, loading, error, updateRecipe, deleteRecipe, refetch: fetchRecipe };
}