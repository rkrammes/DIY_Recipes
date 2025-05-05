'use client';

import React, { useState, useEffect } from 'react';
import { useMcp } from '../providers/McpProvider';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useTheme } from '../providers/ConsolidatedThemeProvider';
import { Input } from './ui/input';
import { Label } from './ui/label';

/**
 * GitHubIntegration component
 * 
 * This component demonstrates the usage of the GitHub MCP adapter
 * to interact with GitHub repositories, issues, and more.
 */
export default function GitHubIntegration() {
  const { github, isInitialized, initialize } = useMcp();
  const { theme } = useTheme();
  
  const [repos, setRepos] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [newIssue, setNewIssue] = useState({
    title: '',
    body: '',
  });

  // Initialize MCP if not already initialized
  useEffect(() => {
    if (!isInitialized) {
      initialize().catch(console.error);
    }
  }, [isInitialized, initialize]);

  // Load user repositories
  const loadRepositories = async () => {
    if (!github) {
      setError('GitHub MCP is not initialized. Click "Initialize" to connect.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await github.executeFunction('repos.list');
      setRepos(result || []);
    } catch (err) {
      console.error('Failed to load GitHub repositories:', err);
      setError('Failed to load repositories. ' + 
        (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Load repository issues
  const loadIssues = async (repo: string) => {
    if (!github) {
      setError('GitHub MCP is not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSelectedRepo(repo);
      
      const [owner, repoName] = repo.split('/');
      const result = await github.executeFunction('issues.list', {
        owner,
        repo: repoName,
        state: 'all'
      });
      
      setIssues(result || []);
    } catch (err) {
      console.error('Failed to load issues:', err);
      setError('Failed to load issues. ' + 
        (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Create a new issue
  const createIssue = async () => {
    if (!github || !selectedRepo) {
      setError('GitHub MCP is not initialized or no repository selected');
      return;
    }

    if (!newIssue.title.trim()) {
      setError('Issue title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [owner, repoName] = selectedRepo.split('/');
      await github.executeFunction('issues.create', {
        owner,
        repo: repoName,
        title: newIssue.title,
        body: newIssue.body
      });
      
      // Reset form and reload issues
      setNewIssue({ title: '', body: '' });
      await loadIssues(selectedRepo);
    } catch (err) {
      console.error('Failed to create issue:', err);
      setError('Failed to create issue. ' + 
        (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-bold mb-4">GitHub MCP Integration</h2>
      
      <div className="mb-6">
        <p className="text-text-secondary mb-4">
          This component demonstrates integration with GitHub through the MCP adapter.
          It allows you to view your repositories, manage issues, and more.
        </p>
        
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={initialize}
            disabled={isInitialized}
            variant={isInitialized ? "outline" : "default"}
          >
            {isInitialized ? "MCP Initialized" : "Initialize MCP"}
          </Button>
          
          <Button 
            onClick={loadRepositories}
            disabled={loading || !isInitialized}
          >
            {loading ? "Loading..." : "Load Repositories"}
          </Button>
        </div>
        
        {error && (
          <div className="p-4 bg-[oklch(var(--error)/0.1)] border border-[oklch(var(--error)/0.5)] rounded-md mb-4 text-[oklch(var(--error))]">
            {error}
          </div>
        )}
      </div>
      
      {/* Repositories List */}
      {repos.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Your Repositories</h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {repos.map(repo => (
              <Card 
                key={repo.id} 
                className={`p-4 border ${
                  selectedRepo === repo.full_name 
                    ? 'border-accent' 
                    : 'border-border-subtle hover:border-border'
                } cursor-pointer`}
                onClick={() => loadIssues(repo.full_name)}
              >
                <h4 className="text-lg font-medium mb-1">{repo.name}</h4>
                <p className="text-sm text-text-secondary mb-2">{repo.full_name}</p>
                {repo.description && (
                  <p className="text-sm mb-3">{repo.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <span>⭐ {repo.stargazers_count}</span>
                  <span>🍴 {repo.forks_count}</span>
                  <span>👁️ {repo.watchers_count}</span>
                  <span className="ml-auto">{repo.language}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Issues List */}
      {selectedRepo && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">
            Issues for {selectedRepo}
          </h3>
          
          {/* Create new issue form */}
          <Card className="p-4 border border-border-subtle mb-6">
            <h4 className="text-lg font-medium mb-3">Create New Issue</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="issue-title">Title</Label>
                <Input
                  id="issue-title"
                  value={newIssue.title}
                  onChange={e => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Issue title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="issue-body">Description</Label>
                <textarea
                  id="issue-body"
                  value={newIssue.body}
                  onChange={e => setNewIssue(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Describe the issue"
                  rows={3}
                  className="w-full p-2 mt-1 border border-border-subtle rounded-md bg-surface-0"
                />
              </div>
              <Button 
                onClick={createIssue}
                disabled={loading || !newIssue.title.trim()}
              >
                Create Issue
              </Button>
            </div>
          </Card>
          
          {/* Issues listing */}
          {issues.length === 0 ? (
            <p className="text-text-secondary">No issues found in this repository.</p>
          ) : (
            <div className="space-y-4">
              {issues.map(issue => (
                <Card 
                  key={issue.id} 
                  className="p-4 border border-border-subtle"
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className={`flex-shrink-0 w-3 h-3 mt-1.5 rounded-full ${
                        issue.state === 'open'
                          ? 'bg-[oklch(var(--success))]'
                          : 'bg-[oklch(var(--error))]'
                      }`}
                    />
                    <div className="flex-grow">
                      <h4 className="text-lg font-medium mb-1">
                        <a 
                          href={issue.html_url} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {issue.title}
                        </a>
                      </h4>
                      <div className="flex items-center text-sm text-text-secondary mb-2">
                        <span>#{issue.number}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {issue.state === 'open' ? 'Open' : 'Closed'}
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          Opened by {issue.user?.login}
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          {new Date(issue.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {issue.body && (
                        <p className="text-sm line-clamp-3">
                          {issue.body}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}