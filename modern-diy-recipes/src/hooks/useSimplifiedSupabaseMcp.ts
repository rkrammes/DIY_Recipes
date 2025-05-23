'use client';

import { useState, useCallback } from 'react';

/**
 * Placeholder hook for Simplified Supabase MCP integration
 * TODO: Implement proper browser-compatible version
 */
export function useSimplifiedSupabaseMcp() {
  const [isConnected] = useState(false);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const connect = useCallback(async () => false, []);
  const disconnect = useCallback(async () => true, []);
  const authenticate = useCallback(async () => null, []);
  const executeQuery = useCallback(async () => [], []);
  const getAvailableTools = useCallback(async () => [], []);

  return {
    adapter: null,
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