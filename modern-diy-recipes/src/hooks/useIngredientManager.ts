'use client';

import { useState } from 'react';
import type { Ingredient } from '@/types/models';
import { useIngredients } from './useIngredients';

/**
 * Hook for managing ingredients with Supabase integration
 * 
 * @returns Ingredient management functions and state
 */
export function useIngredientManager() {
  const { ingredients, loading, error, refetch } = useIngredients();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [operationStatus, setOperationStatus] = useState<{
    loading: boolean;
    error: string | null;
    success: boolean;
  }>({
    loading: false,
    error: null,
    success: false
  });

  /**
   * Create a new ingredient
   * 
   * @param ingredient Ingredient data
   */
  const createIngredient = async (ingredient: Omit<Ingredient, 'id' | 'created_at'>) => {
    setOperationStatus({ loading: true, error: null, success: false });
    
    try {
      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ingredient)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create ingredient: ${response.statusText}`);
      }
      
      // Refetch ingredients
      await refetch();
      setOperationStatus({ loading: false, error: null, success: true });
      return true;
    } catch (error) {
      setOperationStatus({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to create ingredient', 
        success: false 
      });
      return false;
    }
  };

  /**
   * Update an existing ingredient
   * 
   * @param id Ingredient ID
   * @param ingredient Updated ingredient data
   */
  const updateIngredient = async (id: string, ingredient: Partial<Omit<Ingredient, 'id' | 'created_at'>>) => {
    setOperationStatus({ loading: true, error: null, success: false });
    
    try {
      const response = await fetch(`/api/ingredients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ingredient)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update ingredient: ${response.statusText}`);
      }
      
      // Refetch ingredients
      await refetch();
      setOperationStatus({ loading: false, error: null, success: true });
      return true;
    } catch (error) {
      setOperationStatus({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to update ingredient', 
        success: false 
      });
      return false;
    }
  };

  /**
   * Delete an ingredient
   * 
   * @param id Ingredient ID
   */
  const deleteIngredient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ingredient?')) {
      return false;
    }
    
    setOperationStatus({ loading: true, error: null, success: false });
    
    try {
      const response = await fetch(`/api/ingredients/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete ingredient: ${response.statusText}`);
      }
      
      // Refetch ingredients
      await refetch();
      setOperationStatus({ loading: false, error: null, success: true });
      return true;
    } catch (error) {
      setOperationStatus({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to delete ingredient', 
        success: false 
      });
      return false;
    }
  };

  /**
   * Start adding a new ingredient
   */
  const startAddIngredient = () => {
    setSelectedIngredient(null);
    setIsAdding(true);
    setIsEditing(false);
  };

  /**
   * Start editing an existing ingredient
   * 
   * @param ingredient Ingredient to edit
   */
  const startEditIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsEditing(true);
    setIsAdding(false);
  };

  /**
   * Cancel adding or editing
   */
  const cancelOperation = () => {
    setIsAdding(false);
    setIsEditing(false);
    setSelectedIngredient(null);
    setOperationStatus({ loading: false, error: null, success: false });
  };

  return {
    // State
    ingredients,
    loading,
    error,
    isAdding,
    isEditing,
    selectedIngredient,
    operationStatus,
    
    // Actions
    createIngredient,
    updateIngredient,
    deleteIngredient,
    startAddIngredient,
    startEditIngredient,
    cancelOperation,
    refetch
  };
}