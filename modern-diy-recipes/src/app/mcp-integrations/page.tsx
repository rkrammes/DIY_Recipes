'use client';

import React from 'react';
import SupabaseIntegration from '@/components/SupabaseIntegration';
import VercelIntegration from '@/components/VercelIntegration';
import GitHubIntegration from '@/components/GithubIntegration';
import Context7Integration from '@/components/Context7Integration';
import { McpProvider } from '@/providers/McpProvider';

/**
 * MCP Integrations page
 * 
 * This page demonstrates the integration with various MCP servers,
 * including Supabase and Vercel.
 */
export default function McpIntegrationsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">MCP Integrations</h1>
      
      <p className="text-text-secondary mb-10 max-w-3xl">
        This page demonstrates integration with various MCP servers through the
        consolidated MCP adapter pattern. Each adapter provides a type-safe interface
        for interacting with specific service APIs.
      </p>
      
      <McpProvider autoInitialize={false}>
        <div className="space-y-12">
          <GitHubIntegration />
          <SupabaseIntegration />
          <VercelIntegration />
          <Context7Integration />
        </div>
      </McpProvider>
    </div>
  );
}