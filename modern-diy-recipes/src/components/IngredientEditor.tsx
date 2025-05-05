'use client';

import React, { useState, useEffect } from 'react';
import type { Ingredient } from '@/types/models';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/hooks/useAudio';

interface IngredientEditorProps {
  ingredient?: Ingredient | null;
  onSave: (ingredient: Omit<Ingredient, 'id' | 'created_at'>) => Promise<boolean>;
  onCancel: () => void;
  isEditing: boolean;
}

export default function IngredientEditor({ 
  ingredient, 
  onSave, 
  onCancel,
  isEditing 
}: IngredientEditorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { playSound } = useAudio();

  // Initialize form with ingredient data if editing
  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name || '');
      setDescription(ingredient.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setError(null);
    setSuccess(false);
  }, [ingredient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      setError('Ingredient name is required');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const ingredientData = {
        name: name.trim(),
        description: description.trim() || null
      };
      
      const success = await onSave(ingredientData);
      
      if (success) {
        // Play success sound
        playSound('success');
        setSuccess(true);
        
        // Reset form if adding new ingredient
        if (!isEditing) {
          setName('');
          setDescription('');
        }
      } else {
        setError('Failed to save ingredient');
        playSound('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      playSound('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border-subtle shadow-soft">
      <div className="p-4 border-b border-border-subtle bg-surface-1 rounded-t-lg">
        <h2 className="text-xl font-semibold text-text">
          {isEditing ? 'Edit Ingredient' : 'Add New Ingredient'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && (
          <div className="p-3 bg-alert-red/10 border border-alert-red text-alert-red rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-success/10 border border-success text-success rounded">
            Ingredient saved successfully!
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="ingredient-name" className="text-text">
            Ingredient Name
          </Label>
          <Input
            id="ingredient-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter ingredient name"
            className={`w-full ${error && !name.trim() ? 'border-alert-red' : ''}`}
            disabled={isSaving}
            autoFocus
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ingredient-description" className="text-text">
            Description (optional)
          </Label>
          <Textarea
            id="ingredient-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter ingredient description"
            className="bg-surface-1 text-text border-border-subtle"
            disabled={isSaving}
          />
        </div>
        
        <div className="flex gap-3 justify-end mt-6">
          <Button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            variant="outline"
            className="border-border-subtle text-text-secondary hover:bg-surface-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-accent text-text-inverse hover:bg-accent-hover"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              'Save Ingredient'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}