import React, { useState } from 'react';
import FeatureToggleBar from './FeatureToggleBar';

/**
 * Simple test component to render the FeatureToggleBar in isolation
 */
export default function TestFeatureToggleBar() {
  const [isVersioningEnabled, setIsVersioningEnabled] = useState(false);
  const [testRecipe] = useState({
    id: 'test-recipe-123',
    title: 'Test Recipe',
    description: 'A simple test recipe for development'
  });
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Feature Toggle Bar Test</h1>
      
      <div className="border border-gray-200 rounded-lg p-4 mb-8">
        <FeatureToggleBar 
          recipe={testRecipe}
          onToggleVersioning={setIsVersioningEnabled}
          isVersioningEnabled={isVersioningEnabled}
        />
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Component State:</h2>
        <div className="font-mono text-sm bg-white p-2 rounded border">
          <pre>isVersioningEnabled: {isVersioningEnabled.toString()}</pre>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recipe Details Preview</h2>
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium">{testRecipe.title}</h3>
          <p className="text-gray-600">{testRecipe.description}</p>
          
          {isVersioningEnabled ? (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800">Recipe Versions (Enabled)</h4>
              <p className="text-sm text-blue-600">
                This section would show recipe versions and history.
              </p>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <h4 className="font-medium text-gray-700">Recipe Versions</h4>
              <p className="text-sm text-gray-500 mb-2">
                Enable recipe versioning to track different iterations as you refine this recipe.
              </p>
              <button
                onClick={() => setIsVersioningEnabled(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Enable Versioning
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}