'use client';

import React from 'react';
import IngredientManager from '@/components/IngredientManager';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function IngredientsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="mt-2 text-text-secondary">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect, no need to render anything
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-text border-b pb-4 border-border-subtle">
        Ingredient Management
      </h1>
      <div className="bg-surface p-6 rounded-lg shadow-soft">
        <IngredientManager />
      </div>
    </div>
  );
}