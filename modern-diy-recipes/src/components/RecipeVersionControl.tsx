'use client';

import React, { useState, useEffect } from 'react';
import { useMcp } from '../providers/McpProvider';
import { Button } from './ui/button';

interface RecipeVersionControlProps {
  recipeId: string;
  recipe: any;
  onVersionSelect?: (versionData: any) => void;
}

interface Version {
  sha: string;
  date: string;
  message: string;
  author: string;
}

/**
 * Recipe Version Control Component
 * 
 * This component provides GitHub-powered version control for recipes.
 */
export default function RecipeVersionControl({
  recipeId,
  recipe,
  onVersionSelect
}: RecipeVersionControlProps) {
  const { github, isInitialized, initialize } = useMcp();
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  /**
   * Load version history
   */
  const loadVersionHistory = async () => {
    if (!github) {
      console.error('GitHub MCP adapter not available');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await github.executeFunction('api.listCommits', {
        owner: process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER || 'diy-recipes',
        repo: process.env.NEXT_PUBLIC_GITHUB_REPO || 'recipe-data',
        path: `recipes/${recipeId}.json`,
      });
      
      if (result.commits) {
        setVersions(result.commits.map((commit: any) => ({
          sha: commit.sha,
          date: commit.commit.author.date,
          message: commit.commit.message,
          author: commit.commit.author.name
        })));
      }
    } catch (err) {
      console.error('Error loading recipe versions:', err);
      setError('Failed to load version history. Make sure the GitHub MCP server is running.');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Save recipe version
   */
  const saveVersion = async () => {
    if (!github) {
      console.error('GitHub MCP adapter not available');
      return;
    }
    
    if (!saveMessage.trim()) {
      setError('Please enter a commit message');
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      setSaveSuccess(false);
      
      const owner = process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER || 'diy-recipes';
      const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || 'recipe-data';
      const path = `recipes/${recipeId}.json`;
      const content = JSON.stringify(recipe, null, 2);
      
      // Check if file exists to get its SHA
      let sha;
      try {
        const fileResult = await github.executeFunction('api.getFileSha', {
          owner,
          repo,
          path,
        });
        
        if (fileResult.sha) {
          sha = fileResult.sha;
        }
      } catch (err) {
        // File doesn't exist yet, which is fine
      }
      
      // Create or update the file
      await github.executeFunction('api.createOrUpdateFile', {
        owner,
        repo,
        path,
        content,
        message: saveMessage,
        sha
      });
      
      setSaveSuccess(true);
      setSaveMessage('');
      
      // Reload versions
      await loadVersionHistory();
    } catch (err) {
      console.error('Error saving recipe version:', err);
      setError('Failed to save version. Make sure the GitHub MCP server is running.');
    } finally {
      setIsSaving(false);
    }
  };
  
  /**
   * View specific version
   */
  const viewVersion = async (sha: string) => {
    if (!github || !onVersionSelect) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const owner = process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER || 'diy-recipes';
      const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || 'recipe-data';
      const path = `recipes/${recipeId}.json`;
      
      // Get content at specific commit
      const result = await github.executeFunction('api.getFileContent', {
        owner,
        repo,
        path,
        ref: sha
      });
      
      if (result.content) {
        const versionData = JSON.parse(result.content);
        onVersionSelect(versionData);
      }
    } catch (err) {
      console.error('Error loading version:', err);
      setError('Failed to load this version.');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Initialize GitHub MCP if needed
   */
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);
  
  /**
   * Load versions when GitHub MCP is available
   */
  useEffect(() => {
    if (github && recipeId) {
      loadVersionHistory();
    }
  }, [github, recipeId]);
  
  /**
   * Render UI
   */
  return (
    <div className="bg-surface-1/80 border border-border-subtle rounded-lg shadow-soft p-4">
      <h3 className="text-lg font-medium mb-4">Recipe Version Control</h3>
      
      {/* GitHub connection status */}
      {!github && (
        <div className="mb-4 p-2 bg-alert-red/10 text-alert-red rounded border border-alert-red/30">
          GitHub MCP server not connected.
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2" 
            onClick={initialize}
            disabled={isLoading}
          >
            Connect
          </Button>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-2 bg-alert-red/10 text-alert-red rounded border border-alert-red/30">
          {error}
        </div>
      )}
      
      {/* Save success message */}
      {saveSuccess && (
        <div className="mb-4 p-2 bg-green-500/10 text-green-500 rounded border border-green-500/30">
          Version saved successfully!
        </div>
      )}
      
      {/* Save version form */}
      <div className="mb-6">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={saveMessage}
              onChange={(e) => setSaveMessage(e.target.value)}
              placeholder="Enter commit message..."
              className="w-full p-2 bg-surface-0 text-text-primary border border-border-subtle rounded-md"
              disabled={!github || isSaving}
            />
            <p className="text-xs text-text-secondary mt-1">
              Describe what changed in this version
            </p>
          </div>
          <Button
            onClick={saveVersion}
            disabled={!github || isSaving || !saveMessage.trim()}
            className="bg-accent hover:bg-accent-hover text-text-inverse"
          >
            {isSaving ? 'Saving...' : 'Save Version'}
          </Button>
        </div>
      </div>
      
      {/* Version history */}
      <div>
        <h4 className="text-md font-medium mb-2">Version History</h4>
        
        {isLoading && <p className="text-text-secondary">Loading versions...</p>}
        
        {!isLoading && versions.length === 0 && (
          <p className="text-text-secondary">No previous versions found.</p>
        )}
        
        <ul className="space-y-2 max-h-80 overflow-y-auto">
          {versions.map((version) => (
            <li 
              key={version.sha}
              className="p-3 bg-surface-0/60 border border-border-subtle rounded-md hover:bg-surface-0"
            >
              <div className="font-mono text-xs text-text-secondary mb-1">
                {version.sha.substring(0, 7)}
              </div>
              <div className="font-medium text-text-primary">
                {version.message}
              </div>
              <div className="flex justify-between items-center mt-1">
                <div className="text-xs text-text-secondary">
                  {new Date(version.date).toLocaleDateString()} by {version.author}
                </div>
                
                {onVersionSelect && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewVersion(version.sha)}
                    className="text-xs"
                  >
                    View
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}