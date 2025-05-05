/**
 * Context7 MCP Hook
 * 
 * This hook provides access to the Context7 MCP service for library documentation.
 */

import { useState, useEffect, useCallback } from 'react';
import { getMcpAdapter } from '../lib/mcp/adapters';
import type { 
  DocumentationResult, 
  SearchResult, 
  ValidationResult 
} from '../lib/mcp/adapters';

/**
 * Options for the useContext7Mcp hook
 */
interface UseContext7McpOptions {
  autoConnect?: boolean;
  token?: string;
}

/**
 * Hook for using the Context7 MCP service
 */
export default function useContext7Mcp(options: UseContext7McpOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Get or create the Context7 MCP adapter
  const getAdapter = useCallback(() => {
    try {
      return getMcpAdapter('context7', {
        token: options.token
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  }, [options.token]);
  
  // Connect to the Context7 MCP service
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const adapter = getAdapter();
      if (!adapter) {
        throw new Error('Failed to create Context7 MCP adapter');
      }
      
      await adapter.connect();
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [getAdapter]);
  
  // Disconnect from the Context7 MCP service
  const disconnect = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const adapter = getAdapter();
      if (adapter) {
        await adapter.disconnect();
      }
      setIsConnected(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [getAdapter]);
  
  // Get documentation for a library
  const getDocumentation = useCallback(async (
    library: string,
    version: string = 'latest',
    topic: string | null = null
  ): Promise<DocumentationResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const adapter = getAdapter();
      if (!adapter) {
        throw new Error('Context7 MCP adapter is not available');
      }
      
      if (!isConnected) {
        await adapter.connect();
        setIsConnected(true);
      }
      
      const result = await adapter.executeFunction<DocumentationResult>('getDocumentation', {
        library,
        version,
        topic
      });
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getAdapter, isConnected]);
  
  // Search for documentation across libraries
  const search = useCallback(async (
    query: string,
    libraries: string[] = []
  ): Promise<SearchResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const adapter = getAdapter();
      if (!adapter) {
        throw new Error('Context7 MCP adapter is not available');
      }
      
      if (!isConnected) {
        await adapter.connect();
        setIsConnected(true);
      }
      
      return await adapter.executeFunction<SearchResult>('search', {
        query,
        libraries: libraries.length > 0 ? libraries : undefined
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getAdapter, isConnected]);
  
  // Get examples for a library
  const getExamples = useCallback(async (
    library: string,
    version: string = 'latest',
    topic: string
  ): Promise<{ examples: any[] }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const adapter = getAdapter();
      if (!adapter) {
        throw new Error('Context7 MCP adapter is not available');
      }
      
      if (!isConnected) {
        await adapter.connect();
        setIsConnected(true);
      }
      
      return await adapter.executeFunction<{ examples: any[] }>('getExamples', {
        library,
        version,
        topic
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getAdapter, isConnected]);
  
  // Validate code against API documentation
  const validate = useCallback(async (
    code: string,
    library: string,
    version: string = 'latest'
  ): Promise<ValidationResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const adapter = getAdapter();
      if (!adapter) {
        throw new Error('Context7 MCP adapter is not available');
      }
      
      if (!isConnected) {
        await adapter.connect();
        setIsConnected(true);
      }
      
      return await adapter.executeFunction<ValidationResult>('validate', {
        code,
        library,
        version
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getAdapter, isConnected]);
  
  // Get available libraries
  const getLibraries = useCallback(async (): Promise<string[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const adapter = getAdapter();
      if (!adapter) {
        throw new Error('Context7 MCP adapter is not available');
      }
      
      if (!isConnected) {
        await adapter.connect();
        setIsConnected(true);
      }
      
      return await adapter.executeFunction<string[]>('getLibraries', {});
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getAdapter, isConnected]);
  
  // Connect automatically if autoConnect option is true
  useEffect(() => {
    if (options.autoConnect) {
      connect();
    }
    
    // Disconnect when component unmounts
    return () => {
      disconnect();
    };
  }, [connect, disconnect, options.autoConnect]);
  
  return {
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    getDocumentation,
    search,
    getExamples,
    validate,
    getLibraries
  };
}