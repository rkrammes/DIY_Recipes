"use client";

import React, { useState } from 'react';
import { useSingleFormulation } from '../hooks/useFormulationRepository';
import { TransformedIngredient, FormulationVersion } from '@/types/models';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { useRouter } from 'next/navigation';

interface ModuleFormulationDetailsProps {
  formulationId: string;
  initialData?: any;
}

/**
 * Details component for viewing a formulation
 * This version uses the modular repository pattern
 */
export default function ModuleFormulationDetails({
  formulationId,
  initialData
}: ModuleFormulationDetailsProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Use the single formulation hook with repository pattern
  const {
    formulation,
    loading,
    error,
    update,
    delete: deleteFormulation,
    ingredients,
    versions
  } = useSingleFormulation(formulationId, { initialData });
  
  // Handle deletion
  const handleDelete = async () => {
    try {
      await deleteFormulation();
      router.push('/formulations');
    } catch (err) {
      console.error('Error deleting formulation:', err);
    }
  };
  
  if (loading) {
    return <div className="p-4">Loading formulation details...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }
  
  if (!formulation) {
    return <div className="p-4">Formulation not found</div>;
  }
  
  // Extract data
  const { title, description, created_at } = formulation;
  const formulationIngredients = formulation.ingredients || [];
  const formulationVersions = formulation.iterations || [];
  
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-600">
            Created: {new Date(created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/formulations/${formulationId}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Edit
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
      
      {/* Description */}
      {description && (
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p>{description}</p>
        </div>
      )}
      
      {/* Ingredients */}
      <div className="bg-white p-4 rounded shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Ingredients</h2>
          <button
            onClick={() => router.push(`/formulations/${formulationId}/ingredients`)}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
          >
            Manage Ingredients
          </button>
        </div>
        
        {formulationIngredients.length === 0 ? (
          <p className="text-gray-500">No ingredients added yet.</p>
        ) : (
          <ul className="space-y-2">
            {formulationIngredients.map((ingredient: TransformedIngredient) => (
              <li key={ingredient.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <span className="font-medium">{ingredient.name}</span>
                  {ingredient.description && (
                    <p className="text-sm text-gray-600">{ingredient.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-medium">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Versions */}
      <div className="bg-white p-4 rounded shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Version History</h2>
          <button
            onClick={() => router.push(`/formulations/${formulationId}/versions/new`)}
            className="px-3 py-1 bg-purple-600 text-white rounded text-sm"
          >
            Create New Version
          </button>
        </div>
        
        {formulationVersions.length === 0 ? (
          <p className="text-gray-500">No versions created yet.</p>
        ) : (
          <ul className="space-y-4">
            {formulationVersions.map((version: FormulationVersion) => (
              <li key={version.id} className="border-l-4 border-purple-500 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      Version {version.version_number}: {version.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(version.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/formulations/${formulationId}/versions/${version.id}`)}
                    className="text-blue-600 text-sm"
                  >
                    View Details
                  </button>
                </div>
                {version.notes && (
                  <p className="text-sm mt-1">{version.notes}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Formulation"
        message="Are you sure you want to delete this formulation? This action cannot be undone."
      />
    </div>
  );
}