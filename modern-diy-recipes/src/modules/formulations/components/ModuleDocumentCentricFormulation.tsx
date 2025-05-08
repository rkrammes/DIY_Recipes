"use client";

import React, { useEffect, useState } from 'react';
import { useFormulationRepository } from '../hooks/useFormulationRepository';

interface ModuleDocumentCentricFormulationProps {
  id?: string;
}

/**
 * Document-centric view for formulations
 * This component displays a formulation in a document-focused layout
 */
const ModuleDocumentCentricFormulation: React.FC<ModuleDocumentCentricFormulationProps> = ({ id }) => {
  const [loading, setLoading] = useState(true);
  const [formulation, setFormulation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Optional: Use the repository pattern if available
  const repo = useFormulationRepository();
  
  useEffect(() => {
    async function loadFormulation() {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Try to load from repository, or use mock data for demonstration
        let formulationData;
        
        if (repo) {
          formulationData = await repo.getById(id);
        } else {
          // Mock data as fallback
          formulationData = {
            id,
            title: `Formulation ${id}`,
            description: 'This is a sample formulation for demonstration purposes.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            version: '1.0',
            ingredients: [
              { id: 'ing1', name: 'Sample Ingredient 1', amount: '100g' },
              { id: 'ing2', name: 'Sample Ingredient 2', amount: '50ml' },
              { id: 'ing3', name: 'Sample Ingredient 3', amount: '25g' }
            ],
            instructions: 'Mix all ingredients together and stir well.'
          };
          
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        setFormulation(formulationData);
      } catch (err) {
        console.error('Error loading formulation:', err);
        setError('Failed to load formulation. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadFormulation();
  }, [id, repo]);
  
  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full">
        <div className="text-accent text-xl mb-4">Loading document...</div>
        <div className="w-16 h-16 border-t-4 border-accent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-red-500">
        <h2 className="text-xl mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }
  
  if (!formulation) {
    return (
      <div className="p-8">
        <h2 className="text-xl text-accent mb-2">No Formulation Selected</h2>
        <p className="text-text-secondary">Please select a formulation to view.</p>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="bg-surface-1 border border-border-subtle rounded p-4">
        <h2 className="text-xl font-mono text-accent mb-3">{formulation.title}</h2>
        
        <div className="mb-4 border-b border-border-subtle pb-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex">
              <span className="text-text-secondary w-24">ID:</span>
              <span className="font-mono">{formulation.id}</span>
            </div>
            <div className="flex">
              <span className="text-text-secondary w-24">CREATED:</span>
              <span className="font-mono">{new Date(formulation.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex">
              <span className="text-text-secondary w-24">VERSION:</span>
              <span className="font-mono">{formulation.version || '1.0'}</span>
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
            {formulation.description || 'No description available.'}
          </p>
        </div>
        
        {/* Ingredients Section */}
        <div className="mb-4 border-t border-border-subtle pt-3">
          <h3 className="text-lg text-accent mb-2 font-mono">INGREDIENTS</h3>
          <div className="bg-surface-2 border border-border-subtle p-2">
            {formulation.ingredients && formulation.ingredients.length > 0 ? (
              <ul className="list-disc pl-5">
                {formulation.ingredients.map((ing: any, index: number) => (
                  <li key={ing.id || index} className="text-text-secondary mb-1">
                    {ing.name} ({ing.amount})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-secondary">No ingredients listed.</p>
            )}
          </div>
        </div>
        
        {/* Instructions Section */}
        <div className="mb-4">
          <h3 className="text-lg text-accent mb-2 font-mono">INSTRUCTIONS</h3>
          <div className="bg-surface-2 border border-border-subtle p-2">
            <p className="text-text-secondary whitespace-pre-line">
              {formulation.instructions || 'No instructions provided.'}
            </p>
          </div>
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
      
      {/* System Log */}
      <div className="mt-4 bg-surface-1 border border-border-subtle rounded p-2">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm text-accent font-mono">SYSTEM LOG</h4>
          <div className="text-green-500 text-xs animate-pulse">● LIVE</div>
        </div>
        <div className="h-24 overflow-y-auto bg-surface-2 p-2 font-mono text-[10px] leading-tight">
          <div className="text-text-secondary">[{new Date().toLocaleTimeString()}] Document ID: {id} loaded</div>
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

export default ModuleDocumentCentricFormulation;