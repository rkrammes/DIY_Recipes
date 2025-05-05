'use client';

import React, { useState } from 'react';
import { useGithubRepositories } from '../hooks/useGithubMcp';
import { Button } from './ui/button';
import { Input } from './ui/input';

/**
 * GitHub Integration Component
 * 
 * Demonstrates the integration with GitHub MCP server
 */
export default function GithubIntegration() {
  const { 
    repositories, 
    isLoading, 
    error, 
    isInitialized,
    initialize, 
    fetchRepositories, 
    createRepository 
  } = useGithubRepositories({ autoInitialize: false });

  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [hasReadme, setHasReadme] = useState(true);

  // Handle repository creation
  const handleCreateRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoName.trim()) return;

    try {
      await createRepository(newRepoName, {
        description: newRepoDescription,
        private: isPrivate,
        initWithReadme: hasReadme
      });
      setNewRepoName('');
      setNewRepoDescription('');
    } catch (err) {
      console.error('Error creating repository:', err);
    }
  };

  return (
    <div className="p-6 bg-surface-1 rounded-lg shadow-soft">
      <h2 className="text-2xl font-heading mb-4">GitHub Integration</h2>
      
      {/* Connection status */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-success' : 'bg-alert-yellow'}`}
          />
          <span>
            {isInitialized 
              ? 'Connected to GitHub MCP' 
              : 'Not connected to GitHub MCP'}
          </span>
        </div>
        
        {!isInitialized && (
          <Button 
            onClick={initialize} 
            disabled={isLoading}
            className="bg-accent hover:bg-accent-hover text-text-inverse"
          >
            {isLoading ? 'Connecting...' : 'Connect to GitHub MCP'}
          </Button>
        )}
        
        {error && (
          <div className="text-alert-red mt-2">
            Error: {error.message}
          </div>
        )}
      </div>
      
      {/* Repository creation form */}
      {isInitialized && (
        <div className="mb-6">
          <h3 className="text-xl mb-2">Create New Repository</h3>
          <form onSubmit={handleCreateRepo} className="space-y-4">
            <div>
              <label htmlFor="repoName" className="block mb-1">Repository Name</label>
              <Input
                id="repoName"
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
                placeholder="my-new-repo"
                required
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="repoDescription" className="block mb-1">Description (optional)</label>
              <Input
                id="repoDescription"
                value={newRepoDescription}
                onChange={(e) => setNewRepoDescription(e.target.value)}
                placeholder="Repository description"
                className="w-full"
              />
            </div>
            
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                Private Repository
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasReadme}
                  onChange={(e) => setHasReadme(e.target.checked)}
                />
                Initialize with README
              </label>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading || !newRepoName.trim()} 
              className="bg-accent hover:bg-accent-hover text-text-inverse"
            >
              {isLoading ? 'Creating...' : 'Create Repository'}
            </Button>
          </form>
        </div>
      )}
      
      {/* Repository list */}
      {isInitialized && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl">Your Repositories</h3>
            <Button onClick={fetchRepositories} disabled={isLoading} variant="outline">
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          
          {repositories.length === 0 ? (
            <p className="text-text-secondary">No repositories found.</p>
          ) : (
            <ul className="space-y-2">
              {repositories.map((repo) => (
                <li key={`${repo.owner}/${repo.name}`} className="p-3 bg-surface rounded-md border border-border-subtle">
                  <div className="font-mono text-accent">
                    {repo.owner}/{repo.name}
                  </div>
                  {repo.description && (
                    <p className="text-text-secondary text-sm mt-1">{repo.description}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${repo.private ? 'bg-alert-red/20 text-alert-red' : 'bg-success/20 text-success'}`}>
                      {repo.private ? 'Private' : 'Public'}
                    </span>
                    {repo.defaultBranch && (
                      <span className="text-xs px-2 py-1 bg-surface-1 rounded-full">
                        Default: {repo.defaultBranch}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}