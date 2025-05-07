"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FormulationRepository, 
  Formulation,
  FormulationWithIngredientsAndVersions,
  getFormulationRepository
} from '@/lib/data';

interface UseFormulationRepositoryOptions {
  enableRealtime?: boolean;
  useFallbackData?: boolean;
  initialData?: FormulationWithIngredientsAndVersions | null;
  cacheResults?: boolean;
}

/**
 * Enhanced hook for accessing the formulation repository
 * This hook uses the repository factory pattern for better 
 * performance and consistency.
 */
export function useFormulationRepository(options: UseFormulationRepositoryOptions = {}) {
  // Create options with defaults
  const hookOptions = {
    enableRealtime: options.enableRealtime ?? true,
    useFallbackData: options.useFallbackData ?? true,
    initialData: options.initialData,
    cacheResults: options.cacheResults ?? true
  };
  
  // Create the repository instance using the factory
  const repository = useMemo(() => 
    getFormulationRepository({
      enableRealtime: hookOptions.enableRealtime,
      useFallbackData: hookOptions.useFallbackData
    }), 
    [hookOptions.enableRealtime, hookOptions.useFallbackData]
  );
  
  // Optional cache for results
  const [resultsCache] = useState<Map<string, any>>(new Map());
  
  // Helper function to handle caching
  const withCache = useCallback(<T>(
    key: string, 
    fetchFn: () => Promise<T>
  ): Promise<T> => {
    if (!hookOptions.cacheResults) {
      return fetchFn();
    }
    
    // Check cache first
    if (resultsCache.has(key)) {
      return Promise.resolve(resultsCache.get(key));
    }
    
    // Otherwise fetch and cache
    return fetchFn().then(result => {
      resultsCache.set(key, result);
      return result;
    });
  }, [hookOptions.cacheResults, resultsCache]);
  
  // Get all formulations
  const getAllFormulations = useCallback(async (filters?: Record<string, any>) => {
    try {
      const cacheKey = `all_formulations_${JSON.stringify(filters || {})}`;
      
      return await withCache(cacheKey, async () => {
        return repository.getAll({ filters });
      });
    } catch (error) {
      console.error('Error fetching formulations:', error);
      throw error;
    }
  }, [repository, withCache]);
  
  // Get a single formulation with ingredients and versions
  const getFormulation = useCallback(async (id: string) => {
    try {
      const cacheKey = `formulation_${id}`;
      
      return await withCache(cacheKey, async () => {
        return repository.getWithIngredients(id);
      });
    } catch (error) {
      console.error(`Error fetching formulation ${id}:`, error);
      throw error;
    }
  }, [repository, withCache]);
  
  // Create a new formulation
  const createFormulation = useCallback(async (data: Partial<Formulation>) => {
    try {
      const result = await repository.create(data);
      
      // Clear cache after creating
      if (hookOptions.cacheResults) {
        resultsCache.clear();
      }
      
      return result;
    } catch (error) {
      console.error('Error creating formulation:', error);
      throw error;
    }
  }, [repository, hookOptions.cacheResults, resultsCache]);
  
  // Update a formulation
  const updateFormulation = useCallback(async (id: string, data: Partial<Formulation>) => {
    try {
      const result = await repository.update(id, data);
      
      // Clear specific cache entries after updating
      if (hookOptions.cacheResults) {
        resultsCache.delete(`formulation_${id}`);
        resultsCache.delete('all_formulations_{}');
      }
      
      return result;
    } catch (error) {
      console.error(`Error updating formulation ${id}:`, error);
      throw error;
    }
  }, [repository, hookOptions.cacheResults, resultsCache]);
  
  // Delete a formulation
  const deleteFormulation = useCallback(async (id: string) => {
    try {
      const result = await repository.delete(id);
      
      // Clear specific cache entries after deleting
      if (hookOptions.cacheResults) {
        resultsCache.delete(`formulation_${id}`);
        resultsCache.delete('all_formulations_{}');
      }
      
      return result;
    } catch (error) {
      console.error(`Error deleting formulation ${id}:`, error);
      throw error;
    }
  }, [repository, hookOptions.cacheResults, resultsCache]);
  
  // Manage formulation ingredients with improved error handling
  const ingredientActions = useMemo(() => ({
    add: async (formulationId: string, ingredientId: string, quantity: number, unit: string, notes?: string) => {
      try {
        const result = await repository.addIngredient({
          formulationId,
          ingredientId,
          quantity,
          unit,
          notes
        });
        
        // Clear specific cache entries
        if (hookOptions.cacheResults) {
          resultsCache.delete(`formulation_${formulationId}`);
        }
        
        return result;
      } catch (error) {
        console.error('Error adding ingredient:', error);
        throw error;
      }
    },
    
    update: async (recipeIngredientId: string, formulationId: string, updates: {
      quantity?: number;
      unit?: string;
      notes?: string;
    }) => {
      try {
        const result = await repository.updateIngredient(recipeIngredientId, {
          formulationId,
          ...updates
        });
        
        // Clear specific cache entries
        if (hookOptions.cacheResults) {
          resultsCache.delete(`formulation_${formulationId}`);
        }
        
        return result;
      } catch (error) {
        console.error('Error updating ingredient:', error);
        throw error;
      }
    },
    
    remove: async (recipeIngredientId: string, formulationId?: string) => {
      try {
        const result = await repository.removeIngredient(recipeIngredientId);
        
        // Clear specific cache entries
        if (hookOptions.cacheResults && formulationId) {
          resultsCache.delete(`formulation_${formulationId}`);
        }
        
        return result;
      } catch (error) {
        console.error('Error removing ingredient:', error);
        throw error;
      }
    }
  }), [repository, hookOptions.cacheResults, resultsCache]);
  
  // Manage formulation versions with improved error handling
  const versionActions = useMemo(() => ({
    create: async (formulationId: string, versionData: {
      title: string;
      description?: string;
      notes?: string;
      metrics?: Record<string, number>;
      instructions?: string;
    }) => {
      try {
        const result = await repository.createVersion(formulationId, versionData);
        
        // Clear specific cache entries
        if (hookOptions.cacheResults) {
          resultsCache.delete(`formulation_${formulationId}`);
        }
        
        return result;
      } catch (error) {
        console.error('Error creating version:', error);
        throw error;
      }
    },
    
    update: async (versionId: string, formulationId: string, updates: {
      title?: string;
      description?: string;
      notes?: string;
      metrics?: Record<string, number>;
      instructions?: string;
    }) => {
      try {
        const result = await repository.updateVersion(versionId, updates);
        
        // Clear specific cache entries
        if (hookOptions.cacheResults) {
          resultsCache.delete(`formulation_${formulationId}`);
        }
        
        return result;
      } catch (error) {
        console.error('Error updating version:', error);
        throw error;
      }
    },
    
    delete: async (versionId: string, formulationId?: string) => {
      try {
        const result = await repository.deleteVersion(versionId);
        
        // Clear specific cache entries
        if (hookOptions.cacheResults && formulationId) {
          resultsCache.delete(`formulation_${formulationId}`);
        }
        
        return result;
      } catch (error) {
        console.error('Error deleting version:', error);
        throw error;
      }
    }
  }), [repository, hookOptions.cacheResults, resultsCache]);
  
  // Function to clear the cache
  const clearCache = useCallback(() => {
    if (hookOptions.cacheResults) {
      resultsCache.clear();
    }
  }, [hookOptions.cacheResults, resultsCache]);
  
  // Return the repository API with enhanced features
  return {
    // Core formulation operations
    getAllFormulations,
    getFormulation,
    createFormulation,
    updateFormulation,
    deleteFormulation,
    
    // Grouped specialized operations
    ingredients: ingredientActions,
    versions: versionActions,
    
    // Cache management
    clearCache,
    
    // Direct repository access
    repository
  };
}

