"use client";  // Ensure this is a Client Component

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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

    setLoading(true);
    try {
      // Fetch recipe data from Supabase
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (recipeError) {
        console.error('Supabase recipe fetch error:', recipeError.message);
        setError(recipeError.message);
        setRecipe(null);
        setLoading(false);
        return;
      }
      
      // Fetch ingredients for this recipe
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .select(`
          id,
          quantity,
          unit,
          ingredients:ingredient_id (id, name, description)
        `)
        .eq('recipe_id', id);
      
      if (ingredientsError) {
        console.error('Error fetching ingredients:', ingredientsError.message);
      }
      
      // Fetch iterations for this recipe
      const { data: iterations, error: iterationsError } = await supabase
        .from('iterations')
        .select('*')
        .eq('recipe_id', id)
        .order('version', { ascending: false });
      
      if (iterationsError) {
        console.error('Error fetching iterations:', iterationsError.message);
      }
      
      // Transform the data to match our expected format
      const transformedIngredients = ingredients?.map((item: any) => ({
        id: item.ingredients.id,
        name: item.ingredients.name,
        description: item.ingredients.description,
        quantity: item.quantity,
        unit: item.unit
      })) || [];
      
      const completeRecipe = {
        ...recipeData,
        ingredients: transformedIngredients,
        iterations: iterations || []
      };
      
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
  }, [id]);

  useEffect(() => {
    if (!initialRecipeData && id) {
      fetchRecipe();
    } else if (!id) {
      setRecipe(null);
      setLoading(false);
      setError('No recipe ID provided');
    } else {
      setLoading(false);
    }
    
    // Set up realtime subscription for this recipe if we have an ID
    let channel;
    if (id) {
      channel = supabase
        .channel(`recipe-${id}-changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'recipes', filter: `id=eq.${id}` },
          () => {
            fetchRecipe();
          }
        )
        .subscribe();
    }
    
    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [id, initialRecipeData, fetchRecipe]);

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

  return { recipe, loading, error, updateRecipe, refetch: fetchRecipe };
}