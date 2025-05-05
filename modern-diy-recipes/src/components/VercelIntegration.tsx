'use client';

import React, { useState, useEffect } from 'react';
import { useMcp } from '../providers/McpProvider';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useTheme } from '../providers/ConsolidatedThemeProvider';

/**
 * VercelIntegration component
 * 
 * This component demonstrates the usage of the Vercel MCP adapter
 * to list and manage Vercel projects and deployments.
 */
export default function VercelIntegration() {
  const { vercel, isInitialized, initialize } = useMcp();
  const { theme } = useTheme();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize MCP if not already initialized
  useEffect(() => {
    if (!isInitialized) {
      initialize().catch(console.error);
    }
  }, [isInitialized, initialize]);

  // Load projects
  const loadProjects = async () => {
    if (!vercel) {
      setError('Vercel MCP is not initialized. Click "Initialize" to connect.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await vercel.executeFunction('projects.list', { limit: 10 });
      setProjects(result.projects || []);
    } catch (err) {
      console.error('Failed to load Vercel projects:', err);
      setError('Failed to load Vercel projects. ' + 
        (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Load deployments for a project
  const loadDeployments = async (projectId: string) => {
    if (!vercel) {
      setError('Vercel MCP is not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await vercel.executeFunction('deployments.list', { 
        projectId,
        limit: 5
      });
      setDeployments(result.deployments || []);
    } catch (err) {
      console.error('Failed to load deployments:', err);
      setError('Failed to load deployments. ' + 
        (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-bold mb-4">Vercel MCP Integration</h2>
      
      <div className="mb-6">
        <p className="text-text-secondary mb-4">
          This component demonstrates integration with Vercel through the MCP adapter.
          It allows you to list your Vercel projects and deployments.
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
            onClick={loadProjects}
            disabled={loading || !isInitialized}
          >
            {loading ? "Loading..." : "Load Projects"}
          </Button>
        </div>
        
        {error && (
          <div className="p-4 bg-[oklch(var(--error)/0.1)] border border-[oklch(var(--error)/0.5)] rounded-md mb-4 text-[oklch(var(--error))]">
            {error}
          </div>
        )}
      </div>
      
      {/* Projects List */}
      {projects.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Your Vercel Projects</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map(project => (
              <Card 
                key={project.id} 
                className="p-4 border border-border-subtle hover:border-border"
              >
                <h4 className="text-lg font-medium mb-1">{project.name}</h4>
                <p className="text-sm text-text-secondary mb-2">ID: {project.id}</p>
                <p className="text-sm mb-3">
                  {project.framework ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-surface-1">
                      {project.framework}
                    </span>
                  ) : 'No framework specified'}
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => loadDeployments(project.id)}
                  disabled={loading}
                >
                  View Deployments
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Deployments List */}
      {deployments.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Deployments</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-2 px-4">URL</th>
                  <th className="text-left py-2 px-4">State</th>
                  <th className="text-left py-2 px-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map(deployment => (
                  <tr key={deployment.id} className="border-b border-border-subtle">
                    <td className="py-2 px-4">
                      <a 
                        href={`https://${deployment.url}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        {deployment.url}
                      </a>
                    </td>
                    <td className="py-2 px-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                        deployment.state === 'READY' 
                          ? 'bg-[oklch(var(--success)/0.2)] text-[oklch(var(--success))]'
                          : deployment.state === 'ERROR' 
                            ? 'bg-[oklch(var(--error)/0.2)] text-[oklch(var(--error))]'
                            : 'bg-[oklch(var(--warning)/0.2)] text-[oklch(var(--warning))]'
                      }`}>
                        {deployment.state}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {new Date(deployment.created).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}