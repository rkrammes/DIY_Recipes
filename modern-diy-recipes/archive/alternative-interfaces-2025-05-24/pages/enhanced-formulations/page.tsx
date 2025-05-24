"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EnhancedModularLayout from '@/components/layouts/EnhancedModularLayout';
import { ModuleFormulationList, ModuleFormulationDetails } from '@/modules/formulations/components';
import { useFormulationRepository } from '@/modules/formulations/hooks';
import { initializeModules } from '@/modules';

/**
 * EnhancedFormulationsPage - Modern implementation of the formulations page
 * 
 * This page uses the enhanced modular layout and dynamic navigation
 * to provide a more consistent and themeable user experience.
 */
export default function EnhancedFormulationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get('id')
  );
  const [isCreating, setIsCreating] = useState<boolean>(
    searchParams.get('new') === 'true'
  );
  
  // Initialize the module registry
  useEffect(() => {
    initializeModules();
  }, []);
  
  // Update URL when selection changes
  useEffect(() => {
    if (selectedId) {
      router.push(`/enhanced-formulations?id=${selectedId}`);
    } else if (isCreating) {
      router.push('/enhanced-formulations?new=true');
    } else {
      router.push('/enhanced-formulations');
    }
  }, [selectedId, isCreating, router]);
  
  // Handle selecting a formulation
  const handleSelectFormulation = (id: string | null) => {
    setSelectedId(id);
    setIsCreating(false);
  };
  
  // Handle new formulation button
  const handleNewFormulation = () => {
    setSelectedId(null);
    setIsCreating(true);
  };
  
  // Handle successful creation
  const handleFormulationCreated = (data: any) => {
    if (data?.id) {
      setIsCreating(false);
      setSelectedId(data.id);
    }
  };

  // Determine what to display in the main content area
  const renderContent = () => {
    if (isCreating) {
      return (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Create New Formulation</h1>
            <button
              onClick={() => {
                setIsCreating(false);
                setSelectedId(null);
              }}
              className="px-4 py-2 bg-surface-2 rounded hover:bg-surface-3"
            >
              Cancel
            </button>
          </div>
          
          <div className="bg-surface-1 border border-border-subtle rounded-lg p-6">
            <ModuleFormulationList
              onSelect={handleSelectFormulation}
              selectedId={selectedId}
            />
          </div>
        </div>
      );
    }
    
    if (selectedId) {
      return (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Formulation Details</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedId(null)}
                className="px-4 py-2 bg-surface-2 rounded hover:bg-surface-3"
              >
                Back to List
              </button>
              <button
                onClick={handleNewFormulation}
                className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover"
              >
                New Formulation
              </button>
            </div>
          </div>
          
          <div className="bg-surface-1 border border-border-subtle rounded-lg">
            <ModuleFormulationDetails formulationId={selectedId} />
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Formulations</h1>
          <button
            onClick={handleNewFormulation}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover"
          >
            New Formulation
          </button>
        </div>
        
        <div className="bg-surface-1 border border-border-subtle rounded-lg p-6">
          <ModuleFormulationList
            onSelect={handleSelectFormulation}
            selectedId={selectedId}
          />
        </div>
      </div>
    );
  };

  return (
    <EnhancedModularLayout>
      {renderContent()}
    </EnhancedModularLayout>
  );
}