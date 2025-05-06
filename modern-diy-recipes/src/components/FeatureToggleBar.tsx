import React, { useState, useEffect } from 'react';
import { Layers, ClipboardList, Settings, FileText, RotateCcw } from 'lucide-react';

/**
 * Feature Toggle Bar component that provides user-friendly access to features
 * like recipe versioning without requiring URL parameters or environment variables.
 */
export default function FeatureToggleBar({ 
  recipe, 
  onToggleVersioning, 
  isVersioningEnabled = false,
  onToggleDocumentMode,
  isDocumentModeEnabled = false
}) {
  const [showSettings, setShowSettings] = useState(false);

  // Check for features in local storage
  useEffect(() => {
    const storedSettings = localStorage.getItem('recipeFeatures');
    if (storedSettings) {
      try {
        const settings = JSON.parse(storedSettings);
        if (settings.versioning !== undefined && !isVersioningEnabled) {
          onToggleVersioning(settings.versioning);
        }
        if (settings.documentMode !== undefined && settings.documentMode !== isDocumentModeEnabled) {
          onToggleDocumentMode(settings.documentMode);
        }
      } catch (e) {
        console.error('Error parsing stored settings:', e);
      }
    }
  }, []);

  // Save settings to local storage
  const saveSettings = (versioning, documentMode) => {
    try {
      localStorage.setItem('recipeFeatures', JSON.stringify({ 
        versioning,
        documentMode: documentMode !== undefined ? documentMode : isDocumentModeEnabled
      }));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  };

  // Toggle versioning feature
  const handleToggleVersioning = (e) => {
    const enabled = e.target.checked;
    onToggleVersioning(enabled);
    saveSettings(enabled, isDocumentModeEnabled);
  };
  
  // Toggle document mode feature
  const handleToggleDocumentMode = (e) => {
    const enabled = e.target.checked;
    onToggleDocumentMode(enabled);
    saveSettings(isVersioningEnabled, enabled);
  };

  return (
    <div className="feature-toggle-bar bg-surface border-b border-subtle p-2 mb-4 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center text-sm font-medium text-text-secondary hover:text-text px-2 py-1 rounded hover:bg-surface-1"
          >
            <Settings size={16} className="mr-1" />
            <span>Features</span>
          </button>
          
          {isVersioningEnabled && (
            <div className="flex items-center text-sm font-medium text-accent bg-accent-light px-2 py-1 rounded mr-2">
              <Layers size={16} className="mr-1" />
              <span>Versioning Enabled</span>
            </div>
          )}
          
          {isDocumentModeEnabled && (
            <div className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
              <FileText size={16} className="mr-1" />
              <span>Document Mode</span>
            </div>
          )}
        </div>
        
        {recipe && (
          <div className="text-sm text-text-secondary">
            Recipe ID: <span className="font-mono">{recipe.id.substring(0, 8)}...</span>
          </div>
        )}
      </div>
      
      {showSettings && (
        <div className="mt-2 p-3 bg-surface-1 border border-subtle rounded shadow-md">
          <h3 className="text-sm font-semibold mb-2">Recipe Features</h3>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm">
              <input 
                type="checkbox" 
                checked={isVersioningEnabled} 
                onChange={handleToggleVersioning}
                className="rounded text-accent focus:ring-accent"
              />
              <span className="flex items-center">
                <Layers size={14} className="mr-1 text-accent" />
                Recipe Versioning
              </span>
              <span className="text-xs text-text-tertiary ml-2">
                Track different iterations of your recipe
              </span>
            </label>
            
            <label className="flex items-center space-x-2 text-sm opacity-60 cursor-not-allowed">
              <input type="checkbox" disabled className="rounded text-muted" />
              <span className="flex items-center">
                <ClipboardList size={14} className="mr-1" />
                Version Comparison
              </span>
              <span className="text-xs text-text-tertiary ml-2">
                Compare different versions (requires versioning)
              </span>
            </label>
            
            <label className="flex items-center space-x-2 text-sm">
              <input 
                type="checkbox" 
                checked={isDocumentModeEnabled} 
                onChange={handleToggleDocumentMode}
                className="rounded text-green-600 focus:ring-green-500"
              />
              <span className="flex items-center">
                <FileText size={14} className="mr-1 text-green-600" />
                Document-Centric View
              </span>
              <span className="text-xs text-text-tertiary ml-2">
                View and edit as a unified document
              </span>
            </label>
            
            <label className="flex items-center space-x-2 text-sm opacity-60 cursor-not-allowed">
              <input type="checkbox" disabled className="rounded text-muted" />
              <span className="flex items-center">
                <RotateCcw size={14} className="mr-1" />
                Auto-Versioning
              </span>
              <span className="text-xs text-text-tertiary ml-2">
                Automatically create versions when recipe changes
              </span>
            </label>
          </div>
          
          <div className="mt-3 text-xs text-text-tertiary bg-alert-blue-light p-2 rounded">
            <p>Recipe versioning lets you track different iterations of your recipes as you refine them.</p>
          </div>
        </div>
      )}
    </div>
  );
}