"use client";  // Mark as Client Component

import React, { useState, useEffect } from 'react';
import KraftTerminalModularLayout from '@/components/layouts/KraftTerminalModularLayout';
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
  
  // Render active document content
  const renderActiveDocument = () => {
    if (!selectedId) {
      return null;
    }
    
    // Display document content based on the selected item
    return (
      <div className="p-4">
        <div className="bg-surface-1 border border-border-subtle rounded p-4">
          <h2 className="text-xl font-mono text-accent mb-3">DOCUMENT #{selectedId}</h2>
          
          <div className="mb-4 border-b border-border-subtle pb-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex">
                <span className="text-text-secondary w-24">ID:</span>
                <span className="font-mono">{selectedId}</span>
              </div>
              <div className="flex">
                <span className="text-text-secondary w-24">CREATED:</span>
                <span className="font-mono">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex">
                <span className="text-text-secondary w-24">VERSION:</span>
                <span className="font-mono">1.0</span>
              </div>
              <div className="flex">
                <span className="text-text-secondary w-24">STATUS:</span>
                <span className="font-mono text-green-500">ACTIVE</span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg text-accent mb-2 font-mono">DESCRIPTION</h3>
            <p className="text-text-secondary mb-2">
              This is a sample document for demonstration purposes. In a real application, this would 
              display the actual content of the selected formulation, ingredient, or other item.
            </p>
            <p className="text-text-secondary">
              The content would be dynamically loaded based on the item ID and category.
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border-subtle">
            <div className="flex justify-between items-center">
              <div className="text-text-secondary text-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                Document loaded successfully
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-surface-2 border border-border-subtle text-text-secondary hover:bg-surface-3 text-xs">
                  [EDIT]
                </button>
                <button className="px-3 py-1 bg-accent text-white text-xs">
                  [SAVE]
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sample Code Block */}
        <div className="mt-4 bg-surface-1 border border-border-subtle rounded p-4">
          <h3 className="text-lg text-accent mb-2 font-mono">SAMPLE CODE</h3>
          <pre className="font-mono text-xs bg-surface-2 p-3 overflow-x-auto border border-border-subtle">
{`function calculateFormulation(ingredients, ratios) {
  // Initialize result object
  const result = {
    totalWeight: 0,
    components: [],
    properties: {}
  };
  
  // Process each ingredient
  for (const [index, ingredient] of ingredients.entries()) {
    const ratio = ratios[index] || 0;
    result.totalWeight += ratio;
    
    // Add component to result
    result.components.push({
      id: ingredient.id,
      name: ingredient.name,
      ratio: ratio,
      weight: 0 // Will be calculated later
    });
    
    // Accumulate properties
    for (const [prop, value] of Object.entries(ingredient.properties || {})) {
      if (!result.properties[prop]) {
        result.properties[prop] = 0;
      }
      result.properties[prop] += value * ratio;
    }
  }
  
  // Normalize properties
  for (const prop in result.properties) {
    result.properties[prop] /= result.totalWeight;
  }
  
  return result;
}`}
          </pre>
        </div>
        
        {/* System Log */}
        <div className="mt-4 bg-surface-1 border border-border-subtle rounded p-2">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm text-accent font-mono">SYSTEM LOG</h4>
            <div className="text-green-500 text-xs animate-pulse">● LIVE</div>
          </div>
          <div className="h-24 overflow-y-auto bg-surface-2 p-2 font-mono text-[10px] leading-tight">
            <div className="text-text-secondary">[{new Date().toLocaleTimeString()}] Document ID: {selectedId} loaded</div>
            <div className="text-text-secondary">[{new Date().toLocaleTimeString()}] Parsing content structure</div>
            <div className="text-green-500">[{new Date().toLocaleTimeString()}] Verified document integrity</div>
            <div className="text-text-secondary">[{new Date().toLocaleTimeString()}] Loading related resources</div>
            <div className="text-accent">[{new Date().toLocaleTimeString()}] Rendering document view</div>
            <div className="text-amber-500">[{new Date().toLocaleTimeString()}] Document ready for interaction</div>
            <div className="text-text-secondary">[{new Date().toLocaleTimeString()}] Monitoring changes</div>
            <div className="text-purple-500">[{new Date().toLocaleTimeString()}] Background processes running</div>
            <div className="text-green-500">[{new Date().toLocaleTimeString()}] All systems nominal</div>
            <div className="text-amber-500 animate-pulse">[{new Date().toLocaleTimeString()}] Awaiting user input _</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <KraftTerminalModularLayout>
      {renderActiveDocument()}
    </KraftTerminalModularLayout>
  );
}
