# Terminology Cleanup Plan

This document outlines specific changes needed to complete the transition from "recipe" to "formulation" terminology throughout the codebase, with detailed tasks for each component and file.

## Immediate Updates

### 1. UI Text Updates

Update any remaining user-facing text that uses "recipe" terminology:

| File | Line(s) | Current Text | Updated Text |
|------|---------|--------------|--------------|
| src/components/Navigation.tsx | 19, 33 | DIY Recipes | DIY Formulations |
| src/components/Navigation.tsx | 53 | DIY Recipes | DIY Formulations |
| src/components/Navigation.tsx | 66 | Recipes | Formulations |
| src/components/RecipeForm.tsx | 71 | Edit Recipe/Add Recipe | Edit Formulation/Add Formulation |
| src/components/RecipeList.tsx | 92 | No recipes found. | No formulations found. |
| src/components/RecipeDetails.tsx | 145 | Select a recipe to view details. | Select a formulation to view details. |

### 2. Console Log/Warning Messages

Update developer-facing messages in console logs for consistency:

| File | Line(s) | Current Message | Updated Message |
|------|---------|-----------------|----------------|
| src/components/RecipeList.tsx | 103-104 | Rendering RecipeList with: | Rendering FormulationList with: |
| src/components/RecipeList.tsx | 116 | Invalid recipe object: | Invalid formulation object: |
| src/components/RecipeList.tsx | 129 | Re-selecting same recipe: | Re-selecting same formulation: |
| src/components/RecipeList.tsx | 138 | Selecting recipe: | Selecting formulation: |
| src/hooks/useRecipe.ts | Various | Various recipe logs | Replace with formulation terminology |

### 3. Variable Names Updates

Update key variable names in the components we've already modified:

| File | Variable | Updated Variable |
|------|----------|------------------|
| src/components/FeatureToggleBar.tsx | recipe | formulation |
| src/components/RecipeDetails.tsx | recipeId | formulationId |
| src/components/RecipeDetails.tsx | recipe | formulation |
| src/components/RecipeDetails.tsx | initialRecipeData | initialFormulationData |
| src/hooks/useRecipeIteration.ts | recipeId | formulationId |

## Component Creation Tasks

Create new wrapper components with formulation terminology:

### 1. Create FormulationList.tsx

```typescript
// FormulationList.tsx
import RecipeList from './RecipeList';
import type { RecipeListItem } from './RecipeList';

export type FormulationListItem = RecipeListItem;

export interface FormulationListProps {
  initialFormulations: FormulationListItem[] | null;
  initialError?: any;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function FormulationList({ 
  initialFormulations, 
  initialError,
  selectedId, 
  onSelect 
}: FormulationListProps) {
  return (
    <RecipeList
      initialRecipes={initialFormulations}
      initialError={initialError}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  );
}

// Re-export original component for backward compatibility
export { RecipeList };
```

### 2. Create FormulationForm.tsx

```typescript
// FormulationForm.tsx
import RecipeForm from './RecipeForm';
import type { Recipe, Ingredient, TransformedIngredient, RecipeWithIngredientsAndIterations, Formulation, FormulationWithIngredientsAndVersions } from '../types/models';

export interface FormulationFormProps {
  formulation?: FormulationWithIngredientsAndVersions | null;
  allIngredients: Ingredient[];
  onSave: (updatedFormulation: Partial<FormulationWithIngredientsAndVersions>) => Promise<void>;
  onCancel: () => void;
}

export default function FormulationForm({ 
  formulation, 
  allIngredients, 
  onSave, 
  onCancel 
}: FormulationFormProps) {
  return (
    <RecipeForm
      recipe={formulation}
      allIngredients={allIngredients}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}

// Re-export original component for backward compatibility
export { RecipeForm };
```

### 3. Create DocumentCentricFormulation.tsx

```typescript
// DocumentCentricFormulation.tsx
import DocumentCentricRecipe from './DocumentCentricRecipe';
import type { Formulation } from '../types/models';

export interface DocumentCentricFormulationProps {
  formulationId: string;
  initialData?: Formulation | null;
}

export default function DocumentCentricFormulation({ 
  formulationId, 
  initialData 
}: DocumentCentricFormulationProps) {
  return (
    <DocumentCentricRecipe
      recipeId={formulationId}
      initialData={initialData}
    />
  );
}

// Re-export original component for backward compatibility
export { DocumentCentricRecipe };
```

