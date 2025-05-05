/**
 * Memory MCP Hook
 * 
 * This hook provides access to the Memory MCP service for tracking development sessions.
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Task structure from Memory MCP
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created: string;
  updated: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Decision structure from Memory MCP
 */
export interface Decision {
  id: string;
  title: string;
  description: string;
  rationale: string;
  alternatives?: string[];
  created: string;
  component?: string;
}

/**
 * Options for the useMemoryMcp hook
 */
interface UseMemoryMcpOptions {
  endpoint?: string;
  autoConnect?: boolean;
}

/**
 * Hook for using the Memory MCP service
 */
export default function useMemoryMcp(options: UseMemoryMcpOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  
  // Default endpoint if not provided
  const endpoint = options.endpoint || 'http://localhost:3001/memory';
  
  // Connect to the Memory MCP service
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if the Memory MCP service is available
      const response = await axios.get(`${endpoint}/getStatusSummary`);
      
      if (response.status === 200) {
        setIsConnected(true);
        
        // Fetch initial data
        const tasksResponse = await axios.get(`${endpoint}/getTasks`);
        if (tasksResponse.data && Array.isArray(tasksResponse.data.tasks)) {
          setTasks(tasksResponse.data.tasks);
        }
        
        const decisionsResponse = await axios.get(`${endpoint}/getDecisions`);
        if (decisionsResponse.data && Array.isArray(decisionsResponse.data.decisions)) {
          setDecisions(decisionsResponse.data.decisions);
        }
      } else {
        throw new Error('Failed to connect to Memory MCP service');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsConnected(false);
      console.error('Memory MCP connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);
  
  // Disconnect (mainly resets state)
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setTasks([]);
    setDecisions([]);
  }, []);
  
  // Record a new task
  const recordTask = useCallback(async (
    task: Omit<Task, 'id' | 'created' | 'updated'>
  ): Promise<Task | null> => {
    if (!isConnected) {
      console.error('Memory MCP not connected');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${endpoint}/recordTask`, task);
      
      if (response.status === 200 && response.data.task) {
        // Update local tasks
        setTasks(prev => [...prev, response.data.task]);
        return response.data.task;
      } else {
        throw new Error('Failed to record task');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Failed to record task:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, isConnected]);
  
  // Update an existing task
  const updateTask = useCallback(async (
    taskId: string,
    updates: Partial<Omit<Task, 'id' | 'created'>>
  ): Promise<Task | null> => {
    if (!isConnected) {
      console.error('Memory MCP not connected');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${endpoint}/recordTask`, {
        id: taskId,
        ...updates
      });
      
      if (response.status === 200 && response.data.task) {
        // Update local tasks
        setTasks(prev => prev.map(task => 
          task.id === taskId ? response.data.task : task
        ));
        return response.data.task;
      } else {
        throw new Error('Failed to update task');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Failed to update task:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, isConnected]);
  
  // Record a new decision
  const recordDecision = useCallback(async (
    decision: Omit<Decision, 'id' | 'created'>
  ): Promise<Decision | null> => {
    if (!isConnected) {
      console.error('Memory MCP not connected');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${endpoint}/recordDecision`, decision);
      
      if (response.status === 200 && response.data.decision) {
        // Update local decisions
        setDecisions(prev => [...prev, response.data.decision]);
        return response.data.decision;
      } else {
        throw new Error('Failed to record decision');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Failed to record decision:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, isConnected]);
  
  // Get tasks with optional filters
  const getTasks = useCallback(async (
    filters?: { status?: string; priority?: string }
  ): Promise<Task[]> => {
    if (!isConnected) {
      console.error('Memory MCP not connected');
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${endpoint}/getTasks`, {
        params: filters
      });
      
      if (response.status === 200 && response.data.tasks) {
        setTasks(response.data.tasks);
        return response.data.tasks;
      } else {
        throw new Error('Failed to get tasks');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Failed to get tasks:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, isConnected]);
  
  // Get decisions with optional filters
  const getDecisions = useCallback(async (
    filters?: { component?: string }
  ): Promise<Decision[]> => {
    if (!isConnected) {
      console.error('Memory MCP not connected');
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${endpoint}/getDecisions`, {
        params: filters
      });
      
      if (response.status === 200 && response.data.decisions) {
        setDecisions(response.data.decisions);
        return response.data.decisions;
      } else {
        throw new Error('Failed to get decisions');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Failed to get decisions:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, isConnected]);
  
  // Get overall development status summary
  const getStatusSummary = useCallback(async () => {
    if (!isConnected) {
      console.error('Memory MCP not connected');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${endpoint}/getStatusSummary`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Failed to get status summary');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Failed to get status summary:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, isConnected]);
  
  // Connect automatically if autoConnect option is true
  useEffect(() => {
    if (options.autoConnect) {
      connect();
    }
    
    // No real need to disconnect, but included for completeness
    return () => {
      disconnect();
    };
  }, [connect, disconnect, options.autoConnect]);
  
  return {
    isConnected,
    isLoading,
    error,
    tasks,
    decisions,
    connect,
    disconnect,
    recordTask,
    updateTask,
    recordDecision,
    getTasks,
    getDecisions,
    getStatusSummary
  };
}