/**
 * Enhanced hook for managing a single formulation's state
 * This hook provides optimistic updates and better error handling
 */
export function useSingleFormulation(
  id: string | null, 
  options: UseFormulationRepositoryOptions = {}
) {
  const [formulation, setFormulation] = useState<FormulationWithIngredientsAndVersions | null>(
    options.initialData || null
  );
  const [loading, setLoading] = useState<boolean>(!options.initialData);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  
  // Get the repository functions with enhanced options
  const { 
    getFormulation,
    updateFormulation,
    deleteFormulation,
    ingredients,
    versions
  } = useFormulationRepository({
    ...options,
    // Disable caching for single formulation to ensure fresh data
    cacheResults: false
  });
  
  // Fetch the formulation data with debouncing
  const fetchFormulation = useCallback(async (force = false) => {
    if (!id) {
      setFormulation(null);
      setLoading(false);
      setError('No formulation ID provided');
      return;
    }
    
    if (loading && !force) {
      // Already loading, mark as stale
      setIsStale(true);
      return;
    }
    
    console.log(`Fetching formulation ${id} using repository factory`);
    setLoading(true);
    
    try {
      const { data, error } = await getFormulation(id);
      
      if (error) {
        console.error('Error fetching formulation:', error);
        setError(error instanceof Error ? error.message : String(error));
        setFormulation(null);
      } else {
        setFormulation(data);
        setError(null);
      }
      
      setIsStale(false);
    } catch (err) {
      console.error('Exception in useSingleFormulation:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setFormulation(null);
    } finally {
      setLoading(false);
      
      // Check if marked as stale during loading
      if (isStale) {
        setIsStale(false);
        // Re-fetch if it became stale
        setTimeout(() => fetchFormulation(true), 50);
      }
    }
  }, [id, getFormulation, loading, isStale]);
  
  // Update the formulation with optimistic updates
  const update = useCallback(async (updates: Partial<Formulation>) => {
    if (!id) {
      throw new Error('No formulation ID provided');
    }
    
    const previousFormulation = formulation;
    
    // Optimistic update
    setFormulation(prev => prev ? { ...prev, ...updates } : null);
    
    try {
      const { data, error } = await updateFormulation(id, updates);
      
      if (error) {
        // Rollback optimistic update
        setFormulation(previousFormulation);
        setError(error instanceof Error ? error.message : String(error));
        throw error;
      }
      
      // Refresh to get the latest data
      fetchFormulation(true);
      setError(null);
      return data;
    } catch (err) {
      // Rollback optimistic update
      setFormulation(previousFormulation);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }, [id, formulation, updateFormulation, fetchFormulation]);
  
  // Delete the formulation with error handling
  const remove = useCallback(async () => {
    if (!id) {
      throw new Error('No formulation ID provided');
    }
    
    try {
      const { data, error } = await deleteFormulation(id);
      
      if (error) {
        setError(error instanceof Error ? error.message : String(error));
        throw error;
      }
      
      setFormulation(null);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  }, [id, deleteFormulation]);
  
  // Enhanced ingredient management functions with optimistic updates
  const ingredientActions = useMemo(() => ({
    add: async (ingredientId: string, quantity: number, unit: string, notes?: string) => {
      if (!id) throw new Error('No formulation ID provided');
      
      // Can't do optimistic update for adding without knowing ingredient details
      
      try {
        const result = await ingredients.add(id, ingredientId, quantity, unit, notes);
        await fetchFormulation(true); // Force refresh after adding ingredient
        return result;
      } catch (error) {
        console.error('Error adding ingredient:', error);
        throw error;
      }
    },
    
    update: async (recipeIngredientId: string, updates: {
      quantity?: number;
      unit?: string;
      notes?: string;
    }) => {
      if (!id) throw new Error('No formulation ID provided');
      if (!formulation) throw new Error('Formulation data not available');
      
      // Find ingredient for optimistic update
      const ingredientToUpdate = formulation.ingredients?.find(
        ing => ing.recipe_ingredient_id === recipeIngredientId
      );
      
      if (ingredientToUpdate && formulation.ingredients) {
        // Create updated ingredients array for optimistic update
        const updatedIngredients = formulation.ingredients.map(ing => 
          ing.recipe_ingredient_id === recipeIngredientId
            ? { ...ing, ...updates }
            : ing
        );
        
        // Apply optimistic update
        setFormulation(prev => prev ? { 
          ...prev, 
          ingredients: updatedIngredients 
        } : null);
      }
      
      try {
        const result = await ingredients.update(recipeIngredientId, id, updates);
        await fetchFormulation(true); // Force refresh for consistency
        return result;
      } catch (error) {
        console.error('Error updating ingredient:', error);
        // Revert optimistic update
        fetchFormulation(true);
        throw error;
      }
    },
    
    remove: async (recipeIngredientId: string) => {
      if (!id) throw new Error('No formulation ID provided');
      if (!formulation) throw new Error('Formulation data not available');
      
      // Apply optimistic update by filtering out the removed ingredient
      if (formulation.ingredients) {
        const updatedIngredients = formulation.ingredients.filter(
          ing => ing.recipe_ingredient_id !== recipeIngredientId
        );
        
        setFormulation(prev => prev ? { 
          ...prev, 
          ingredients: updatedIngredients 
        } : null);
      }
      
      try {
        const result = await ingredients.remove(recipeIngredientId, id);
        await fetchFormulation(true); // Force refresh for consistency
        return result;
      } catch (error) {
        console.error('Error removing ingredient:', error);
        // Revert optimistic update
        fetchFormulation(true);
        throw error;
      }
    }
  }), [id, formulation, ingredients, fetchFormulation]);
  
  // Enhanced version management functions with optimistic updates
  const versionActions = useMemo(() => ({
    create: async (versionData: {
      title: string;
      description?: string;
      notes?: string;
      metrics?: Record<string, number>;
      instructions?: string;
    }) => {
      if (!id) throw new Error('No formulation ID provided');
      
      // Can't do optimistic update for creation without knowing version number
      
      try {
        const result = await versions.create(id, versionData);
        await fetchFormulation(true); // Force refresh after creating version
        return result;
      } catch (error) {
        console.error('Error creating version:', error);
        throw error;
      }
    },
    
    update: async (versionId: string, updates: {
      title?: string;
      description?: string;
      notes?: string;
      metrics?: Record<string, number>;
      instructions?: string;
    }) => {
      if (!id) throw new Error('No formulation ID provided');
      if (!formulation) throw new Error('Formulation data not available');
      
      // Find version for optimistic update
      if (formulation.iterations) {
        const versionToUpdate = formulation.iterations.find(v => v.id === versionId);
        
        if (versionToUpdate) {
          // Create updated versions array for optimistic update
          const updatedVersions = formulation.iterations.map(v => 
            v.id === versionId ? { ...v, ...updates } : v
          );
          
          // Apply optimistic update
          setFormulation(prev => prev ? { 
            ...prev, 
            iterations: updatedVersions 
          } : null);
        }
      }
      
      try {
        const result = await versions.update(versionId, id, updates);
        await fetchFormulation(true); // Force refresh for consistency
        return result;
      } catch (error) {
        console.error('Error updating version:', error);
        // Revert optimistic update
        fetchFormulation(true);
        throw error;
      }
    },
    
    delete: async (versionId: string) => {
      if (!id) throw new Error('No formulation ID provided');
      if (!formulation) throw new Error('Formulation data not available');
      
      // Apply optimistic update by filtering out the removed version
      if (formulation.iterations) {
        const updatedVersions = formulation.iterations.filter(v => v.id !== versionId);
        
        setFormulation(prev => prev ? { 
          ...prev, 
          iterations: updatedVersions 
        } : null);
      }
      
      try {
        const result = await versions.delete(versionId, id);
        await fetchFormulation(true); // Force refresh for consistency
        return result;
      } catch (error) {
        console.error('Error deleting version:', error);
        // Revert optimistic update
        fetchFormulation(true);
        throw error;
      }
    }
  }), [id, formulation, versions, fetchFormulation]);
  
  // Set up initial data fetching and realtime subscription
  useEffect(() => {
    if (!id) {
      setFormulation(null);
      setLoading(false);
      setError('No formulation ID provided');
      return;
    }
    
    // Set initial state
    if (options.initialData) {
      setFormulation(options.initialData);
      setLoading(false);
    } else {
      setLoading(true);
      setFormulation(null);
    }
    
    setError(null);
    
    // Fetch the current data
    fetchFormulation();
    
    // Set up realtime subscription if enabled
    if (options.enableRealtime) {
      const repository = getFormulationRepository({ enableRealtime: true });
      const subscription = repository.subscribeToRecord(id, (payload) => {
        console.log('Realtime update for formulation:', payload);
        // Refresh data when changes are detected
        fetchFormulation(true);
      });
      
      // Clean up subscription
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [id, options.initialData, options.enableRealtime, fetchFormulation]);
  
  // Return the formulation state and actions with enhanced features
  return {
    formulation,
    loading,
    error,
    isStale,
    update,
    delete: remove,
    refetch: fetchFormulation,
    ingredients: ingredientActions,
    versions: versionActions
  };
}