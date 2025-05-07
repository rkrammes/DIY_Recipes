"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormulationRepository } from '../hooks/useFormulationRepository';
import { Formulation } from '@/types/models';

interface ModuleFormulationListProps {
  initialFormulations?: Formulation[] | null;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}

/**
 * List component for formulations
 * This version uses the modular repository pattern
 */
export default function ModuleFormulationList({
  initialFormulations,
  selectedId,
  onSelect
}: ModuleFormulationListProps) {
  const router = useRouter();
  const [formulations, setFormulations] = useState<Formulation[]>(initialFormulations || []);
  const [loading, setLoading] = useState(!initialFormulations);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use the repository hook
  const { getAllFormulations } = useFormulationRepository();
  
  // Load formulations from repository
  useEffect(() => {
    const loadFormulations = async () => {
      if (initialFormulations) {
        setFormulations(initialFormulations);
        return;
      }
      
      setLoading(true);
      
      try {
        // Search filter if needed
        const filters = searchTerm 
          ? { 'title:ilike': searchTerm } 
          : undefined;
        
        const result = await getAllFormulations(filters);
        
        if (result.error) {
          setError(result.error instanceof Error ? result.error.message : String(result.error));
        } else {
          setFormulations(result.data || []);
          setError(null);
        }
      } catch (err) {
        console.error('Error loading formulations:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    loadFormulations();
  }, [initialFormulations, getAllFormulations, searchTerm]);
  
  // Handle formulation selection
  const handleSelect = (id: string) => {
    if (onSelect) {
      onSelect(id);
    } else {
      router.push(`/formulations/${id}`);
    }
  };
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Create new formulation
  const handleCreateNew = () => {
    router.push('/formulations/new');
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Formulations</h1>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Create New
        </button>
      </div>
      
      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search formulations..."
          className="w-full p-2 border rounded"
        />
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-2 text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && <div className="text-center py-4">Loading formulations...</div>}
      
      {/* Formulations list */}
      {!loading && formulations.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded">
          <p className="text-gray-500">No formulations found</p>
          <button
            onClick={handleCreateNew}
            className="mt-2 px-4 py-2 text-blue-600 underline"
          >
            Create your first formulation
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {formulations.map((formulation) => (
            <li 
              key={formulation.id}
              onClick={() => handleSelect(formulation.id)}
              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                selectedId === formulation.id ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              <h3 className="font-medium">{formulation.title}</h3>
              {formulation.description && (
                <p className="text-sm text-gray-600 truncate">{formulation.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Created: {new Date(formulation.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}