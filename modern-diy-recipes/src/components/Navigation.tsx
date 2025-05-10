'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthStatus from './auth/AuthStatus';
import ThemedIcon from './ThemedIcon';

export default function Navigation() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <nav className="bg-surface-1 border-b border-border-subtle px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-text">
            DIY Formulations
          </Link>
          <div className="h-8 w-20 bg-surface-2 animate-pulse rounded"></div>
        </div>
      </nav>
    );
  }
  
  if (!user) {
    return (
      <nav className="bg-surface-1 border-b border-border-subtle px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-text">
            DIY Formulations
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-text-secondary hover:text-text transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="bg-surface-1 border-b border-border-subtle px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-semibold text-text mr-8 flex items-center gap-2">
            <ThemedIcon iconType="recipe" width={20} height={20} />
            DIY Formulations
          </Link>
          
          <div className="flex items-center space-x-1">
            <Link 
              href="/formulations" 
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                pathname === '/formulations' || pathname === '/'  
                  ? 'bg-surface-2 text-text font-medium' 
                  : 'text-text-secondary hover:text-text hover:bg-surface-2'
              }`}
            >
              <ThemedIcon iconType="recipe" width={16} height={16} />
              Formulations
            </Link>
            <Link 
              href="/ingredients" 
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                pathname === '/ingredients' 
                  ? 'bg-surface-2 text-text font-medium' 
                  : 'text-text-secondary hover:text-text hover:bg-surface-2'
              }`}
            >
              <ThemedIcon iconType="ingredient" width={16} height={16} />
              Ingredients
            </Link>
            <Link 
              href="/theme-demo" 
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                pathname === '/theme-demo' 
                  ? 'bg-surface-2 text-text font-medium' 
                  : 'text-text-secondary hover:text-text hover:bg-surface-2'
              }`}
            >
              <ThemedIcon iconType="file" width={16} height={16} />
              Theme Demo
            </Link>
            <Link 
              href="/mcp-integrations" 
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                pathname === '/mcp-integrations' 
                  ? 'bg-surface-2 text-text font-medium' 
                  : 'text-text-secondary hover:text-text hover:bg-surface-2'
              }`}
            >
              <ThemedIcon iconType="tool" width={16} height={16} />
              MCP Integrations
            </Link>
            <Link 
              href="/supabase-mcp" 
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                pathname === '/supabase-mcp' 
                  ? 'bg-surface-2 text-text font-medium' 
                  : 'text-text-secondary hover:text-text hover:bg-surface-2'
              }`}
            >
              <ThemedIcon iconType="window" width={16} height={16} />
              Supabase MCP
            </Link>
            <Link 
              href="/mcp-auth" 
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                pathname === '/mcp-auth' 
                  ? 'bg-surface-2 text-text font-medium' 
                  : 'text-text-secondary hover:text-text hover:bg-surface-2'
              }`}
            >
              <ThemedIcon iconType="globe" width={16} height={16} />
              MCP Auth
            </Link>
            <Link
              href="/context7-mcp"
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                pathname === '/context7-mcp'
                  ? 'bg-surface-2 text-text font-medium'
                  : 'text-text-secondary hover:text-text hover:bg-surface-2'
              }`}
            >
              <ThemedIcon iconType="file" width={16} height={16} />
              Context7 Docs
            </Link>
            <Link
              href="/settings"
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                pathname === '/settings'
                  ? 'bg-surface-2 text-text font-medium'
                  : 'text-text-secondary hover:text-text hover:bg-surface-2'
              }`}
            >
              <ThemedIcon iconType="tool" width={16} height={16} />
              Settings
            </Link>
          </div>
        </div>

        <AuthStatus />
      </div>
    </nav>
  );
}