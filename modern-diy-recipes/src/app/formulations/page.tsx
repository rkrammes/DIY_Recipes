'use client';

import React, { useState, useEffect } from 'react';
import FormulationList from '@/components/FormulationList';
import FormulationDetails from '@/components/FormulationDetails';
import { useFormulation } from '@/hooks/useFormulation';
import { supabase } from '@/lib/supabase';

/**
 * Formulations Page - Demonstrates the use of formulation terminology components
 * This page showcases how to use the new wrapper components and hooks
 */
export default function FormulationsPage() {
  const [formulationList, setFormulationList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch all formulations
  useEffect(() => {
    async function fetchFormulations() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('recipes')  // Will eventually be renamed to 'formulations' in the database
          .select('id, title')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setFormulationList(data || []);
      } catch (err: any) {
        console.error('Error fetching formulations:', err);
        setError({
          error: 'Failed to fetch formulations',
          details: err.message
        });
      } finally {
        setLoading(false);
      }
    }

    fetchFormulations();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">DIY Formulations</h1>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <h2 className="text-xl font-semibold mb-3">Formulation List</h2>
          <FormulationList
            initialFormulations={formulationList}
            initialError={error}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
          />
        </div>
        
        <div className="md:w-2/3">
          <h2 className="text-xl font-semibold mb-3">Formulation Details</h2>
          {selectedId ? (
            <FormulationDetails
              formulationId={selectedId}
              initialFormulationData={null}
            />
          ) : (
            <div className="bg-surface border border-subtle rounded-lg p-6 text-center">
              <p className="text-text-secondary">Select a formulation to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}