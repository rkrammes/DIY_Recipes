'use client';

import React, { useState } from 'react';
import Link from 'next/link';

/**
 * A minimal document-centric formulation interface for testing
 */
export default function SimpleDocPage() {
  // Basic state for the document
  const [title, setTitle] = useState('DIY Moisturizing Soap Bar');
  const [ingredients, setIngredients] = useState([
    { id: '1', name: 'Coconut Oil', quantity: '16', unit: 'oz' },
    { id: '2', name: 'Olive Oil', quantity: '12', unit: 'oz' },
    { id: '3', name: 'Shea Butter', quantity: '4', unit: 'oz' },
    { id: '4', name: 'Distilled Water', quantity: '10', unit: 'oz' },
    { id: '5', name: 'Lye (Sodium Hydroxide)', quantity: '4.7', unit: 'oz' }
  ]);
  const [instructions, setInstructions] = useState(`Step 1: Prepare all ingredients and measure them accurately.
Step 2: Melt the coconut oil and shea butter in a double boiler.
Step 3: Slowly add the lye to cold water in a separate container (never add water to lye).
Step 4: Once both mixtures reach about 100°F, slowly pour the lye water into the oils.
Step 5: Blend with a stick blender until trace is reached.
Step 6: Add essential oils and mix briefly.
Step 7: Pour into molds and insulate with towels.
Step 8: Let set for 24-48 hours before unmolding.
Step 9: Cure for 4-6 weeks before using.`);
  
  // UI state
  const [makingMode, setMakingMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Parse instructions into steps
  const steps = instructions.split('\n').filter(s => s.trim().length > 0);
  
  return (
    <div className="container mx-auto p-4">
      <nav className="flex items-center mb-6 text-sm">
        <Link 
          href="/"
          className="text-blue-500 hover:text-blue-700"
        >
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">Simple Document View</span>
      </nav>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-50 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <div className="text-sm text-gray-600">Version 1</div>
          </div>
          
          <button
            onClick={() => setMakingMode(!makingMode)}
            className={`px-3 py-1.5 rounded-full flex items-center ${
              makingMode 
                ? 'bg-blue-500 text-white' 
                : 'bg-blue-100 text-blue-500'
            }`}
          >
            <span>{makingMode ? 'Exit Making Mode' : 'Making Mode'}</span>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Ingredients Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-700 uppercase text-sm tracking-wider">Ingredients</h3>
              <button 
                onClick={() => setEditMode(!editMode)}
                className="text-blue-500 hover:text-blue-700 p-1 rounded"
              >
                {editMode ? '✓' : '✎'}
              </button>
            </div>
            <div className="border-b border-gray-200 w-full mb-3"></div>
            
            <ul className="space-y-2">
              {ingredients.map((ingredient) => (
                <li 
                  key={ingredient.id} 
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                >
                  <span className={`${makingMode ? 'text-lg' : ''}`}>
                    {ingredient.name}
                  </span>
                  <span className={`text-gray-600 ${makingMode ? 'text-lg font-medium' : ''}`}>
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Instructions Section */}
          {makingMode ? (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-700 uppercase text-sm tracking-wider">INSTRUCTIONS</h3>
                <div className="text-sm text-blue-500">Step {currentStep + 1} of {steps.length}</div>
              </div>
              <div className="border-b border-gray-200 w-full mb-3"></div>
              
              {/* Step Navigation */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className={`p-2 rounded ${
                    currentStep === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-500 hover:bg-blue-200'
                  }`}
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                  className={`p-2 rounded ${
                    currentStep === steps.length - 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-500 hover:bg-blue-200'
                  }`}
                >
                  Next →
                </button>
              </div>
              
              {/* Current Step Display */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                <div className="text-xl font-medium mb-2">Step {currentStep + 1}</div>
                <div className="text-lg whitespace-pre-wrap">
                  {steps[currentStep]}
                </div>
              </div>
              
              {/* All Steps Overview */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-sm">All Steps</h4>
                  <div className="text-xs text-gray-500">
                    Click a step to jump to it
                  </div>
                </div>
                <div className="space-y-2">
                  {steps.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`w-full text-left p-2 rounded text-sm ${
                        currentStep === idx
                          ? 'bg-blue-500 text-white'
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
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-700 uppercase text-sm tracking-wider">Instructions</h3>
                <button 
                  onClick={() => setEditMode(!editMode)}
                  className="text-blue-500 hover:text-blue-700 p-1 rounded"
                >
                  {editMode ? '✓' : '✎'}
                </button>
              </div>
              <div className="border-b border-gray-200 w-full mb-3"></div>
              
              {editMode ? (
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded min-h-[200px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{instructions}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}