'use client';

import React from 'react';
import GithubIntegration from '../../components/GithubIntegration';

/**
 * GitHub MCP Integration Test Page
 */
export default function GithubMcpPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-heading mb-8">GitHub MCP Integration</h1>
      <p className="mb-8 text-text-secondary">
        This page demonstrates the integration with the GitHub MCP server,
        allowing the application to interact with GitHub repositories and operations.
      </p>
      
      <GithubIntegration />
    </div>
  );
}