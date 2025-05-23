# DIY Formulation Terminology Transition Plan

This document outlines the strategy for completing the transition from "recipe" to "formulation" terminology throughout the codebase, ensuring consistent terminology that better reflects the DIY home product focus of the application.

## Current Status

We've implemented the first phase of the transition with the following changes:

1. Created TypeScript type aliases for all recipe-related data models
2. Updated UI text in key components to display "formulation" terminology
3. Added descriptive JSDoc comments to clarify the domain
4. Refactored key components to use "formulation" in variable names and functions
5. Updated hooks to use "formulation" terminology in comments and internal variables

## Phase 2: Complete Component Refactoring

### Component Renaming

Create new component files with formulation terminology that wrap and re-export the original components:

1. `FormulationDetails.tsx` → Wraps `RecipeDetails.tsx`
2. `FormulationForm.tsx` → Wraps `RecipeForm.tsx`
3. `FormulationList.tsx` → Wraps `RecipeList.tsx`
4. `FormulationVersion.tsx` → Wraps `RecipeIteration.tsx`
5. `FormulationAnalysis.tsx` → Wraps `RecipeAnalysis.tsx`
6. `DocumentCentricFormulation.tsx` → Wraps `DocumentCentricRecipe.tsx`

Example implementation pattern:

```tsx
// FormulationDetails.tsx
import RecipeDetails from './RecipeDetails';
import type { Recipe } from '../types/models';

export interface FormulationDetailsProps {
  formulationId: string | null;
  initialFormulationData?: Recipe | null;
}

export default function FormulationDetails({ 
  formulationId, 
  initialFormulationData 
}: FormulationDetailsProps) {
  return (
    <RecipeDetails 
      recipeId={formulationId} 
      initialRecipeData={initialFormulationData} 
    />
  );
}

// Also re-export for backward compatibility
export { RecipeDetails };
```

### Update Import References

For each file importing these components, update imports to use new component names:

```tsx
// Before
import RecipeDetails from './components/RecipeDetails';

// After 
import { FormulationDetails } from './components/FormulationDetails';
```

## Phase 3: Hook Refactoring

### Create Wrapper Hooks

1. `useFormulation.ts` → Wraps `useRecipe.ts`
2. `useFormulations.ts` → Wraps `useRecipes.ts`
3. `useFormulationVersion.ts` → Wraps `useRecipeIteration.ts`

Example implementation pattern:

```tsx
// useFormulation.ts
import { useRecipe } from './useRecipe';
import type { Formulation, FormulationWithIngredientsAndVersions } from '../types/models';

export interface FormulationUpdate {
  title: string;
  description: string;
  ingredients: any[];
}

export function useFormulation(
  id: string | null, 
  initialData?: FormulationWithIngredientsAndVersions | null
) {
  const { 
    recipe: formulation, 
    loading, 
    error, 
    updateRecipe: updateFormulation, 
    deleteRecipe: deleteFormulation,
    refetch
  } = useRecipe(id, initialData);

  return { 
    formulation, 
    loading, 
    error, 
    updateFormulation, 
    deleteFormulation,
    refetch
  };
}

// Also export original hook for backward compatibility
export { useRecipe };
```

### Update Import References

Update imports in components to use the new hooks:

```tsx
// Before
import { useRecipe } from '../hooks/useRecipe';

// After
import { useFormulation } from '../hooks/useFormulation';
```

## Phase 4: Prop and Parameter Refactoring

### Update Component Props

For each refactored component, update prop names to use formulation terminology with appropriate fallbacks:

```tsx
// Before
interface RecipeDetailsProps {
  recipeId: string | null;
  initialRecipeData?: Recipe | null;
}

// After
interface FormulationDetailsProps {
  formulationId?: string | null;
  recipeId?: string | null; // For backward compatibility
  initialFormulationData?: Formulation | null;
  initialRecipeData?: Recipe | null; // For backward compatibility
}

// Implementation with fallbacks
export default function FormulationDetails({ 
  formulationId, 
  recipeId,
  initialFormulationData,
  initialRecipeData
}: FormulationDetailsProps) {
  const id = formulationId || recipeId || null;
  const initialData = initialFormulationData || initialRecipeData || null;
  
  // Component implementation
}
```

## Phase 5: Database Refactoring Plan

Transitioning database table names requires careful planning to avoid disruption:

### Option 1: Create Database Views

1. Create database views that map new terminology to old tables:
   - View `formulations` → Table `recipes`
   - View `formulation_ingredients` → Table `recipe_ingredients`
   - View `formulation_versions` → Table `recipe_iterations`

2. Update database queries to use the views

3. Once all code is using the views, rename the tables and update the views

### Option 2: Database Migration

1. Create new tables with formulation naming
2. Migrate data from recipe tables to formulation tables
3. Update application code to use new tables
4. Once verified, remove old tables

## Phase 6: Comprehensive Testing

### Update Test Files

1. Create new test files with formulation terminology
2. Update assertions to check for formulation-related properties
3. Add specific tests for the terminology transition period
4. Ensure backward compatibility is maintained

### End-to-End Testing

1. Create E2E tests that verify the full user journey
2. Test both old and new terminology entry points
3. Verify that data correctly appears throughout the application

## Phase 7: Cleanup

Once the transition is complete and thoroughly tested:

1. Remove backward compatibility props and parameters
2. Remove type aliases, using only the formulation-based types
3. Remove old component and hook files
4. Update documentation to exclusively use formulation terminology

## Timeline and Dependencies

| Phase | Estimated Time | Dependencies |
|-------|----------------|--------------|
| Component Refactoring | 1 week | Type aliases |
| Hook Refactoring | 3 days | Component refactoring |
| Prop/Parameter Refactoring | 2 days | Hook refactoring |
| Database Refactoring | 1 week | Hook and component refactoring |
| Testing | 1 week | All previous phases |
| Cleanup | 2 days | Successful testing |

## Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Breaking changes | High | Medium | Use backward compatibility patterns, thorough testing |
| Database issues | High | Low | Use views before table changes, backup data |
| User confusion | Medium | Low | Update documentation, provide UI hints |
| Inconsistent terminology | Medium | Medium | Automated search for recipe terminology, code reviews |

## Conclusion

This transition plan provides a systematic approach to fully refactoring the codebase from "recipe" to "formulation" terminology. By following these phases, we can ensure a smooth transition while maintaining backward compatibility and minimizing disruption to users and developers.