### 4. Create FormulationDetails.tsx

```typescript
// FormulationDetails.tsx
import RecipeDetails from './RecipeDetails';
import type { FormulationWithIngredientsAndVersions } from '../types/models';

export interface FormulationDetailsProps {
  formulationId: string | null;
  initialFormulationData?: FormulationWithIngredientsAndVersions | null;
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

// Re-export original component for backward compatibility
export { RecipeDetails };
```

## Hook Creation Tasks

Create new wrapper hooks with formulation terminology:

### 1. Create useFormulation.ts

```typescript
// useFormulation.ts
import { useRecipe } from './useRecipe';
import type { Formulation, FormulationWithIngredientsAndVersions } from '../types/models';

interface FormulationUpdate {
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

// Re-export original hook for backward compatibility
export { useRecipe };
```

### 2. Create useFormulationVersion.ts

```typescript
// useFormulationVersion.ts
import { useRecipeIteration } from './useRecipeIteration';
import type { Formulation, FormulationVersion } from '../types/models';

export function useFormulationVersion(initialFormulationId?: string) {
  const {
    iterations: versions,
    currentIteration: currentVersion,
    isLoading,
    error,
    fetchIterations: fetchVersions,
    createNewIteration: createNewVersion,
    updateIterationDetails: updateVersionDetails,
    updateIterationIngredients: updateVersionIngredients,
    compareIterations: compareVersions,
    getAISuggestions,
    setCurrentIteration: setCurrentVersion,
    fetchIterationIngredients: fetchVersionIngredients
  } = useRecipeIteration(initialFormulationId);
  
  return {
    versions,
    currentVersion,
    isLoading,
    error,
    fetchVersions,
    createNewVersion,
    updateVersionDetails,
    updateVersionIngredients,
    compareVersions,
    getAISuggestions,
    setCurrentVersion,
    fetchVersionIngredients
  };
}

// Re-export original hook for backward compatibility
export { useRecipeIteration };
```

## Navigation Updates

Update navigation and routes:

```typescript
// Update Navigation.tsx to use formulation terminology
<Link href="/" className="text-xl font-semibold text-text mr-8 flex items-center gap-2">
  <ThemedIcon iconType="recipe" width={20} height={20} />
  DIY Formulations
</Link>
          
<div className="flex items-center space-x-1">
  <Link 
    href="/" 
    className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
      pathname === '/' 
        ? 'bg-surface-2 text-text font-medium' 
        : 'text-text-secondary hover:text-text hover:bg-surface-2'
    }`}
  >
    <ThemedIcon iconType="recipe" width={16} height={16} />
    Formulations
  </Link>
  ...
```

## App Integration

Create new routes for formulations to coexist with recipes during transition:

```typescript
// Add new routes in src/app/formulations/[id]/page.tsx that mirror the recipes routes
// This allows for a gradual transition
```

## Implementation Order

1. First update UI text and messages to immediately improve user experience
2. Create the wrapper components and hooks without changing imports
3. Update a single section of the app to use the new terminology
4. Test thoroughly
5. Expand the changes to more sections of the app
6. Update routes
7. Deploy with both nomenclatures available
8. Once stable, deprecate the recipe terminology

## Testing Considerations

1. Create tests that verify both recipe and formulation terminology works
2. Add specific tests for the wrapper components
3. Ensure data persistence works correctly regardless of terminology used
4. Test navigation between routes using both terminologies

## Documentation Updates

Update all documentation to use formulation terminology:

1. README.md
2. API documentation
3. Component documentation
4. Code comments

## Long-term Database Planning

1. Create database migration scripts to rename tables
2. Create views for backward compatibility
3. Update database queries across the app
4. Test database performance with new structure
5. Deploy database changes only after UI changes are stable

## Success Metrics

1. All user-facing text consistently uses "formulation" terminology
2. All new code uses the new terminology
3. Existing functionality works without disruption
4. Test coverage remains high
5. Performance is not degraded

This plan provides a detailed roadmap for executing the terminology transition from "recipe" to "formulation" across the codebase in a way that maintains backward compatibility and minimizes disruption.