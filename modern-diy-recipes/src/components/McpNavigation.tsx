'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDevAuth } from '@/hooks/devAuthContext';
import DevAuthStatus from './auth/DevAuthStatus';

export default function McpNavigation() {
  const pathname = usePathname();
  const { user, isAuthenticated, isEditMode } = useDevAuth();
  
  return (
    <nav className={`bg-surface-1 border-b border-border-subtle px-4 py-3 ${isEditMode ? 'border-l-4 border-l-green-500' : ''}`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-semibold text-text mr-8">
            DIY Recipes {isEditMode && <span className="text-green-500 text-sm">(Edit Mode)</span>}
          </Link>
          
          <div className="flex items-center space-x-1">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md transition-colors ${
                pathname === '/' 
                  ? 'bg-surface-2 text-text font-medium' 
                  : 'text-text-secondary hover:text-text hover:bg-surface-2'
              }`}
            >
              Recipes
            </Link>
            <Link 
              href="/ingredients" 
              className={`px-3 py-2 rounded-md transition-colors ${
                pathname === '/ingredients' 
                  ? 'bg-surface-2 text-text font-medium' 
                  : 'text-text-secondary hover:text-text hover:bg-surface-2'
              }`}
            >
              Ingredients
            </Link>
            <Link 
              href="/theme-demo" 
              className={`px-3 py-2 rounded-md transition-colors ${
                pathname === '/theme-demo' 
                  ? 'bg-surface-2 text-text font-medium' 
                  : 'text-text-secondary hover:text-text hover:bg-surface-2'
              }`}
            >
              Theme Demo
            </Link>
          </div>
        </div>
        
        <DevAuthStatus />
      </div>
    </nav>
  );
}