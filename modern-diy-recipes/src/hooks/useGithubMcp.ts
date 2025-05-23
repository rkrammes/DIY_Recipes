'use client';

import { useState, useEffect } from 'react';
import githubApi, { Repository } from '../lib/githubApi';

/**
 * Hook for accessing GitHub repositories via MCP
 * 
 * @param options Configuration options
 * @param options.autoInitialize Whether to initialize the client automatically
 * @returns Object with repositories and operations
 */
export function useGithubRepositories(options: {
  autoInitialize?: boolean;
} = { autoInitialize: true }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);

  // Initialize the GitHub API client
  const initialize = async (token?: string) => {
    try {
      setIsLoading(true);
      if (token) {
        githubApi.setToken(token);
      }
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize GitHub API client'));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch repositories
  const fetchRepositories = async () => {
    if (!isInitialized) {
      await initialize();
    }
    
    try {
      setIsLoading(true);
      const repos = await githubApi.listRepos();
      setRepositories(repos);
      setError(null);
      return repos;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch repositories'));
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new repository
  const createRepository = async (name: string, options: {
    description?: string;
    private?: boolean;
    initWithReadme?: boolean;
  } = {}) => {
    if (!isInitialized) {
      await initialize();
    }
    
    try {
      setIsLoading(true);
      const repo = await githubApi.createRepo(name, options);
      await fetchRepositories();
      return repo;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to create repository "${name}"`));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-initialize if configured
  useEffect(() => {
    if (options.autoInitialize && !isInitialized && !isLoading) {
      initialize();
    }
  }, [options.autoInitialize, isInitialized, isLoading]);

  return {
    repositories,
    isLoading,
    error,
    isInitialized,
    initialize,
    fetchRepositories,
    createRepository,
    githubApi
  };
}

/**
 * Hook for accessing a specific GitHub repository via MCP
 * 
 * @param owner Repository owner
 * @param name Repository name
 * @returns Object with repository and operations
 */
export function useGithubRepository(owner: string, name: string) {
  const [repository, setRepository] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [branches, setBranches] = useState<string[]>([]);

  // Fetch repository details
  const fetchRepository = async () => {
    try {
      setIsLoading(true);
      const repo = await githubApi.getRepo(owner, name);
      setRepository(repo);
      setError(null);
      return repo;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch repository "${owner}/${name}"`));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch branches
  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const branchList = await githubApi.listBranches(owner, name);
      setBranches(branchList);
      setError(null);
      return branchList;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch branches for "${owner}/${name}"`));
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Create or update a file
  const createOrUpdateFile = async (filePath: string, content: string, message: string, branch?: string) => {
    try {
      setIsLoading(true);
      await githubApi.createOrUpdateFile(owner, name, {
        path: filePath,
        content,
        message,
        branch
      });
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to create/update file "${filePath}"`));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get file content
  const getFileContent = async (filePath: string, branch?: string) => {
    try {
      setIsLoading(true);
      const content = await githubApi.getFileContent(owner, name, filePath, branch);
      setError(null);
      return content;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to get file content for "${filePath}"`));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load repository data on mount
  useEffect(() => {
    if (owner && name) {
      fetchRepository();
      fetchBranches();
    }
  }, [owner, name]);

  return {
    repository,
    branches,
    isLoading,
    error,
    fetchRepository,
    fetchBranches,
    createOrUpdateFile,
    getFileContent,
    createBranch: (branch: string, fromBranch?: string) => 
      githubApi.createBranch(owner, name, branch, fromBranch),
    createPullRequest: (options: {
      title: string;
      body?: string;
      head: string;
      base: string;
    }) => githubApi.createPullRequest(owner, name, options)
  };
}

export default {
  useGithubRepositories,
  useGithubRepository
};