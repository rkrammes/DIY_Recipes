# Terminology Transition: Recipe → Formulation

This document outlines the completed transition from "recipe" terminology to "formulation" terminology throughout the DIY Recipes application.

## Background

The DIY Recipes application has been renamed to DIY Formulations to better reflect its purpose as a tool for creating and managing DIY chemical formulations rather than food recipes. This required a comprehensive terminology transition throughout the codebase.

## Implementation Approach

We used a **wrapper-based approach** that maintains backward compatibility while providing a clear path forward with the new terminology:

1. The original "recipe" components and hooks are still available but wrapped with new formulation-named components
2. All UI text visible to users has been updated to use "formulation" terminology
3. Routes have been updated with redirects from old paths to new ones
4. New API functions use formulation terminology while maintaining compatibility with existing functions

## Summary of Changes

### Components
- Created FormulationDetails, FormulationForm, FormulationAnalysis, and FormulationVersionManager components
- Updated DocumentCentricFormulation and AISuggestions components
- Updated text in TripleColumnLayout and FeatureToggleBar components

### Hooks
- Updated useFormulation and useFormulationVersion hooks 

### Routes
- Created formulations routes with proper pages
- Added redirects from recipes routes to formulations routes
- Updated Navigation component links to point to /formulations

### API Functions
- Updated directApi.ts with formulation-named functions while maintaining backward compatibility

## Database Compatibility

For database compatibility, we've maintained the use of the original table names:
- The 'recipes' table remains with that name
- The 'recipe_ingredients' junction table remains with that name
- The 'iterations' table remains with that name

This approach allows us to transition the UI terminology without requiring a database migration.

## Examples of Renamed Components

### Original Components
- RecipeDetails.tsx
- RecipeForm.tsx
- RecipeAnalysis.tsx
- RecipeIterationManager.tsx

### New Wrapper Components
- FormulationDetails.tsx
- FormulationForm.tsx
- FormulationAnalysis.tsx
- FormulationVersionManager.tsx

## Route Changes

We've implemented the following route changes:
- /recipes → /formulations
- /recipes/[id] → /formulations/[id]
- / → /formulations (with redirect)

## Future Steps

While the current implementation uses wrapper components for backward compatibility, future improvements could include:

1. Renaming the database tables to match the new terminology
2. Gradually migrating to use the formulation components directly instead of wrappers
3. Complete removal of recipe terminology once all components are migrated

## Testing

The terminology transition has been tested by:
1. Verifying all UI elements display "formulation" instead of "recipe"
2. Ensuring redirects work properly from old routes to new routes
3. Confirming all functionality continues to work with the new terminology

## Conclusion

The transition from "recipe" to "formulation" terminology has been successfully completed, providing a more accurate representation of the application's purpose while maintaining full backward compatibility with existing code and data.