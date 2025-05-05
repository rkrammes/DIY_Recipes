/**
 * Supabase MCP Hook
 * 
 * This hook provides access to the Supabase MCP server.
 */

import { useState, useEffect, useCallback } from 'react';
import SupabaseMcpAdapter from '../lib/mcp/adapters/supabaseMcpAdapter';
import type { 
  DbSelectParams, 
  DbInsertParams, 
  DbUpdateParams, 
  DbDeleteParams 
} from '../lib/mcp/adapters/supabaseMcpAdapter';

// Type for recipe data
interface Recipe {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  [key: string]: any;
}

// Type for ingredient data
interface Ingredient {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  [key: string]: any;
}

export function useSupabaseMcp() {
  const [adapter, setAdapter] = useState<SupabaseMcpAdapter | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the adapter
  useEffect(() => {
    const initAdapter = async () => {
      try {
        // Get the port from environment or use default
        const mcpPort = process.env.NEXT_PUBLIC_MCP_SUPABASE_PORT || 3002;
        
        console.log(`Initializing Supabase MCP adapter on port ${mcpPort}`);
        
        // Create a new Supabase MCP adapter
        const newAdapter = new SupabaseMcpAdapter({
          port: Number(mcpPort),
          serverPath: '../../supabase_mcp_config.toml' // Path to the config file
        });

        setAdapter(newAdapter);
      } catch (err) {
        console.error('Failed to initialize Supabase MCP adapter:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Supabase MCP adapter');
      }
    };

    initAdapter();

    // Clean up adapter on unmount
    return () => {
      if (adapter && isConnected) {
        adapter.disconnect().catch(console.error);
      }
    };
  }, []);

  // Connect to the MCP server
  const connect = useCallback(async () => {
    if (!adapter) {
      setError('Adapter not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await adapter.connect();
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to connect to Supabase MCP server:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to Supabase MCP server');
    } finally {
      setIsLoading(false);
    }
  }, [adapter]);

  // Disconnect from the MCP server
  const disconnect = useCallback(async () => {
    if (!adapter || !isConnected) {
      return;
    }

    setIsLoading(true);

    try {
      await adapter.disconnect();
      setIsConnected(false);
    } catch (err) {
      console.error('Failed to disconnect from Supabase MCP server:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect from Supabase MCP server');
    } finally {
      setIsLoading(false);
    }
  }, [adapter, isConnected]);

  // Helper function to fetch recipes
  const fetchRecipes = useCallback(async (): Promise<Recipe[]> => {
    if (!adapter) {
      throw new Error('Adapter not initialized');
    }

    if (!isConnected) {
      await connect();
    }

    try {
      return await adapter.select<Recipe>({
        table: 'recipes',
        columns: '*',
        options: {
          order: {
            column: 'created_at',
            ascending: false
          }
        }
      });
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
      throw err;
    }
  }, [adapter, isConnected, connect]);

  // Helper function to fetch ingredients
  const fetchIngredients = useCallback(async (): Promise<Ingredient[]> => {
    if (!adapter) {
      throw new Error('Adapter not initialized');
    }

    if (!isConnected) {
      await connect();
    }

    try {
      return await adapter.select<Ingredient>({
        table: 'ingredients',
        columns: '*',
        options: {
          order: {
            column: 'created_at',
            ascending: false
          }
        }
      });
    } catch (err) {
      console.error('Failed to fetch ingredients:', err);
      throw err;
    }
  }, [adapter, isConnected, connect]);

  // Helper function to fetch a recipe by ID
  const fetchRecipeById = useCallback(async (id: string): Promise<Recipe | null> => {
    if (!adapter) {
      throw new Error('Adapter not initialized');
    }

    if (!isConnected) {
      await connect();
    }

    try {
      const recipes = await adapter.select<Recipe>({
        table: 'recipes',
        columns: '*',
        filter: { id }
      });

      return recipes.length > 0 ? recipes[0] : null;
    } catch (err) {
      console.error(`Failed to fetch recipe with ID ${id}:`, err);
      throw err;
    }
  }, [adapter, isConnected, connect]);

  // Helper function to execute a SQL query
  const executeQuery = useCallback(async (sql: string): Promise<any[]> => {
    if (!adapter) {
      throw new Error('Adapter not initialized');
    }

    if (!isConnected) {
      await connect();
    }

    try {
      return await adapter.executeFunction('query_data', { sql });
    } catch (err) {
      console.error('Failed to execute query:', err);
      throw err;
    }
  }, [adapter, isConnected, connect]);

  return {
    adapter,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    fetchRecipes,
    fetchIngredients,
    fetchRecipeById,
    executeQuery
  };
}