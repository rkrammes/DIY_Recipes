# DIY Recipes UI.js Refactoring Plan

## Goals
- Split large `js/ui.js` (~1500 lines) into smaller, maintainable modules
- Improve separation of concerns (auth, recipes, ingredients, iteration)
- Create reusable UI components and utility functions
- Reduce duplicate code
- Enhance readability, naming consistency, and documentation

---

## Proposed Module Breakdown

### 1. `auth-ui.js`
- Auth state change handling
- Login/logout button logic
- Magic link form handling
- Calls `updateAuthButton`, `setEditModeFields`
- Shows notifications on login events

### 2. `recipe-list-ui.js`
- Render recipe list (`renderRecipes`)
- Recipe list click handling (load recipe details, update right column)
- Manage recipe selection state

### 3. `global-ingredient-ui.js`
- Render global ingredients (`renderGlobalIngredients`)
- Add new global ingredient (prompt, API call, reload)
- Global ingredient list click handling (future enhancements)

### 4. `recipe-details-ui.js`
- Show recipe details (`showRecipeDetails`)
- Render recipe ingredients table
- Create editable ingredient rows
- Update recipe stats

### 5. `iteration-ui.js`
- Setup iteration editing (`setupIterationFunctionality`)
- Commit iteration (`doCommitIteration`)
- Handle ingredient add/remove in iteration table

### 6. `ui-utils.js`
- `window.showNotification`
- `safeSetText`
- Other reusable DOM helpers

### 7. `app-init.js`
- Initialize all UI modules
- Wire up event listeners
- Manage global UI state and orchestration

---

## Additional Improvements

- **Reusable Components:** Ingredient rows, notification banners, loading indicators
- **Separation of Concerns:** Keep DOM manipulation separate from data fetching/business logic (which stays in `api.js`)
- **Naming:** Use clear, consistent, descriptive function and variable names
- **Documentation:** Add JSDoc comments for all exported functions
- **State Management:** Minimize global variables; encapsulate shared state in modules or pass explicitly
- **Duplication:** Extract common code for UI updates, error handling, notifications

---

## Implementation Steps

1. Create module skeletons with exports
2. Move related functions into modules
3. Extract reusable utilities/components
4. Refactor event listeners into relevant modules
5. Encapsulate or pass shared state
6. Add JSDoc comments
7. Test thoroughly to ensure no loss of functionality
8. Remove legacy UI.js after migration

---

## Summary

This modular approach improves maintainability, readability, and testability of the UI codebase, ensuring clear separation of concerns and easier future enhancements.