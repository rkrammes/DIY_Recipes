# Document-Centric Interface for DIY Formulations - Visual Implementation Guide

## Overview 

This guide provides a visual walkthrough of how the document-centric interface for DIY formulations has been implemented, demonstrating the key components, terminology changes, and user flow.

## FeatureToggleBar & Integration

The document-centric interface is toggled via the Feature Toggle bar in the top section of the recipe details page:

```jsx
{/* Feature Toggle Bar */}
<FeatureToggleBar 
  recipe={recipe}
  onToggleVersioning={setIsVersioningEnabled}
  isVersioningEnabled={isVersioningEnabled}
  onToggleDocumentMode={setIsDocumentModeEnabled}
  isDocumentModeEnabled={isDocumentModeEnabled}
/>
```

![Feature Toggle](https://i.imgur.com/placeholder1.png)

When the toggle is activated, the document-centric view is shown instead of the traditional view:

```jsx
{/* Document-Centric View */}
{isDocumentModeEnabled ? (
  <DocumentCentricRecipe 
    recipeId={recipe.id} 
    initialData={recipe}
  />
) : (
  /* Traditional View */
  <>
    {/* Original recipe display code */}
  </>
)}
```

## Document-Centric Interface Components

### 1. Document Header with Creation Mode Toggle

```jsx
<div className="flex">
  {/* Print buttons */}
  <div className="mr-2 flex">
    <button onClick={handlePrint} className="px-2 py-1.5 rounded-l-full bg-gray-200">
      <Printer size={16} className="mr-1" />
      <span className="hidden sm:inline">Print</span>
    </button>
    <button onClick={handlePrintPreview} className="px-2 py-1.5 rounded-r-full bg-gray-200">
      <span className="hidden sm:inline">Preview</span>
    </button>
  </div>

  {/* Creation Mode button */}
  <button
    onClick={toggleMakingMode}
    className={`px-3 py-1.5 rounded-full flex items-center ${
      makingMode 
        ? 'bg-accent text-white hover:bg-accent-hover' 
        : 'bg-accent/20 text-accent hover:bg-accent/30'
    }`}
  >
    <Scale size={16} className="mr-1.5" />
    <span>{makingMode ? 'Exit Creation Mode' : 'Creation Mode'}</span>
  </button>
</div>
```

![Document Header](https://i.imgur.com/placeholder2.png)

### 2. Creation Mode Interface

When Creation Mode is active, the interface displays:

```jsx
{makingMode && (
  <div className="mt-2 pt-2 border-t border-accent/20">
    <div className="text-sm flex items-center text-accent">
      <AlertTriangle size={14} className="mr-1" />
      <span>Creation Mode enabled: Step-by-step procedure and timers activated</span>
    </div>
  </div>
)}
```

![Creation Mode Alert](https://i.imgur.com/placeholder3.png)

Creation Mode includes:
- Step-by-step guidance
- Timer functionality
- Scale controls for batch sizes

```jsx
{/* Step navigation */}
<div className="flex justify-between items-center mb-4">
  <button
    onClick={() => setActiveStepIndex(prev => prev !== null && prev > 0 ? prev - 1 : null)}
    disabled={activeStepIndex === null || activeStepIndex === 0}
    className={`p-2 rounded ${/*...*/}`}
  >
    <ChevronLeft size={20} />
  </button>
  <div className="text-center">
    {activeStepIndex !== null ? (
      <span className="font-medium">Step {activeStepIndex + 1} of {instructionSteps.length}</span>
    ) : (
      <span className="text-accent hover:text-accent-hover">
        <button onClick={() => setActiveStepIndex(0)}>Start Creating</button>
      </span>
    )}
  </div>
  <button
    onClick={() => setActiveStepIndex(prev => 
      prev !== null && prev < instructionSteps.length - 1 ? prev + 1 : null
    )}
    disabled={activeStepIndex === null || activeStepIndex === instructionSteps.length - 1}
    className={`p-2 rounded ${/*...*/}`}
  >
    <ChevronRight size={20} />
  </button>
</div>
```

![Step Navigation](https://i.imgur.com/placeholder4.png)

### 3. Formulation Timeline

For version navigation:

```jsx
<div className="mb-6 bg-gradient-to-r from-surface-1 to-surface p-4 rounded-lg">
  <div className="flex justify-between items-center mb-2">
    <h3 className="font-bold text-gray-700">Formulation Timeline</h3>
    <button
      onClick={() => setShowVersionHistory(!showVersionHistory)}
      className="text-accent hover:text-accent-hover p-1 rounded"
    >
      {showVersionHistory ? 'Hide' : 'Show'}
    </button>
  </div>
  
  {/* Version timeline navigation */}
</div>
```

![Formulation Timeline](https://i.imgur.com/placeholder5.png)

### 4. Formulation Tools Panel

```jsx
<div className="bg-surface-1 rounded-lg p-4 mb-6">
  <div className="flex justify-between items-center mb-2">
    <h3 className="font-bold text-gray-700">Formulation Tools</h3>
    <button onClick={() => setShowTools(!showTools)}>
      {showTools ? 'Hide' : 'Show'}
    </button>
  </div>
  
  {showTools && (
    <div className="divide-y divide-gray-200">
      <div className="py-2">
        <h4 className="text-sm font-medium mb-2">Actions</h4>
        <div className="space-y-2">
          <button onClick={handleCreateNewVersion}>
            <Copy size={16} className="mr-2" />
            Create New Version
          </button>
          <button onClick={() => {}}>
            <Award size={16} className="mr-2" />
            Finalize Formulation
          </button>
        </div>
      </div>
      
      <div className="py-2">
        <h4 className="text-sm font-medium mb-2">Formulation Metrics</h4>
        {/* Metrics content */}
      </div>
    </div>
  )}
</div>
```

![Formulation Tools](https://i.imgur.com/placeholder6.png)

### 5. Print Footer

```jsx
{/* Footer with attribution - only visible when printing */}
<div className="print-footer">
  <div>Printed from DIY Formulations - {new Date().toLocaleDateString()}</div>
  <div className="print-qr-code"></div>
  <div>Formulation version: {activeVersion?.version_number || 1}</div>
</div>
```

## Terminology Changes

### Before & After Examples

| Before (Recipe-Centric) | After (Formulation-Centric) |
|-------------------------|----------------------------|
| Making Mode | Creation Mode |
| Recipe Timeline | Formulation Timeline |
| Recipe Tools | Formulation Tools |
| Recipe Metrics | Formulation Metrics |
| Start Making | Start Creating |
| Exit Making Mode | Exit Creation Mode |
| Adjust ingredient quantities for different serving sizes | Adjust ingredient quantities for different batch sizes |
| Printed from DIY Recipes | Printed from DIY Formulations |
| Recipe version | Formulation version |

## Implementation Details

The implementation focused on three main files:

1. **DocumentCentricRecipe.tsx** - Main component with all functionality
2. **FeatureToggleBar.tsx** - Interface for toggling the document view
3. **print-formulation.css** - Styling for printed output

### Code Structure

```
src/
├── components/
│   ├── DocumentCentricRecipe.tsx     # Main component
│   ├── FeatureToggleBar.tsx          # Toggle interface
│   └── RecipeDetails.tsx             # Integration point
├── styles/
│   └── print-formulation.css         # Print styling
└── lib/
    └── mock-data-simple.js           # Test data
```

## User Flow

1. User opens a recipe/formulation
2. User clicks "Features" button in the top toolbar
3. User enables "Document-Centric View" toggle
4. Interface switches to document-centric mode
5. User can now:
   - Toggle Creation Mode for step-by-step guidance
   - Use the Formulation Timeline to navigate versions
   - Edit any section inline 
   - Print the formulation in a clean format
6. User preference is saved in localStorage for next visit

## Conclusion

The document-centric interface provides a cohesive experience for working with DIY formulations, using appropriate terminology and dedicated tools for creating and refining formulations. The implementation is fully integrated with the existing application and accessible via the Feature Toggle bar.