'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  SimplifiedSupabaseMcpAdapter, 
  User, 
  Session 
} from '../lib/mcp/adapters/simplifiedSupabaseMcpAdapter';

/**
 * Hook for interacting with the Supabase MCP server using the simplified adapter
 */
export function useSimplifiedSupabaseMcp() {
  const [adapter, setAdapter] = useState<SimplifiedSupabaseMcpAdapter | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the adapter
  useEffect(() => {
    const initAdapter = () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_MCP_API_URL || '/api/mcp';
        console.log(`Initializing Simplified Supabase MCP adapter with API URL: ${apiUrl}`);
        
        const newAdapter = new SimplifiedSupabaseMcpAdapter({
          apiUrl
        });

        setAdapter(newAdapter);
      } catch (err) {
        console.error('Failed to initialize Simplified Supabase MCP adapter:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize adapter');
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
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await adapter.connect();
      setIsConnected(true);
      return result;
    } catch (err) {
      console.error('Failed to connect to Supabase MCP server:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to server');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [adapter]);

  // Disconnect from the MCP server
  const disconnect = useCallback(async () => {
    if (!adapter || !isConnected) {
      return true;
    }

    setIsLoading(true);

    try {
      const result = await adapter.disconnect();
      setIsConnected(false);
      return result;
    } catch (err) {
      console.error('Failed to disconnect from Supabase MCP server:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect from server');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [adapter, isConnected]);

  // Authenticate a user
  const authenticate = useCallback(async (email: string, password: string): Promise<Session | null> => {
    if (!adapter) {
      throw new Error('Adapter not initialized');
    }

    if (!isConnected) {
      await connect();
    }

    try {
      return await adapter.authenticate(email, password);
    } catch (err) {
      console.error('Authentication failed:', err);
      throw err;
    }
  }, [adapter, isConnected, connect]);

  // Execute a query
  const executeQuery = useCallback(async (sql: string): Promise<any[]> => {
    if (!adapter) {
      throw new Error('Adapter not initialized');
    }

    if (!isConnected) {
      await connect();
    }

    try {
      return await adapter.executeQuery(sql);
    } catch (err) {
      console.error('Query execution failed:', err);
      throw err;
    }
  }, [adapter, isConnected, connect]);

  // Get available tools
  const getAvailableTools = useCallback(async (): Promise<string[]> => {
    if (!adapter) {
      throw new Error('Adapter not initialized');
    }

    try {
      if (!isConnected) {
        await connect();
      }

      const response = await fetch('/api/mcp');
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      return data.tools || [];
    } catch (err) {
      console.error('Failed to get available tools:', err);
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
    authenticate,
    executeQuery,
    getAvailableTools
  };
}