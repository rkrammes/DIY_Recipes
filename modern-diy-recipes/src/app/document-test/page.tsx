'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DocumentCentricRecipe from '@/components/DocumentCentricRecipe';
import { mockSoapIterations, mockSoapRecipe } from '@/lib/mock-data-simple';

/**
 * Document Test Page - For testing the document-centric interface with iterations
 * This page deliberately uses mock data to ensure the iterations functionality works
 */
export default function DocumentTestPage() {
  // We're using a static ID here since we're just testing with mock data
  const recipeId = '1';
  const [componentKey, setComponentKey] = useState<number>(0);
  
  // Force re-render when the page loads to ensure mock data is used
  useEffect(() => {
    // Use a short timeout to allow the component to mount first
    const timer = setTimeout(() => {
      setComponentKey(prev => prev + 1);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <nav className="flex items-center mb-6 text-sm">
        <Link 
          href="/"
          className="text-blue-500 hover:text-blue-700"
        >
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">Document Test</span>
      </nav>
      
      <h1 className="text-2xl font-bold mb-6">Document-Centric Formulation Test</h1>
      
      <div className="bg-blue-50 p-4 mb-6 rounded-lg">
        <p className="mb-2 text-sm">
          <strong>Testing Environment:</strong> This is a testing page for the document-centric formulation interface with guaranteed mock data for iterations.
        </p>
        <p className="text-sm">
          <strong>Features to Test:</strong> 
          <ul className="list-disc ml-5 mt-2">
            <li>Version Timeline - Click on different versions (v1, v2, v3)</li>
            <li>Making Mode - Step-by-step instructions with timers</li>
            <li>Print Functionality - Print and Preview buttons</li>
            <li>Ingredient Scaling - In Making Mode</li>
          </ul>
        </p>
      </div>
      
      <div className="mb-6">
        {/* Using a key to force re-render when mock data is ready */}
        <DocumentCentricRecipe 
          key={componentKey}
          recipeId={recipeId} 
          // Pass mock data to ensure the component works regardless of database connection
          initialData={{ 
            ...mockSoapRecipe,
            id: recipeId,
            // Force using our mock data
            __useTestData: true,
            __mockIterations: mockSoapIterations
          }} 
        />
      </div>
      
      {/* Debug information */}
      <div className="mt-8 text-xs text-gray-500 p-4 bg-gray-100 rounded-lg">
        <p><strong>Mock Data Status:</strong></p>
        <ul className="mt-2">
          <li>Recipe ID: {recipeId}</li>
          <li>Mock Iterations: {mockSoapIterations.length} versions available</li>
          <li>Sample Version Title: "{mockSoapIterations[0]?.title || 'N/A'}"</li>
        </ul>
      </div>
    </div>
  );
}