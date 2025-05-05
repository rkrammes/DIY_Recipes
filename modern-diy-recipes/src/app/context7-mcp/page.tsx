/**
 * Context7 MCP Integration Page
 * 
 * This page demonstrates the Context7 MCP integration in the DIY Recipes app.
 */

import Context7Integration from '@/components/Context7Integration';

export const metadata = {
  title: 'Context7 MCP Integration | DIY Recipes',
  description: 'Access up-to-date documentation during development with Context7 MCP'
};

export default function Context7McpPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Context7 MCP Integration</h1>
      
      <p className="mb-6">
        Context7 MCP provides up-to-date documentation for various libraries used in DIY Recipes.
        Use this integration to access documentation, search for topics, view code examples, and validate your code.
      </p>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Key Features:</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access documentation for Next.js, React, Tailwind CSS, Supabase, and more</li>
          <li>Search for specific topics across multiple libraries</li>
          <li>View code examples for common use cases</li>
          <li>Validate your code against API documentation</li>
        </ul>
      </div>
      
      <Context7Integration />
    </div>
  );
}