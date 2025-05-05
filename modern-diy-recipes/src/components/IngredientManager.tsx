'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import IngredientList from './IngredientList';
import IngredientEditor from './IngredientEditor';
import { useIngredientManager } from '@/hooks/useIngredientManager';
import type { Ingredient } from '@/types/models';

/**
 * Ingredient Manager Component
 * 
 * A container component that brings together the ingredient list and editor
 */
export default function IngredientManager() {
  const {
    ingredients,
    loading,
    error,
    isAdding,
    isEditing,
    selectedIngredient,
    operationStatus,
    
    createIngredient,
    updateIngredient,
    deleteIngredient,
    startAddIngredient,
    startEditIngredient,
    cancelOperation,
  } = useIngredientManager();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Open modal when starting to add or edit
  const handleAddIngredient = () => {
    startAddIngredient();
    setIsModalOpen(true);
  };

  // Open modal and set selected ingredient
  const handleEditIngredient = (ingredient: Ingredient) => {
    startEditIngredient(ingredient);
    setIsModalOpen(true);
  };

  // Close modal and cancel operation
  const handleCloseModal = () => {
    setIsModalOpen(false);
    cancelOperation();
  };

  // Handle save ingredient
  const handleSaveIngredient = async (ingredientData: Omit<Ingredient, 'id' | 'created_at'>) => {
    if (isEditing && selectedIngredient) {
      return await updateIngredient(selectedIngredient.id, ingredientData);
    } else {
      const success = await createIngredient(ingredientData);
      
      // Only close the modal if successful and we're adding a new ingredient
      if (success && !isEditing) {
        setTimeout(() => {
          setIsModalOpen(false);
          cancelOperation();
        }, 1500);
      }
      
      return success;
    }
  };

  return (
    <>
      <IngredientList
        ingredients={ingredients}
        loading={loading}
        error={error}
        onAdd={handleAddIngredient}
        onEdit={handleEditIngredient}
        onDelete={deleteIngredient}
      />
      
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditing ? 'Edit Ingredient' : 'Add Ingredient'}
      >
        <IngredientEditor
          ingredient={selectedIngredient}
          onSave={handleSaveIngredient}
          onCancel={handleCloseModal}
          isEditing={isEditing}
        />
      </Modal>
    </>
  );
}