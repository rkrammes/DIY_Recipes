# DIY Formulations Testing Plan

This document outlines a practical testing approach for the DIY Formulations application after debugging and resolving the network connectivity issues.

## Prerequisite: Fix Network Connectivity

Before proceeding with the tests below, the networking issues must be resolved using the approaches described in the `NETWORKING_SOLUTIONS.md` document.

## 1. Core Functionality Tests

### 1.1. Module Registry System

**Test procedure:**
1. Start the application with the `--mode=minimal` flag
2. Open browser developer tools and execute:
   ```javascript
   const registry = window.ModuleRegistry.getInstance();
   console.log(registry.getAllModules());
   ```
3. Verify modules are correctly registered
4. Test enabling/disabling a module:
   ```javascript
   registry.setModuleEnabled('formulation', false);
   console.log(registry.isModuleEnabled('formulation'));
   // Should return false
   registry.setModuleEnabled('formulation', true);
   console.log(registry.isModuleEnabled('formulation'));
   // Should return true
   ```

**Files to examine:**
- `/src/lib/modules/registry.ts`
- `/src/lib/modules/moduleContext.tsx`

### 1.2. Theme System

**Test procedure:**
1. Start the application with default settings
2. In the UI, locate the theme toggle button
3. Verify theme switching between 'hackers', 'dystopia', and 'neotopia'
4. Refresh the page and ensure theme persistence
5. Check system theme detection by changing OS theme preference

**Files to examine:**
- `/src/providers/FixedThemeProvider.tsx`
- `/src/components/ThemeScript.tsx`
- `/src/types/theme.ts`

### 1.3. Authentication System

**Test procedure:**
1. Check automatic development login (if enabled)
2. Test login form with sample credentials
3. Verify session persistence across page refresh
4. Test logout functionality
5. Verify protected route redirects

**Files to examine:**
- `/src/providers/AuthProvider.tsx`
- `/src/hooks/useAuth.ts`
- `/src/hooks/useProtectedRoute.ts`

## 2. Component Tests

### 2.1. Navigation Components

**Test procedure:**
1. Verify navigation items correspond to enabled modules
2. Test navigation item click events
3. Verify active state of navigation items based on current route

**Files to examine:**
- `/src/components/Navigation.tsx`
- `/src/components/ModuleNavigation.tsx`

### 2.2. Formulation Components

**Test procedure:**
1. Create a new formulation
2. Edit existing formulation
3. Test ingredient selection and quantity adjustments
4. Verify proper formulation storage and retrieval

**Files to examine:**
- `/src/components/FormulationForm.tsx`
- `/src/components/IngredientSelector.tsx`
- `/src/hooks/useFormulation.ts`

### 2.3. Recipe Components

**Test procedure:**
1. Navigate to recipe listing
2. Test recipe filtering and sorting
3. Open recipe details and verify correct rendering
4. Test recipe iteration functionality

**Files to examine:**
- `/src/components/RecipeList.tsx`
- `/src/components/RecipeDetails.tsx`
- `/src/components/RecipeIteration.tsx`

## 3. Integration Tests

### 3.1. Data Flow

**Test procedure:**
1. Create test data using the API or UI
2. Verify data persistence across different views
3. Test optimistic UI updates during data operations
4. Verify proper error handling for failed operations

**Files to examine:**
- `/src/lib/hooks/useDataEntity.ts`
- `/src/lib/hooks/useDataCollection.ts`
- `/src/lib/hooks/useOptimisticUpdates.ts`

### 3.2. End-to-End Workflows

**Test procedures:**
1. **Formula creation workflow:**
   - Navigate to formulation view
   - Create new formulation
   - Add ingredients
   - Save formulation
   - Verify it appears in the list

2. **Recipe experimentation workflow:**
   - Select existing recipe
   - Create new iteration
   - Modify ingredients
   - Save iteration
   - Compare iterations

3. **Settings and profile workflow:**
   - Open settings panel
   - Change user preferences
   - Verify persistence
   - Update profile information if applicable

## 4. Performance Testing

### 4.1. Rendering Performance

**Test procedure:**
1. Use React DevTools Profiler to measure component render times
2. Check for unnecessary re-renders
3. Verify memoization effectiveness for heavy components

**Files to examine:**
- `/src/components/performance/MemoizedFormulationList.tsx`
- `/src/components/performance/VirtualizedList.tsx`

### 4.2. Data Loading Performance

**Test procedure:**
1. Measure initial data loading time
2. Test with progressively larger datasets (10, 100, 1000 items)
3. Verify pagination or virtualization functioning correctly

## 5. Regression Testing

### 5.1. Automated Tests

**Run all existing test suites:**
```bash
cd /path/to/modern-diy-recipes
npm test
```

### 5.2. Visual Regression

**Test procedure:**
1. Run the previously captured Puppeteer screenshots test
2. Compare against baseline screenshots
3. Document any visual differences

## 6. Documentation

Throughout the testing process, maintain a log of:
- Discovered bugs and issues
- Performance metrics
- Visual inconsistencies
- Suggested improvements

The final output should include:
1. A comprehensive test report
2. List of resolved and unresolved issues
3. Recommendations for future improvements

## Testing Environment Setup

For consistent testing:

```bash
# Start with clean state
cd /path/to/modern-diy-recipes
./server.sh --stop
./server.sh --clean

# Start server with needed configurations
./server.sh --with-api --with-font-server
```

**Alternative if connectivity issues persist:**
```bash
# Build for production
npm run build

# Use a static server to serve the built files
npx serve out -p 8080
```

## Test Data Setup

Use the following scripts to set up consistent test data:

```bash
# If available in the project
node setup-test-data.js

# Or manually create entries via API
curl -X POST http://localhost:3000/api/formulations -H "Content-Type: application/json" -d '{
  "name": "Test Formulation",
  "description": "For testing purposes",
  "ingredients": [{"id": 1, "quantity": 100}, {"id": 2, "quantity": 50}]
}'
```