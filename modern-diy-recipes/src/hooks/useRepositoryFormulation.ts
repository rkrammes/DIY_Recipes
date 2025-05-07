"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FormulationRepository, 
  Formulation,
  FormulationWithIngredientsAndVersions,
  TransformedIngredient
} from '@/lib/data';

interface UseRepositoryFormulationOptions {
  enableRealtime?: boolean;
  useFallbackData?: boolean;
  initialData?: FormulationWithIngredientsAndVersions | null;
}

/**
 * Hook for managing a DIY formulation using the repository pattern
 */
export function useRepositoryFormulation(
  id: string | null, 
  options: UseRepositoryFormulationOptions = {}
) {
  // Create options with defaults
  const hookOptions = {
    enableRealtime: options.enableRealtime ?? true,
    useFallbackData: options.useFallbackData ?? true,
    initialData: options.initialData
  };
  
  // Create the repository instance
  const repository = useMemo(() => new FormulationRepository({
    enableRealtime: hookOptions.enableRealtime,
    useFallbackData: hookOptions.useFallbackData
  }), [hookOptions.enableRealtime, hookOptions.useFallbackData]);
  
  // State for the formulation data
  const [formulation, setFormulation] = useState<FormulationWithIngredientsAndVersions | null>(
    hookOptions.initialData || null
  );
  const [loading, setLoading] = useState<boolean>(!hookOptions.initialData);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch the formulation data
  const fetchFormulation = useCallback(async () => {
    if (!id) {
      setFormulation(null);
      setLoading(false);
      setError('No formulation ID provided');
      return;
    }
    
    console.log(`Fetching formulation ${id} using repository`);
    setLoading(true);
    
    try {
      const { data, error } = await repository.getWithIngredients(id);
      
      if (error) {
        console.error('Error fetching formulation:', error);
        setError(error instanceof Error ? error.message : String(error));
        setFormulation(null);
      } else {
        setFormulation(data);
        setError(null);
      }
    } catch (err) {
      console.error('Exception in useRepositoryFormulation:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setFormulation(null);
    } finally {
      setLoading(false);
    }
  }, [id, repository]);
  
  // Update formulation data
  const updateFormulation = useCallback(async (updates: Partial<Formulation>) => {
    if (!id) {
      throw new Error('No formulation ID provided');
    }
    
    if (!formulation) {
      throw new Error('No formulation data to update');
    }
    
    // Optimistic update
    const previousFormulation = formulation;
    setFormulation(prev => prev ? { ...prev, ...updates } : null);
    
    try {
      const { data, error } = await repository.update(id, updates);
      
      if (error) {
        console.error('Error updating formulation:', error);
        setError(error instanceof Error ? error.message : String(error));
        // Rollback optimistic update
        setFormulation(previousFormulation);
        throw error;
      }
      
      // Refresh the formulation data to ensure we have the latest
      fetchFormulation();
      return data;
    } catch (err) {
      console.error('Exception in updateFormulation:', err);
      // Rollback optimistic update
      setFormulation(previousFormulation);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }, [id, formulation, repository, fetchFormulation]);
  
  // Delete formulation
  const deleteFormulation = useCallback(async () => {
    if (!id) {
      throw new Error('No formulation ID provided');
    }
    
    try {
      const { data, error } = await repository.delete(id);
      
      if (error) {
        console.error('Error deleting formulation:', error);
        setError(error instanceof Error ? error.message : String(error));
        throw error;
      }
      
      setFormulation(null);
      setError(null);
      return data;
    } catch (err) {
      console.error('Exception in deleteFormulation:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }, [id, repository]);
  
  // Add ingredient to formulation
  const addIngredient = useCallback(async (
    ingredientId: string,
    quantity: number,
    unit: string,
    notes?: string
  ) => {
    if (!id) {
      throw new Error('No formulation ID provided');
    }
    
    try {
      const { data, error } = await repository.addIngredient({
        formulationId: id,
        ingredientId,
        quantity,
        unit,
        notes
      });
      
      if (error) {
        console.error('Error adding ingredient:', error);
        setError(error instanceof Error ? error.message : String(error));
        throw error;
      }
      
      // Refresh the formulation data
      fetchFormulation();
      return data;
    } catch (err) {
      console.error('Exception in addIngredient:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }, [id, repository, fetchFormulation]);
  
  // Update ingredient in formulation
  const updateIngredient = useCallback(async (
    recipeIngredientId: string,
    updates: {
      quantity?: number;
      unit?: string;
      notes?: string;
    }
  ) => {
    if (!id) {
      throw new Error('No formulation ID provided');
    }
    
    try {
      const { data, error } = await repository.updateIngredient(recipeIngredientId, {
        formulationId: id,
        ...updates
      });
      
      if (error) {
        console.error('Error updating ingredient:', error);
        setError(error instanceof Error ? error.message : String(error));
        throw error;
      }
      
      // Refresh the formulation data
      fetchFormulation();
      return data;
    } catch (err) {
      console.error('Exception in updateIngredient:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }, [id, repository, fetchFormulation]);
  
  // Remove ingredient from formulation
  const removeIngredient = useCallback(async (recipeIngredientId: string) => {
    try {
      const { data, error } = await repository.removeIngredient(recipeIngredientId);
      
      if (error) {
        console.error('Error removing ingredient:', error);
        setError(error instanceof Error ? error.message : String(error));
        throw error;
      }
      
      // Refresh the formulation data
      fetchFormulation();
      return data;
    } catch (err) {
      console.error('Exception in removeIngredient:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }, [repository, fetchFormulation]);
  
  // Create new version of formulation
  const createVersion = useCallback(async (versionData: {
    title: string;
    description?: string;
    notes?: string;
    metrics?: Record<string, number>;
    instructions?: string;
  }) => {
    if (!id) {
      throw new Error('No formulation ID provided');
    }
    
    try {
      const { data, error } = await repository.createVersion(id, versionData);
      
      if (error) {
        console.error('Error creating version:', error);
        setError(error instanceof Error ? error.message : String(error));
        throw error;
      }
      
      // Refresh the formulation data
      fetchFormulation();
      return data;
    } catch (err) {
      console.error('Exception in createVersion:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }, [id, repository, fetchFormulation]);
  
  // Update version of formulation
  const updateVersion = useCallback(async (
    versionId: string,
    updates: {
      title?: string;
      description?: string;
      notes?: string;
      metrics?: Record<string, number>;
      instructions?: string;
    }
  ) => {
    try {
      const { data, error } = await repository.updateVersion(versionId, updates);
      
      if (error) {
        console.error('Error updating version:', error);
        setError(error instanceof Error ? error.message : String(error));
        throw error;
      }
      
      // Refresh the formulation data
      fetchFormulation();
      return data;
    } catch (err) {
      console.error('Exception in updateVersion:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }, [repository, fetchFormulation]);
  
  // Delete version of formulation
  const deleteVersion = useCallback(async (versionId: string) => {
    try {
      const { data, error } = await repository.deleteVersion(versionId);
      
      if (error) {
        console.error('Error deleting version:', error);
        setError(error instanceof Error ? error.message : String(error));
        throw error;
      }
      
      // Refresh the formulation data
      fetchFormulation();
      return data;
    } catch (err) {
      console.error('Exception in deleteVersion:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }, [repository, fetchFormulation]);
  
  // Effect to fetch formulation data and set up realtime subscription
  useEffect(() => {
    if (!id) {
      setFormulation(null);
      setLoading(false);
      setError('No formulation ID provided');
      return;
    }
    
    // Set initial state
    setLoading(!hookOptions.initialData);
    setFormulation(hookOptions.initialData || null);
    setError(null);
    
    // Fetch formulation data
    fetchFormulation();
    
    // Set up realtime subscription
    let unsubscribe = { unsubscribe: () => {} };
    
    if (hookOptions.enableRealtime) {
      unsubscribe = repository.subscribeToRecord(id, () => {
        console.log(`Realtime update received for formulation ${id}`);
        fetchFormulation();
      });
    }
    
    // Clean up subscription
    return () => {
      unsubscribe.unsubscribe();
    };
  }, [id, repository, fetchFormulation, hookOptions.initialData, hookOptions.enableRealtime]);
  
  return {
    formulation,
    loading,
    error,
    updateFormulation,
    deleteFormulation,
    refetch: fetchFormulation,
    addIngredient,
    updateIngredient,
    removeIngredient,
    createVersion,
    updateVersion,
    deleteVersion
  };
}