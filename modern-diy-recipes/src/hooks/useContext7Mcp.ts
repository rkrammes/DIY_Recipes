'use client';

import { useState } from 'react';

/**
 * Placeholder hook for Context7 MCP integration
 * TODO: Implement proper browser-compatible version
 */
export function useContext7Mcp() {
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  return {
    isLoading,
    error,
    isInitialized: false,
    searchFiles: async () => [],
    readFile: async () => null,
    queryDocumentation: async () => null,
    initialize: async () => {},
  };
}

export default useContext7Mcp;