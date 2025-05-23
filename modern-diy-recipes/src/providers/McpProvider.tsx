'use client';

import React, { createContext, useContext, useState } from 'react';

/**
 * Placeholder MCP Provider context type
 */
interface McpContextType {
  isInitialized: boolean;
  isInitializing: boolean;
  initError: Error | null;
  github: null;
  puppeteer: null;
  supabase: null;
  vercel: null;
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
 * Placeholder MCP Provider component
 * TODO: Implement proper browser-compatible version
 */
export function McpProvider({ 
  children,
  autoInitialize = false 
}: { 
  children: React.ReactNode;
  autoInitialize?: boolean;
}) {
  const [isInitialized] = useState(false);
  const [isInitializing] = useState(false);
  const [initError] = useState<Error | null>(null);

  const initialize = async () => {
    // Placeholder implementation
  };

  return (
    <McpContext.Provider
      value={{
        isInitialized,
        isInitializing,
        initError,
        github: null,
        puppeteer: null,
        supabase: null,
        vercel: null,
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