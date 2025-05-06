import React, { useState, useEffect, useRef } from 'react';
import { Recipe, RecipeIteration, TransformedIngredient } from '@/types/models';
import { useRecipeIteration } from '@/hooks/useRecipeIteration';
import { useIngredients } from '@/hooks/useIngredients';
import { Edit, Check, Clock, ChevronRight, ChevronLeft, Plus, Copy, 
         MessageSquare, Award, Trash, Scale, ChefHat, Timer, Save,
         BookOpen, AlertTriangle, Star, PlusCircle, Printer } from 'lucide-react';

// Import print styles
import '@/styles/print-formulation.css';

/**
 * DocumentCentricRecipe - A redesigned recipe document component that integrates
 * viewing, editing, versioning, and AI suggestions into a cohesive experience.
 */
export default function DocumentCentricRecipe({ 
  recipeId,
  initialData 
}: { 
  recipeId: string;
  initialData?: Recipe | null;
}) {
  // States for the component
  const [activeVersion, setActiveVersion] = useState<RecipeIteration | null>(null);
  const [editMode, setEditMode] = useState<Record<string, boolean>>({
    title: false,
    description: false,
    ingredients: false,
    instructions: false,
    notes: false
  });
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string[]>>({});
  const [showVersionHistory, setShowVersionHistory] = useState(true);
  const [showTools, setShowTools] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [editIngredientId, setEditIngredientId] = useState<string | null>(null);
  const [newIngredient, setNewIngredient] = useState({ name: '', quantity: '', unit: '' });
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [instructionSteps, setInstructionSteps] = useState<string[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [makingMode, setMakingMode] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Refs
  const timerRef = useRef<any>(null);
  const [activeTimer, setActiveTimer] = useState<{
    stepIndex: number;
    duration: number;
    startTime: number;
    remaining: number;
    isRunning: boolean;
  } | null>(null);
  const [scaleRatio, setScaleRatio] = useState<number>(1);
  
  // Import simple mock data for testing
  const { mockSoapIterations, getMockIteration } = require('@/lib/mock-data-simple');
  
  // Get recipe data and iteration functions
  const {
    iterations,
    currentIteration,
    isLoading,
    error,
    createNewIteration,
    updateIterationDetails,
    updateIterationIngredients,
    compareIterations,
    getAISuggestions,
    setCurrentIteration,
  } = useRecipeIteration(recipeId);
  
  // For demo purposes, use mock data when API fails or when requested
  useEffect(() => {
    if (!iterations || iterations.length === 0 || initialData?.__useTestData) {
      console.log("Using simple mock data for testing");
      
      // Use either mock iterations from initialData or default mock data
      const mockIterations = initialData?.__mockIterations || mockSoapIterations;
      
      // Get the latest iteration
      const latestIteration = mockIterations[mockIterations.length - 1];
      
      // Set state with mock data
      setActiveVersion(latestIteration);
      
      // Parse instructions into steps
      if (latestIteration.instructions) {
        const steps = latestIteration.instructions
          .split(/\n+/)
          .map(step => step.trim())
          .filter(step => step.length > 0);
        
        setInstructionSteps(steps);
      }
      
      // Set edit values
      setEditValues({
        title: latestIteration.title || '',
        description: latestIteration.description || '',
        instructions: latestIteration.instructions || '',
        notes: latestIteration.notes || ''
      });
      
      // Create a reference to iterations for the component to use
      // This is a workaround to make the iterations visible in the UI
      console.log(`Setting mock iterations for version timeline: ${mockIterations.length} iterations available`);
      
      // Force component to use mock iterations
      (window as any).__mockIterationsForTimeline = mockIterations;
    }
  }, [recipeId, iterations, initialData?.__useTestData, initialData?.__mockIterations]);
  
  // Get available ingredients for adding to recipe
  const { ingredients: allIngredients, isLoading: ingredientsLoading } = useIngredients();

  // Set initial data when it loads
  useEffect(() => {
    if (currentIteration) {
      setActiveVersion(currentIteration);
      // Initialize edit values
      setEditValues({
        title: currentIteration.title || '',
        description: currentIteration.description || '',
        instructions: currentIteration.instructions || '',
        notes: currentIteration.notes || ''
      });
      
      // Parse instructions into steps for cooking mode
      if (currentIteration.instructions) {
        // Split by numbered pattern (1., 2., etc) or by line breaks
        const steps = currentIteration.instructions
          .split(/\n+/)
          .map(step => step.trim())
          .filter(step => step.length > 0);
        
        setInstructionSteps(steps);
      }
    }
  }, [currentIteration]);
  
  // Add keyboard shortcuts for making mode navigation
  useEffect(() => {
    if (!makingMode) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'j' || e.key === 'n') {
        // Next step
        setActiveStepIndex(prev => {
          if (prev === null) return 0;
          return prev < instructionSteps.length - 1 ? prev + 1 : prev;
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'k' || e.key === 'p') {
        // Previous step
        setActiveStepIndex(prev => {
          if (prev === null) return null;
          return prev > 0 ? prev - 1 : prev;
        });
      } else if (e.key === ' ' && activeTimer) {
        // Toggle timer play/pause with spacebar
        e.preventDefault(); // Prevent page scroll
        setActiveTimer(prev => 
          prev ? { ...prev, isRunning: !prev.isRunning } : null
        );
      } else if (e.key === 'Escape') {
        // Exit making mode
        if (confirm('Exit making mode?')) {
          toggleMakingMode();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [makingMode, instructionSteps.length, activeTimer, toggleMakingMode]);
  
  // Track unsaved changes
  useEffect(() => {
    if (!activeVersion) return;
    
    const hasChanges = 
      editMode.title || 
      editMode.description || 
      editMode.instructions || 
      editMode.notes || 
      editMode.ingredients ||
      showAddIngredient;
    
    setUnsavedChanges(hasChanges);
    
    // Warn before leaving if there are unsaved changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeVersion, editMode, showAddIngredient]);
  
  // Timer functionality
  useEffect(() => {
    if (!activeTimer) return;
    
    const interval = setInterval(() => {
      if (activeTimer.isRunning) {
        const elapsed = Date.now() - activeTimer.startTime;
        const remaining = Math.max(0, activeTimer.duration - elapsed);
        
        if (remaining <= 0) {
          // Timer is done
          setActiveTimer(prev => prev ? { ...prev, isRunning: false, remaining: 0 } : null);
          
          // Play a sound or notification
          const audio = new Audio('/timer-alert.mp3');
          audio.play().catch(e => console.error('Error playing timer sound:', e));
          
          // Show browser notification if possible
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Timer Complete', { 
              body: `Step ${activeTimer.stepIndex + 1} timer is complete!`,
              icon: '/timer-icon.png' 
            });
          }
          
          clearInterval(interval);
        } else {
          setActiveTimer(prev => prev ? { ...prev, remaining } : null);
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeTimer]);
  
  // Function to start a timer for the current step
  const startTimer = (minutes: number) => {
    if (activeStepIndex === null) return;
    
    // Convert minutes to milliseconds
    const duration = minutes * 60 * 1000;
    
    setActiveTimer({
      stepIndex: activeStepIndex,
      duration,
      startTime: Date.now(),
      remaining: duration,
      isRunning: true
    });
  };
  
  // Function to format the timer display
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Function to toggle making mode
  const toggleMakingMode = () => {
    setMakingMode(!makingMode);
    
    // Reset step index when entering making mode
    if (!makingMode) {
      setActiveStepIndex(null);
    }
    
    // Cancel any active timer when exiting making mode
    if (makingMode && activeTimer) {
      setActiveTimer(null);
    }
  };
  
  // Helper function to format scaled quantities
  const scaleQuantity = (quantity: string, ratio: number): string => {
    try {
      // Handle fractions like "1/2" or mixed numbers like "1 1/2"
      if (quantity.includes('/')) {
        if (quantity.includes(' ')) {
          // Mixed number (e.g., "1 1/2")
          const [whole, fraction] = quantity.split(' ');
          const [numerator, denominator] = fraction.split('/');
          
          const wholeNum = parseInt(whole, 10);
          const fracValue = parseInt(numerator, 10) / parseInt(denominator, 10);
          const scaledValue = (wholeNum + fracValue) * ratio;
          
          // Format to at most 2 decimal places, removing trailing zeros
          return scaledValue.toFixed(2).replace(/\.?0+$/, '');
        } else {
          // Simple fraction (e.g., "1/2")
          const [numerator, denominator] = quantity.split('/');
          const fracValue = parseInt(numerator, 10) / parseInt(denominator, 10);
          const scaledValue = fracValue * ratio;
          
          // Format to at most 2 decimal places, removing trailing zeros
          return scaledValue.toFixed(2).replace(/\.?0+$/, '');
        }
      }
      
      // Handle decimal quantities
      const numValue = parseFloat(quantity);
      if (isNaN(numValue)) {
        return quantity; // Return original if not a number
      }
      
      const scaledValue = numValue * ratio;
      // Format to at most 2 decimal places, removing trailing zeros
      return scaledValue.toFixed(2).replace(/\.?0+$/, '');
    } catch (error) {
      console.error('Error scaling quantity:', error);
      return quantity; // Return original on error
    }
  };

  // Toggle edit mode for a section
  const toggleEditMode = (section: string) => {
    if (editMode[section]) {
      // Save changes when exiting edit mode
      handleSaveSection(section);
    } else {
      // Initialize edit value from current data
      setEditValues({
        ...editValues,
        [section]: activeVersion?.[section as keyof RecipeIteration] || ''
      });
    }
    
    setEditMode({
      ...editMode,
      [section]: !editMode[section]
    });
  };

  // Handle text changes in edit mode
  const handleEditChange = (section: string, value: string) => {
    setEditValues({
      ...editValues,
      [section]: value
    });
  };

  // Save changes for a section
  const handleSaveSection = async (section: string) => {
    if (!activeVersion?.id) return;
    
    // Prepare updates object
    const updates: Record<string, any> = {
      [section]: editValues[section]
    };
    
    await updateIterationDetails(activeVersion.id, updates);
    
    // Exit edit mode
    setEditMode({
      ...editMode,
      [section]: false
    });
  };

  // Create a new version
  const handleCreateNewVersion = async () => {
    if (!activeVersion) return;
    
    // Create version with current data as base
    const newVersion = await createNewIteration(activeVersion, {
      title: `${activeVersion.title} (new version)`
    });
    
    if (newVersion) {
      setActiveVersion(newVersion);
      setCurrentIteration(newVersion);
    }
  };

  // Get AI suggestions for a section
  const handleGetSuggestions = async (section: string) => {
    if (!activeVersion) return;
    
    // Mock suggestions for demo - in production, use AI service
    const mockSuggestions: Record<string, string[]> = {
      ingredients: [
        "Consider adding 2% diastatic malt powder to improve rise and crust color.",
        "Try substituting 15% whole wheat flour for more complex flavor."
      ],
      instructions: [
        "Consider 6-8 hours at room temperature followed by overnight in refrigerator for better flavor development.",
        "Add a fold after the first hour for better gluten development."
      ],
      description: [
        "Mention the tanginess level in your description to set expectations.",
        "Include the approximate total time including fermentation."
      ]
    };
    
    setAiSuggestions({
      ...aiSuggestions,
      [section]: mockSuggestions[section] || []
    });
  };

  // Apply an AI suggestion
  const handleApplySuggestion = (section: string, suggestion: string) => {
    // Add the suggestion to the current text
    const currentText = editValues[section] || activeVersion?.[section as keyof RecipeIteration] || '';
    
    // For demo, we'll just append the suggestion
    // In production, use more sophisticated text insertion
    setEditValues({
      ...editValues,
      [section]: `${currentText}\n\n${suggestion}`
    });
    
    // Enter edit mode for the section
    setEditMode({
      ...editMode,
      [section]: true
    });
    
    // Remove the applied suggestion
    setAiSuggestions({
      ...aiSuggestions,
      [section]: aiSuggestions[section]?.filter(s => s !== suggestion) || []
    });
  };

  // Navigate between versions
  const handleVersionChange = (direction: 'prev' | 'next') => {
    if (!activeVersion) return;
    
    // Use mock iterations if no iterations from API
    const displayIterations = iterations?.length ? iterations : mockSoapIterations;
    if (!displayIterations?.length) return;
    
    const currentIndex = displayIterations.findIndex(v => v.id === activeVersion.id);
    if (currentIndex === -1) return;
    
    if (direction === 'prev' && currentIndex < displayIterations.length - 1) {
      setActiveVersion(displayIterations[currentIndex + 1]);
      if (typeof setCurrentIteration === 'function') {
        setCurrentIteration(displayIterations[currentIndex + 1]);
      }
    } else if (direction === 'next' && currentIndex > 0) {
      setActiveVersion(displayIterations[currentIndex - 1]);
      if (typeof setCurrentIteration === 'function') {
        setCurrentIteration(displayIterations[currentIndex - 1]);
      }
    }
  };

  // Render editable section with label
  const renderEditableSection = (
    label: string, 
    section: string, 
    content: string | null | undefined,
    placeholder: string = 'Add content here...',
    multiline: boolean = true
  ) => (
    <div className="mb-6 section">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-700 uppercase text-sm tracking-wider section-heading">{label}</h3>
        <button 
          onClick={() => toggleEditMode(section)}
          className="text-accent hover:text-accent-hover p-1 rounded edit-controls"
        >
          {editMode[section] ? <Check size={16} /> : <Edit size={16} />}
        </button>
      </div>
      <div className="border-b border-gray-200 w-full mb-3"></div>
      
      {editMode[section] ? (
        multiline ? (
          <textarea
            value={editValues[section] || ''}
            onChange={(e) => handleEditChange(section, e.target.value)}
            placeholder={placeholder}
            className="w-full p-2 border border-gray-300 rounded min-h-[100px] focus:border-accent focus:ring-1 focus:ring-accent"
          />
        ) : (
          <input
            type="text"
            value={editValues[section] || ''}
            onChange={(e) => handleEditChange(section, e.target.value)}
            placeholder={placeholder}
            className="w-full p-2 border border-gray-300 rounded focus:border-accent focus:ring-1 focus:ring-accent"
          />
        )
      ) : (
        <div className="prose max-w-none">
          {content ? (
            <div className="whitespace-pre-wrap">{content}</div>
          ) : (
            <div className="text-gray-400 italic">{placeholder}</div>
          )}
        </div>
      )}
      
      {/* AI Suggestions for this section */}
      {aiSuggestions[section]?.length > 0 && (
        <div className="mt-3">
          {aiSuggestions[section].map((suggestion, index) => (
            <div key={index} className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
              <div className="flex items-start">
                <div className="text-blue-500 mr-2">🤖</div>
                <div className="flex-grow">
                  <p className="text-blue-700 text-sm">{suggestion}</p>
                  <div className="mt-1 flex space-x-2">
                    <button 
                      onClick={() => handleApplySuggestion(section, suggestion)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded"
                    >
                      Apply
                    </button>
                    <button 
                      onClick={() => {
                        setAiSuggestions({
                          ...aiSuggestions,
                          [section]: aiSuggestions[section]?.filter((_, i) => i !== index) || []
                        });
                      }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 py-1 px-2 rounded"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add button to get AI suggestions if none shown */}
      {(!aiSuggestions[section] || aiSuggestions[section]?.length === 0) && (
        <button
          onClick={() => handleGetSuggestions(section)}
          className="mt-1 text-xs flex items-center text-accent hover:text-accent-hover"
        >
          <MessageSquare size={12} className="mr-1" />
          Get AI suggestions
        </button>
      )}
    </div>
  );

  // Add ingredient to current recipe version
  const handleAddIngredient = async () => {
    if (!activeVersion?.id || !newIngredient.name || !newIngredient.quantity) return;
    
    // Find or create ingredient
    let ingredientId = '';
    const existingIngredient = allIngredients?.find(
      ing => ing.name.toLowerCase() === newIngredient.name.toLowerCase()
    );
    
    if (existingIngredient) {
      ingredientId = existingIngredient.id;
    } else {
      // In a real implementation, you would create a new ingredient
      // For now, we'll just use the first available ingredient as a fallback
      if (allIngredients && allIngredients.length > 0) {
        ingredientId = allIngredients[0].id;
      } else {
        alert('No ingredients available in the database. Please add ingredients first.');
        return;
      }
    }
    
    // Add to current iteration
    const newIterationIngredient = {
      ingredient_id: ingredientId,
      quantity: newIngredient.quantity,
      unit: newIngredient.unit,
      notes: ''
    };
    
    // Update in database
    await updateIterationIngredients(activeVersion.id, [
      ...(activeVersion.ingredients || []).map(ing => ({
        ingredient_id: ing.id,
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes || ''
      })),
      newIterationIngredient
    ]);
    
    // Reset new ingredient form
    setNewIngredient({ name: '', quantity: '', unit: '' });
    setShowAddIngredient(false);
    
    // Mark unsaved changes
    setUnsavedChanges(true);
  };
  
  // Remove ingredient from current recipe version
  const handleRemoveIngredient = async (ingredientId: string) => {
    if (!activeVersion?.id) return;
    
    // Filter out the ingredient to remove
    const updatedIngredients = (activeVersion.ingredients || [])
      .filter(ing => ing.id !== ingredientId)
      .map(ing => ({
        ingredient_id: ing.id,
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes || ''
      }));
    
    // Update in database
    await updateIterationIngredients(activeVersion.id, updatedIngredients);
    
    // Mark unsaved changes
    setUnsavedChanges(true);
  };
  
  // Update ingredient quantity or unit
  const handleUpdateIngredient = async (ingredientId: string, data: { quantity?: string, unit?: string }) => {
    if (!activeVersion?.id) return;
    
    // Update the specific ingredient
    const updatedIngredients = (activeVersion.ingredients || []).map(ing => {
      if (ing.id === ingredientId) {
        return {
          ingredient_id: ing.id,
          quantity: data.quantity !== undefined ? data.quantity : ing.quantity,
          unit: data.unit !== undefined ? data.unit : ing.unit,
          notes: ing.notes || ''
        };
      }
      return {
        ingredient_id: ing.id,
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes || ''
      };
    });
    
    // Update in database
    await updateIterationIngredients(activeVersion.id, updatedIngredients);
    
    // Reset edit state
    setEditIngredientId(null);
    
    // Mark unsaved changes
    setUnsavedChanges(true);
  };

  // Render ingredients list with enhanced editing
  const renderIngredients = () => {
    const ingredients = activeVersion?.ingredients || [];
    
    return (
      <div className="mb-6 section">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-gray-700 uppercase text-sm tracking-wider section-heading">Ingredients</h3>
          <div className="flex items-center space-x-2 edit-controls">
            <button 
              onClick={() => setShowAddIngredient(!showAddIngredient)}
              className="text-accent hover:text-accent-hover p-1 rounded print-hide"
            >
              {showAddIngredient ? <Check size={16} /> : <PlusCircle size={16} />}
            </button>
            <button 
              onClick={() => toggleEditMode('ingredients')}
              className="text-accent hover:text-accent-hover p-1 rounded print-hide"
            >
              {editMode.ingredients ? <Check size={16} /> : <Edit size={16} />}
            </button>
          </div>
        </div>
        <div className="border-b border-gray-200 w-full mb-3"></div>
        
        {/* Add ingredient form */}
        {showAddIngredient && (
          <div className="mb-4 p-3 bg-surface-1 rounded-md">
            <h4 className="font-medium text-sm mb-2">Add New Ingredient</h4>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <label className="block text-xs text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                  placeholder="Ingredient name"
                  className="w-full p-1 text-sm border border-gray-300 rounded"
                  list="ingredient-suggestions"
                />
                <datalist id="ingredient-suggestions">
                  {allIngredients?.map(ing => (
                    <option key={ing.id} value={ing.name} />
                  ))}
                </datalist>
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                <input
                  type="text"
                  value={newIngredient.quantity}
                  onChange={(e) => setNewIngredient({...newIngredient, quantity: e.target.value})}
                  placeholder="Amount"
                  className="w-full p-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-gray-600 mb-1">Unit</label>
                <input
                  type="text"
                  value={newIngredient.unit}
                  onChange={(e) => setNewIngredient({...newIngredient, unit: e.target.value})}
                  placeholder="Unit"
                  className="w-full p-1 text-sm border border-gray-300 rounded"
                />
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button
                onClick={() => setShowAddIngredient(false)}
                className="text-xs text-gray-600 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddIngredient}
                disabled={!newIngredient.name || !newIngredient.quantity}
                className={`text-xs px-2 py-1 rounded ${
                  !newIngredient.name || !newIngredient.quantity
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-accent text-white hover:bg-accent-hover'
                }`}
              >
                Add
              </button>
            </div>
          </div>
        )}
        
        {ingredients.length > 0 ? (
          <ul className="space-y-2 ingredients-list">
            {ingredients.map((ingredient, index) => (
              <li 
                key={`${ingredient.id}-${index}`} 
                className={`flex justify-between items-center p-2 hover:bg-surface-1 rounded ingredient-item
                  ${selectedIngredient === ingredient.id ? 'bg-surface-1' : ''}
                  ${editIngredientId === ingredient.id ? 'bg-surface-1 border border-accent' : ''}`}
                onClick={() => setSelectedIngredient(ingredient.id)}
              >
                {editIngredientId === ingredient.id ? (
                  // Edit mode
                  <div className="w-full grid grid-cols-12 gap-2">
                    <div className="col-span-6">
                      <span className="text-sm font-medium">{ingredient.name}</span>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        defaultValue={ingredient.quantity}
                        className="w-full p-1 text-sm border border-gray-300 rounded"
                        id={`qty-${ingredient.id}`}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        defaultValue={ingredient.unit}
                        className="w-full p-1 text-sm border border-gray-300 rounded"
                        id={`unit-${ingredient.id}`}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const qtyEl = document.getElementById(`qty-${ingredient.id}`) as HTMLInputElement;
                          const unitEl = document.getElementById(`unit-${ingredient.id}`) as HTMLInputElement;
                          handleUpdateIngredient(ingredient.id, {
                            quantity: qtyEl?.value,
                            unit: unitEl?.value
                          });
                        }}
                        className="p-1 text-accent hover:text-accent-hover"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <span className={`${makingMode ? 'text-lg' : ''}`}>
                      {ingredient.name}
                    </span>
                    <div className="flex items-center">
                      <span className={`text-gray-600 ${makingMode ? 'text-lg font-medium' : ''}`}>
                        {makingMode 
                          ? scaleQuantity(ingredient.quantity, scaleRatio)
                          : ingredient.quantity} {ingredient.unit}
                      </span>
                      
                      {selectedIngredient === ingredient.id && !makingMode && (
                        <div className="flex ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditIngredientId(ingredient.id);
                            }}
                            className="p-1 text-accent hover:text-accent-hover"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Remove this ingredient?')) {
                                handleRemoveIngredient(ingredient.id);
                              }
                            }}
                            className="p-1 text-accent hover:text-accent-hover"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400 italic">No ingredients added yet.</div>
        )}
        
        {/* Scale controls when in making mode */}
        {makingMode && ingredients.length > 0 && (
          <div className="mt-4 p-3 bg-accent/10 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Scale size={16} className="mr-1 text-accent" />
                <span className="text-sm font-medium">Scale Recipe: {scaleRatio}×</span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setScaleRatio(0.5)}
                  className={`px-2 py-1 rounded ${
                    scaleRatio === 0.5 
                      ? 'bg-accent text-white' 
                      : 'bg-accent/20 text-accent hover:bg-accent/30'
                  }`}
                >
                  ½×
                </button>
                <button 
                  onClick={() => setScaleRatio(1)}
                  className={`px-2 py-1 rounded ${
                    scaleRatio === 1 
                      ? 'bg-accent text-white' 
                      : 'bg-accent/20 text-accent hover:bg-accent/30'
                  }`}
                >
                  1×
                </button>
                <button 
                  onClick={() => setScaleRatio(2)}
                  className={`px-2 py-1 rounded ${
                    scaleRatio === 2 
                      ? 'bg-accent text-white' 
                      : 'bg-accent/20 text-accent hover:bg-accent/30'
                  }`}
                >
                  2×
                </button>
                <button 
                  onClick={() => setScaleRatio(3)}
                  className={`px-2 py-1 rounded ${
                    scaleRatio === 3 
                      ? 'bg-accent text-white' 
                      : 'bg-accent/20 text-accent hover:bg-accent/30'
                  }`}
                >
                  3×
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              Adjust ingredient quantities for different serving sizes
            </div>
          </div>
        )}
        
        {/* AI Suggestions for ingredients */}
        {aiSuggestions.ingredients?.length > 0 && (
          <div className="mt-3">
            {aiSuggestions.ingredients.map((suggestion, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                <div className="flex items-start">
                  <div className="text-blue-500 mr-2">🤖</div>
                  <div className="flex-grow">
                    <p className="text-blue-700 text-sm">{suggestion}</p>
                    <div className="mt-1 flex space-x-2">
                      <button 
                        onClick={() => handleApplySuggestion('ingredients', suggestion)}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded"
                      >
                        Apply
                      </button>
                      <button 
                        onClick={() => {
                          setAiSuggestions({
                            ...aiSuggestions,
                            ingredients: aiSuggestions.ingredients?.filter((_, i) => i !== index) || []
                          });
                        }}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 py-1 px-2 rounded"
                      >
                        Ignore
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add button to get AI suggestions for ingredients */}
        {(!aiSuggestions.ingredients || aiSuggestions.ingredients?.length === 0) && (
          <button
            onClick={() => handleGetSuggestions('ingredients')}
            className="mt-1 text-xs flex items-center text-accent hover:text-accent-hover"
          >
            <MessageSquare size={12} className="mr-1" />
            Get ingredient suggestions
          </button>
        )}
      </div>
    );
  };

  // Render version timeline
  const renderVersionTimeline = () => {
    // Use mockSoapIterations if no iterations are available from the API
    // Also check our global window object for mock iterations
    const displayIterations = iterations?.length ? iterations : 
                              (window as any).__mockIterationsForTimeline || 
                              mockSoapIterations;
    
    if (!displayIterations?.length) return null;
    
    return (
      <div className="mb-6 bg-gradient-to-r from-surface-1 to-surface p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-gray-700">Recipe Timeline</h3>
          <button
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className="text-accent hover:text-accent-hover p-1 rounded"
          >
            {showVersionHistory ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {showVersionHistory && (
          <>
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => handleVersionChange('prev')}
                disabled={displayIterations.findIndex(v => v.id === activeVersion?.id) === displayIterations.length - 1}
                className={`p-1 rounded ${
                  displayIterations.findIndex(v => v.id === activeVersion?.id) === displayIterations.length - 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-accent hover:text-accent-hover'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex-grow overflow-x-auto">
                <div className="flex items-center space-x-1">
                  {displayIterations.map((iteration, index) => (
                    <div key={iteration.id} className="flex flex-col items-center">
                      <button
                        onClick={() => {
                          setActiveVersion(iteration);
                          if (typeof setCurrentIteration === 'function') {
                            setCurrentIteration(iteration);
                          }
                        }}
                        className={`whitespace-nowrap px-2 py-1 rounded text-xs ${
                          activeVersion?.id === iteration.id
                            ? 'bg-accent text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        v{iteration.version_number}
                      </button>
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-[60px]">
                        {new Date(iteration.created_at).toLocaleDateString()}
                      </div>
                      {index < displayIterations.length - 1 && (
                        <div className="h-[2px] bg-gray-300 w-10"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => handleVersionChange('next')}
                disabled={displayIterations.findIndex(v => v.id === activeVersion?.id) === 0}
                className={`p-1 rounded ${
                  displayIterations.findIndex(v => v.id === activeVersion?.id) === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-accent hover:text-accent-hover'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
            
            <button
              onClick={handleCreateNewVersion}
              className="w-full bg-accent hover:bg-accent-hover text-white py-2 px-4 rounded flex items-center justify-center mt-2"
            >
              <Plus size={16} className="mr-2" />
              Create New Version
            </button>
          </>
        )}
      </div>
    );
  };

  // Render tools panel
  const renderToolsPanel = () => (
    <div className="bg-surface-1 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-700">Recipe Tools</h3>
        <button
          onClick={() => setShowTools(!showTools)}
          className="text-accent hover:text-accent-hover p-1 rounded"
        >
          {showTools ? 'Hide' : 'Show'}
        </button>
      </div>
      
      {showTools && (
        <div className="divide-y divide-gray-200">
          <div className="py-2">
            <h4 className="text-sm font-medium mb-2">Actions</h4>
            <div className="space-y-2">
              <button
                onClick={handleCreateNewVersion}
                className="w-full text-left px-3 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded flex items-center"
              >
                <Copy size={16} className="mr-2" />
                Create New Version
              </button>
              <button
                onClick={() => {}}
                className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded flex items-center"
              >
                <Award size={16} className="mr-2" />
                Finalize Recipe
              </button>
            </div>
          </div>
          
          <div className="py-2">
            <h4 className="text-sm font-medium mb-2">Recipe Metrics</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium">{activeVersion?.version_number || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {activeVersion 
                    ? new Date(activeVersion.created_at).toLocaleDateString() 
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ingredients:</span>
                <span className="font-medium">{activeVersion?.ingredients?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Modified:</span>
                <span className="font-medium">
                  {activeVersion 
                    ? new Date(activeVersion.created_at).toLocaleString() 
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Function to handle printing
  const handlePrint = () => {
    // You could implement custom print behavior here
    // For now, we'll just use the browser's built-in print functionality
    window.print();
  };

  // Function to generate a print-friendly view (could open in new tab)
  const handlePrintPreview = () => {
    // Create a new window with just the essential content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Write the print-friendly HTML directly to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${activeVersion?.title || 'DIY Formulation'} - Print Version</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.5; padding: 2cm; }
            h1 { margin-bottom: 0.5cm; }
            h2 { margin-top: 1cm; text-transform: uppercase; font-size: 14pt; border-bottom: 1px solid #000; }
            .meta { color: #666; margin-bottom: 1cm; font-size: 10pt; }
            ul { padding-left: 0; list-style-type: none; }
            li { margin-bottom: 0.3cm; display: flex; justify-content: space-between; }
            .instructions { white-space: pre-wrap; }
            .footer { margin-top: 2cm; text-align: center; font-size: 9pt; color: #666; }
          </style>
        </head>
        <body>
          <h1>${activeVersion?.title || 'Untitled Formulation'}</h1>
          <div class="meta">Version ${activeVersion?.version_number || '1'} • Last updated: ${
            activeVersion ? new Date(activeVersion.created_at).toLocaleDateString() : 'N/A'
          }</div>
          
          <h2>Description</h2>
          <div>${activeVersion?.description || 'No description provided.'}</div>
          
          <h2>Ingredients</h2>
          <ul>
            ${(activeVersion?.ingredients || []).map(ingredient => `
              <li>
                <span>${ingredient.name}</span>
                <span>${ingredient.quantity} ${ingredient.unit}</span>
              </li>
            `).join('')}
          </ul>
          
          <h2>Instructions</h2>
          <div class="instructions">${activeVersion?.instructions || 'No instructions provided.'}</div>
          
          <h2>Notes</h2>
          <div>${activeVersion?.notes || 'No notes provided.'}</div>
          
          <div class="footer">
            Printed from DIY Recipes - ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `);
    
    // Trigger print once content is loaded
    printWindow.document.close();
    printWindow.addEventListener('load', () => {
      printWindow.print();
    });
  };

  // Main render
  if (isLoading) {
    return <div className="p-4">Loading recipe document...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading recipe: {error}</div>;
  }

  if (!activeVersion && !currentIteration) {
    return <div className="p-4">No recipe version found.</div>;
  }

  return (
    <div className="document-centric-recipe bg-white rounded-lg shadow-md overflow-hidden">
      {/* Document header */}
      <div className="bg-accent/10 p-4 header-section">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold mb-1 flex-grow">
            {editMode.title ? (
              <input
                type="text"
                value={editValues.title || ''}
                onChange={(e) => handleEditChange('title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:border-accent focus:ring-1 focus:ring-accent"
              />
            ) : (
              <div className="flex justify-between items-center">
                <span>{activeVersion?.title || 'Untitled Recipe'}</span>
                {!makingMode && (
                  <button 
                    onClick={() => toggleEditMode('title')}
                    className="text-accent hover:text-accent-hover p-1 rounded"
                  >
                    <Edit size={16} />
                  </button>
                )}
              </div>
            )}
          </h1>
          
          <div className="flex">
            {/* Print buttons */}
            <div className="mr-2 flex">
              <button
                onClick={handlePrint}
                className="px-2 py-1.5 rounded-l-full bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center print-hide"
                title="Print Formulation"
              >
                <Printer size={16} className="mr-1" />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                onClick={handlePrintPreview}
                className="px-2 py-1.5 rounded-r-full bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center print-hide border-l border-gray-300"
                title="Print Preview in New Tab"
              >
                <span className="hidden sm:inline">Preview</span>
              </button>
            </div>

            {/* Making Mode button */}
            <button
              onClick={toggleMakingMode}
              className={`px-3 py-1.5 rounded-full flex items-center ${
                makingMode 
                  ? 'bg-accent text-white hover:bg-accent-hover' 
                  : 'bg-accent/20 text-accent hover:bg-accent/30'
              }`}
            >
              <Scale size={16} className="mr-1.5" />
              <span>{makingMode ? 'Exit Making Mode' : 'Making Mode'}</span>
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
          <div>
            Version {activeVersion?.version_number || 1}
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            Last updated: {
              activeVersion
                ? new Date(activeVersion.created_at).toLocaleString()
                : 'N/A'
            }
          </div>
        </div>
        
        {makingMode && (
          <div className="mt-2 pt-2 border-t border-accent/20">
            <div className="text-sm flex items-center text-accent">
              <AlertTriangle size={14} className="mr-1" />
              <span>Making Mode enabled: Step-by-step procedure and timers activated</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Document body */}
      <div className="p-6">
        <div className="lg:flex lg:gap-6">
          {/* Main content area - 2/3 width on large screens */}
          <div className="lg:w-2/3">
            {/* Version timeline at the top */}
            {renderVersionTimeline()}
            
            {/* Document content */}
            {renderEditableSection(
              'Description', 
              'description', 
              activeVersion?.description,
              'Add a description of your recipe...'
            )}
            
            {renderIngredients()}
            
            {makingMode ? (
              // Making mode instructions display
              <div className="mb-6 section">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-700 uppercase text-sm tracking-wider section-heading">INSTRUCTIONS</h3>
                  <div className="flex items-center space-x-2 making-mode-controls">
                    <button
                      onClick={() => setMakingMode(false)}
                      className="text-accent hover:text-accent-hover p-1 rounded print-hide"
                    >
                      <BookOpen size={16} />
                    </button>
                  </div>
                </div>
                <div className="border-b border-gray-200 w-full mb-3"></div>
                
                {/* Step navigation */}
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setActiveStepIndex(prev => prev !== null && prev > 0 ? prev - 1 : null)}
                    disabled={activeStepIndex === null || activeStepIndex === 0}
                    className={`p-2 rounded ${
                      activeStepIndex === null || activeStepIndex === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'bg-accent/20 text-accent hover:bg-accent/30'
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="text-center">
                    {activeStepIndex !== null ? (
                      <span className="font-medium">Step {activeStepIndex + 1} of {instructionSteps.length}</span>
                    ) : (
                      <span className="text-accent hover:text-accent-hover">
                        <button onClick={() => setActiveStepIndex(0)}>Start Cooking</button>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveStepIndex(prev => 
                      prev !== null && prev < instructionSteps.length - 1 ? prev + 1 : null
                    )}
                    disabled={activeStepIndex === null || activeStepIndex === instructionSteps.length - 1}
                    className={`p-2 rounded ${
                      activeStepIndex === null || activeStepIndex === instructionSteps.length - 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'bg-accent/20 text-accent hover:bg-accent/30'
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                {/* Current step display */}
                {activeStepIndex !== null ? (
                  <div className="bg-surface-1 p-6 rounded-lg shadow-inner">
                    <div className="text-xl font-medium mb-2">Step {activeStepIndex + 1}</div>
                    <div className="text-lg whitespace-pre-wrap">
                      {instructionSteps[activeStepIndex]}
                    </div>
                    
                    {/* Timer controls for the step */}
                    <div className="mt-6 flex items-center">
                      <Timer size={18} className="text-accent mr-2" />
                      <div className="text-sm font-medium">
                        {activeTimer && activeTimer.stepIndex === activeStepIndex ? (
                          <div className="flex items-center">
                            <span className="font-bold">
                              {formatTime(activeTimer.remaining)}
                            </span>
                            <button 
                              onClick={() => setActiveTimer(prev => 
                                prev ? { ...prev, isRunning: !prev.isRunning } : null
                              )}
                              className="ml-2 text-xs bg-accent/20 text-accent hover:bg-accent/30 px-2 py-1 rounded"
                            >
                              {activeTimer.isRunning ? 'Pause' : 'Resume'}
                            </button>
                            <button 
                              onClick={() => setActiveTimer(null)}
                              className="ml-2 text-xs bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span>Add Timer</span>
                        )}
                      </div>
                      {(!activeTimer || activeTimer.stepIndex !== activeStepIndex) && (
                        <div className="ml-auto space-x-2">
                          <button 
                            onClick={() => startTimer(5)} 
                            className="bg-accent/20 text-accent hover:bg-accent/30 px-3 py-1 rounded"
                          >
                            5m
                          </button>
                          <button 
                            onClick={() => startTimer(10)}
                            className="bg-accent/20 text-accent hover:bg-accent/30 px-3 py-1 rounded"
                          >
                            10m
                          </button>
                          <button 
                            onClick={() => startTimer(15)}
                            className="bg-accent/20 text-accent hover:bg-accent/30 px-3 py-1 rounded"
                          >
                            15m
                          </button>
                          <button 
                            onClick={() => startTimer(30)}
                            className="bg-accent/20 text-accent hover:bg-accent/30 px-3 py-1 rounded"
                          >
                            30m
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Scale size={48} className="text-accent/50 mx-auto mb-4" />
                    <p className="text-lg">Ready to start making this formulation?</p>
                    <button 
                      onClick={() => setActiveStepIndex(0)}
                      className="mt-4 bg-accent text-white px-6 py-2 rounded-full hover:bg-accent-hover"
                    >
                      Start Making
                    </button>
                  </div>
                )}
                
                {/* Keyboard shortcuts info */}
                <div className="mt-6 bg-gray-100 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-sm">Keyboard Shortcuts</h4>
                    <div className="text-xs text-gray-500">
                      For faster navigation
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      <kbd className="bg-white border border-gray-300 shadow-sm rounded px-1.5 py-0.5 mr-1.5">→</kbd>
                      <span>Next step</span>
                    </div>
                    <div className="flex items-center">
                      <kbd className="bg-white border border-gray-300 shadow-sm rounded px-1.5 py-0.5 mr-1.5">←</kbd>
                      <span>Previous step</span>
                    </div>
                    <div className="flex items-center">
                      <kbd className="bg-white border border-gray-300 shadow-sm rounded px-1.5 py-0.5 mr-1.5">space</kbd>
                      <span>Toggle timer</span>
                    </div>
                    <div className="flex items-center">
                      <kbd className="bg-white border border-gray-300 shadow-sm rounded px-1.5 py-0.5 mr-1.5">esc</kbd>
                      <span>Exit making mode</span>
                    </div>
                  </div>
                </div>
                
                {/* All steps overview */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-sm">All Steps</h4>
                    <div className="text-xs text-gray-500">
                      Click a step to jump to it
                    </div>
                  </div>
                  <div className="space-y-2">
                    {instructionSteps.map((step, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveStepIndex(idx)}
                        className={`w-full text-left p-2 rounded text-sm ${
                          activeStepIndex === idx
                            ? 'bg-accent text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <div className="font-medium">Step {idx + 1}</div>
                        <div className="truncate">{step.substring(0, 60)}{step.length > 60 ? '...' : ''}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Normal edit mode instructions
              renderEditableSection(
                'Instructions', 
                'instructions', 
                activeVersion?.instructions,
                'Add step-by-step instructions...'
              )
            )}
            
            {renderEditableSection(
              'Notes & Observations', 
              'notes', 
              activeVersion?.notes,
              'Add notes, observations, or ideas for future improvements...'
            )}
          </div>
          
          {/* Side panel - 1/3 width on large screens */}
          <div className="lg:w-1/3 mt-6 lg:mt-0">
            {renderToolsPanel()}
            
            {/* More panels can be added here */}
          </div>
        </div>
      </div>
      
      {/* Footer with attribution - only visible when printing */}
      <div className="print-footer">
        <div>Printed from DIY Recipes - {new Date().toLocaleDateString()}</div>
        <div className="print-qr-code"></div>
        <div>Recipe version: {activeVersion?.version_number || 1}</div>
      </div>
    </div>
  );
}