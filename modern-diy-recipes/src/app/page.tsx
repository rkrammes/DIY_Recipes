"use client";  // Mark as Client Component

import React, { useState, useEffect } from 'react';
import KraftTerminalModularLayout from '@/components/layouts/KraftTerminalModularLayout';
import RecipeDetailInTerminal from '@/components/RecipeDetailInTerminal';
import { useSearchParams } from 'next/navigation';
import { initializeModules } from '@/modules';

/**
 * Home Page - Shows the KRAFT_AI terminal interface with three-column layout
 * This is the main entry point to the application featuring:
 * 1. First column: Top-level categories (fixed width)
 * 2. Second column: Items within selected category (fixed width)
 * 3. Third column: Active document (flexible width)
 */
export default function Home() {
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get('id')
  );
  
  // Initialize the module registry
  useEffect(() => {
    initializeModules();
  }, []);
  
  // Handle selection change when KraftTerminalModularLayout passes a selection
  const handleSelectionChange = (id: string | null) => {
    setSelectedId(id);
  };

  return (
    <KraftTerminalModularLayout onItemSelected={handleSelectionChange}>
      <RecipeDetailInTerminal recipeId={selectedId} />
    </KraftTerminalModularLayout>
  );
}
