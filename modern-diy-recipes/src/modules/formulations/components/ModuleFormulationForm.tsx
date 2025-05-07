"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormulationRepository } from '../hooks/useFormulationRepository';
import { Formulation } from '@/types/models';
import { useAuth } from '@/hooks/useAuth';

interface ModuleFormulationFormProps {
  initialData?: Partial<Formulation>;
  formulationId?: string | null;
  onSave?: (formulation: Formulation) => void;
  onCancel?: () => void;
}

/**
 * Form component for creating or editing a formulation
 * This version uses the modular repository pattern
 */
export default function ModuleFormulationForm({
  initialData,
  formulationId,
  onSave,
  onCancel
}: ModuleFormulationFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const isEditing = !!formulationId;
  
  // Use the repository hook
  const { createFormulation, updateFormulation } = useFormulationRepository();
  
  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  
  // Validate form
  useEffect(() => {
    setIsValid(title.trim().length > 0);
  }, [title]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid || !user) {
      setError('Please provide a title for your formulation');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare formulation data
      const formulationData: Partial<Formulation> = {
        title,
        description: description || '',
        user_id: user.id
      };
      
      // Create new or update existing formulation
      let result;
      
      if (isEditing && formulationId) {
        // Update existing formulation
        result = await updateFormulation(formulationId, formulationData);
      } else {
        // Create new formulation
        result = await createFormulation(formulationData);
      }
      
      if (result.error) {
        setError(result.error instanceof Error ? result.error.message : String(result.error));
        return;
      }
      
      // Handle success
      if (onSave && result.data) {
        onSave(result.data);
      } else if (result.data) {
        // Navigate to the formulation details page
        router.push(`/formulations/${result.data.id}`);
      }
    } catch (err) {
      console.error('Error saving formulation:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="p-4 bg-card rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? 'Edit Formulation' : 'Create New Formulation'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block mb-1 font-medium">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter formulation title"
            required
          />
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block mb-1 font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter formulation description"
            rows={4}
          />
        </div>
        
        {/* Error message */}
        {error && (
          <div className="p-2 text-red-600 bg-red-50 rounded">
            {error}
          </div>
        )}
        
        {/* Form actions */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel || (() => router.back())}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-primary rounded"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting 
              ? 'Saving...' 
              : isEditing 
                ? 'Update Formulation' 
                : 'Create Formulation'
            }
          </button>
        </div>
      </form>
    </div>
  );
}