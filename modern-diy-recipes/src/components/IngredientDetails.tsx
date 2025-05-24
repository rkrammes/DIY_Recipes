'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface IngredientDetailsProps {
  ingredient: {
    id: string;
    name: string;
    description?: string | null;
  } | undefined;
  selectedItemId: string | null;
  onFormulationClick: (formulationId: string) => void;
}

export default function IngredientDetails({ 
  ingredient, 
  selectedItemId,
  onFormulationClick 
}: IngredientDetailsProps) {
  const [formulationsUsingIngredient, setFormulationsUsingIngredient] = useState<any[]>([]);
  const [loadingFormulations, setLoadingFormulations] = useState(false);
  
  // Fetch formulations that use this ingredient
  useEffect(() => {
    async function fetchFormulationsForIngredient() {
      if (!selectedItemId) return;
      
      setLoadingFormulations(true);
      try {
        // Query recipe_ingredients to find all recipes using this ingredient
        const { data: recipeIngredients, error } = await (supabase as any)
          .from('recipe_ingredients')
          .select(`
            recipe_id,
            recipes:recipe_id (id, title, description)
          `)
          .eq('ingredient_id', selectedItemId);
        
        if (error) {
          console.error('Error fetching formulations for ingredient:', error);
        } else if (recipeIngredients) {
          // Extract unique formulations
          const uniqueFormulations = recipeIngredients
            .filter((ri: any) => ri.recipes)
            .map((ri: any) => ri.recipes);
          setFormulationsUsingIngredient(uniqueFormulations);
        }
      } catch (err) {
        console.error('Error querying formulations:', err);
      } finally {
        setLoadingFormulations(false);
      }
    }
    
    fetchFormulationsForIngredient();
  }, [selectedItemId]);
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{ingredient?.name || 'Ingredient Details'}</h2>
      <div className="bg-surface-1 p-4 rounded-md mb-4">
        <p><strong>Description:</strong> {ingredient?.description || 'No description available'}</p>
      </div>
      <h3 className="text-xl font-semibold mb-3">Used In Formulations</h3>
      <div className="bg-surface-1 p-4 rounded-md">
        {loadingFormulations ? (
          <p className="text-text-secondary">Loading formulations...</p>
        ) : formulationsUsingIngredient.length > 0 ? (
          formulationsUsingIngredient.map(formulation => (
            <div key={formulation.id} className="mb-2 p-2 hover:bg-surface-2 rounded-md cursor-pointer"
                 onClick={() => onFormulationClick(formulation.id)}>
              {formulation.title}
            </div>
          ))
        ) : (
          <p className="text-text-secondary">Not used in any formulations yet</p>
        )}
      </div>
    </div>
  );
}