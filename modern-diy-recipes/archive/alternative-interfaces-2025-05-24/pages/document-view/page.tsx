'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DocumentCentricRecipe from '@/components/DocumentCentricRecipe';
import { DatabaseErrorBoundary } from '@/components/DatabaseErrorBoundary';

/**
 * Document View Page - Displays the recipe in our new document-centric interface
 */
export default function DocumentViewPage() {
  const searchParams = useSearchParams();
  const [recipeId, setRecipeId] = useState<string | null>(null);
  
  // Extract recipe ID from query parameters
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setRecipeId(id);
    }
  }, [searchParams]);
  
  return (
    <div className="container mx-auto p-4">
      <nav className="flex items-center mb-6 text-sm">
        <Link 
          href="/"
          className="text-accent hover:text-accent-hover"
        >
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link 
          href="/recipes"
          className="text-accent hover:text-accent-hover"
        >
          Recipes
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">Document View</span>
      </nav>
      
      <h1 className="text-2xl font-bold mb-6">Document-Centric Formulation Interface</h1>
      
      <div className="bg-surface-1 p-4 mb-6 rounded-lg">
        <p className="mb-2 text-sm">
          This is a prototype of the document-centric formulation interface that integrates viewing, editing, versioning, and AI suggestions into a cohesive experience.
        </p>
        <p className="text-sm">
          <strong>Features:</strong> Inline editing, version timeline, AI suggestions, and tools panel. 
          All these features are accessible directly within the document view.
        </p>
      </div>
      
      {recipeId ? (
        <DatabaseErrorBoundary fallback={
          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <p className="text-red-700 font-medium">Error loading recipe data</p>
            <p className="text-sm mt-2">
              This could be due to missing database tables or connectivity issues.
              The document-centric view requires proper database setup with recipe_iterations table.
            </p>
            <div className="mt-4">
              <a 
                href={`/recipes?id=${recipeId}`}
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
              >
                View in standard interface
              </a>
            </div>
          </div>
        }>
          {/* Pass initialData to ensure mock data works even if database connection fails */}
          <DocumentCentricRecipe 
            recipeId={recipeId} 
            initialData={{ 
              id: recipeId,
              title: 'DIY Moisturizing Soap Bar',
              description: 'A nourishing handmade soap with shea butter and essential oils.',
              user_id: 'user1',
              created_at: new Date().toISOString()
            }} 
          />
        </DatabaseErrorBoundary>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="text-yellow-800 font-medium">No recipe selected</p>
          <p className="mt-2 text-sm">
            Please select a recipe to view in the document-centric interface.
          </p>
          <div className="mt-4">
            <Link 
              href="/recipes"
              className="bg-accent text-white px-4 py-2 rounded hover:bg-accent-hover inline-block"
            >
              Browse Recipes
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}