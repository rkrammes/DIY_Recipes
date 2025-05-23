'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMcpAdapter, McpAdapterType, initializeMcpAdapters, McpAdapter } from '../lib/mcp/adapters';

/**
 * MCP Provider context type
 */
interface McpContextType {
  isInitialized: boolean;
  isInitializing: boolean;
  initError: Error | null;
  github: McpAdapter | null;
  puppeteer: McpAdapter | null;
  supabase: McpAdapter | null;
  vercel: McpAdapter | null;
  initialize: () => Promise<void>;
}

/**
 * Create context with default values
 */
const McpContext = createContext<McpContextType>({
  isInitialized: false,
  isInitializing: false,
  initError: null,
  github: null,
  puppeteer: null,
  supabase: null,
  vercel: null,
  initialize: async () => {}
});

/**
 * MCP Provider component
 */
export function McpProvider({ 
  children,
  autoInitialize = false 
}: { 
  children: React.ReactNode;
  autoInitialize?: boolean;
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const [adapters, setAdapters] = useState<Record<McpAdapterType, McpAdapter | null>>({
    github: null,
    puppeteer: null,
    supabase: null,
    vercel: null
  });

  /**
   * Initialize MCP adapters
   */
  const initialize = async () => {
    if (isInitialized || isInitializing) return;
    
    try {
      setIsInitializing(true);
      setInitError(null);
      
      // Initialize all adapters in parallel
      await Promise.allSettled([
        initGithubAdapter(),
        initPuppeteerAdapter(),
        initSupabaseAdapter(),
        initVercelAdapter()
      ]);
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize MCP adapters:', error);
      setInitError(error instanceof Error ? error : new Error('Unknown error initializing MCP adapters'));
    } finally {
      setIsInitializing(false);
    }
  };

  /**
   * Initialize GitHub adapter
   */
  const initGithubAdapter = async () => {
    try {
      const adapter = getMcpAdapter('github');
      await adapter.connect();
      setAdapters(prev => ({ ...prev, github: adapter }));
    } catch (error) {
      console.error('Failed to initialize GitHub MCP adapter:', error);
    }
  };

  /**
   * Initialize Puppeteer adapter
   */
  const initPuppeteerAdapter = async () => {
    try {
      const adapter = getMcpAdapter('puppeteer');
      await adapter.connect();
      setAdapters(prev => ({ ...prev, puppeteer: adapter }));
    } catch (error) {
      console.error('Failed to initialize Puppeteer MCP adapter:', error);
    }
  };
  
  /**
   * Initialize Supabase adapter
   */
  const initSupabaseAdapter = async () => {
    try {
      const adapter = getMcpAdapter('supabase');
      await adapter.connect();
      setAdapters(prev => ({ ...prev, supabase: adapter }));
    } catch (error) {
      console.error('Failed to initialize Supabase MCP adapter:', error);
    }
  };
  
  /**
   * Initialize Vercel adapter
   */
  const initVercelAdapter = async () => {
    try {
      const adapter = getMcpAdapter('vercel');
      await adapter.connect();
      setAdapters(prev => ({ ...prev, vercel: adapter }));
    } catch (error) {
      console.error('Failed to initialize Vercel MCP adapter:', error);
    }
  };

  /**
   * Auto-initialize on mount if configured
   */
  useEffect(() => {
    if (autoInitialize && !isInitialized && !isInitializing) {
      initialize();
    }
  }, [autoInitialize, isInitialized, isInitializing]);

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      // Disconnect adapters on unmount
      Object.values(adapters).forEach(adapter => {
        if (adapter) {
          adapter.disconnect().catch(console.error);
        }
      });
    };
  }, [adapters]);

  return (
    <McpContext.Provider
      value={{
        isInitialized,
        isInitializing,
        initError,
        github: adapters.github,
        puppeteer: adapters.puppeteer,
        supabase: adapters.supabase,
        vercel: adapters.vercel,
        initialize
      }}
    >
      {children}
    </McpContext.Provider>
  );
}

/**
 * Hook to use MCP context
 */
export function useMcp() {
  const context = useContext(McpContext);
  if (!context) {
    throw new Error('useMcp must be used within an McpProvider');
  }
  return context;
}